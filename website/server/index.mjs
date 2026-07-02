import express from "express";
import cookieParser from "cookie-parser";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import db from "./db.mjs";

const ROOT = dirname(fileURLToPath(import.meta.url));
const catalog = JSON.parse(readFileSync(join(ROOT, "..", "shared", "catalog.json"), "utf8"));

const PORT = Number(process.env.PORT ?? 4242);
const APP_URL = process.env.APP_URL ?? "http://localhost:5173";
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "jorge.manuel.granja@gmail.com")
  .split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
const SHIPPING_FLAT = Number(process.env.SHIPPING_FLAT ?? catalog.shipping.flat);
const FREE_SHIPPING_OVER = Number(process.env.FREE_SHIPPING_OVER ?? catalog.shipping.freeOver);
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY ?? "";
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";

let stripe = null;
if (STRIPE_SECRET_KEY) {
  const { default: Stripe } = await import("stripe");
  stripe = new Stripe(STRIPE_SECRET_KEY);
  console.log("[payments] Stripe enabled");
} else {
  console.log("[payments] STRIPE_SECRET_KEY not set — using local DEV payment simulator");
}

// seed live stock from the catalog once; after that the DB is authoritative
const seedStock = db.prepare("INSERT INTO stock (sku, quantity) VALUES (?, ?) ON CONFLICT(sku) DO NOTHING");
for (const p of catalog.products) seedStock.run(p.sku, p.stock ?? 0);
const getStock = (sku) => db.prepare("SELECT quantity FROM stock WHERE sku = ?").get(sku)?.quantity ?? 0;
const bundles = catalog.bundles ?? [];
const getBundle = (sku) => bundles.find((b) => b.sku === sku && b.active);
const bundleStock = (b) => Math.min(...b.items.map((sku) => getStock(sku)));

function decrementStockForOrder(orderRowId) {
  const items = db.prepare("SELECT sku, quantity FROM order_items WHERE order_id = ?").all(orderRowId);
  const dec = db.prepare("UPDATE stock SET quantity = MAX(0, quantity - ?) WHERE sku = ?");
  for (const it of items) {
    const bundle = getBundle(it.sku);
    if (bundle) {
      for (const componentSku of bundle.items) dec.run(it.quantity, componentSku);
    } else {
      dec.run(it.quantity, it.sku);
    }
  }
}

const app = express();

/* ---------- stripe webhook needs the raw body, registered before json() ---------- */
app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), (req, res) => {
  if (!stripe || !STRIPE_WEBHOOK_SECRET) return res.status(400).send("webhook not configured");
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers["stripe-signature"], STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook signature verification failed: ${err.message}`);
  }
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;
    if (orderId && session.payment_status === "paid") {
      const info = db.prepare("UPDATE orders SET payment_status='paid', order_status='processing', payment_ref=? WHERE public_id=? AND payment_status='pending'")
        .run(session.id, orderId);
      if (info.changes > 0) {
        const row = db.prepare("SELECT id FROM orders WHERE public_id = ?").get(orderId);
        if (row) decrementStockForOrder(row.id);
      }
      console.log(`[webhook] order ${orderId} marked paid`);
      // TODO(email): send order confirmation to customer + notification to store owner.
    }
  }
  if (event.type === "checkout.session.expired") {
    const orderId = event.data.object.metadata?.orderId;
    if (orderId) {
      db.prepare("UPDATE orders SET payment_status='cancelled', order_status='cancelled' WHERE public_id=? AND payment_status='pending'").run(orderId);
    }
  }
  res.json({ received: true });
});

app.use(express.json());
app.use(cookieParser());

/* ---------------- auth helpers ---------------- */

const hashPassword = (pw) => {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(pw, salt, 64).toString("hex")}`;
};
const verifyPassword = (pw, stored) => {
  const [salt, hash] = stored.split(":");
  const candidate = scryptSync(pw, salt, 64);
  return timingSafeEqual(candidate, Buffer.from(hash, "hex"));
};

const SESSION_DAYS = 30;

function createSession(res, userId) {
  const sid = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + SESSION_DAYS * 864e5);
  db.prepare("INSERT INTO sessions (id, user_id, expires_at) VALUES (?,?,?)").run(sid, userId, expires.toISOString());
  res.cookie("sid", sid, { httpOnly: true, sameSite: "lax", expires, path: "/" });
}

function currentUser(req) {
  const sid = req.cookies?.sid;
  if (!sid) return null;
  const row = db.prepare(
    "SELECT u.id, u.email, u.name, u.created_at FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.id = ? AND s.expires_at > datetime('now')"
  ).get(sid);
  return row ?? null;
}

const requireAuth = (req, res, next) => {
  const user = currentUser(req);
  if (!user) return res.status(401).json({ error: "Not signed in" });
  req.user = user;
  next();
};

const requireAdmin = (req, res, next) => {
  const user = currentUser(req);
  if (!user || !ADMIN_EMAILS.includes(user.email.toLowerCase())) {
    return res.status(403).json({ error: "Not authorized" });
  }
  req.user = user;
  next();
};

const isValidEmail = (e) => typeof e === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

/* ---------------- auth routes ---------------- */

app.post("/api/auth/register", (req, res) => {
  const { name, email, password } = req.body ?? {};
  if (!name || typeof name !== "string" || name.trim().length < 2) return res.status(400).json({ error: "Please tell us your name." });
  if (!isValidEmail(email)) return res.status(400).json({ error: "That email doesn't look right." });
  if (!password || password.length < 8) return res.status(400).json({ error: "Password needs at least 8 characters." });
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email.toLowerCase());
  if (existing) return res.status(409).json({ error: "That email already has an account. Try signing in." });
  const info = db.prepare("INSERT INTO users (email, name, password_hash) VALUES (?,?,?)")
    .run(email.toLowerCase(), name.trim(), hashPassword(password));
  createSession(res, info.lastInsertRowid);
  res.json({ user: { id: info.lastInsertRowid, email: email.toLowerCase(), name: name.trim() } });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body ?? {};
  if (!isValidEmail(email) || !password) return res.status(400).json({ error: "Email and password are required." });
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase());
  if (!user || !verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ error: "Email or password is incorrect." });
  }
  createSession(res, user.id);
  res.json({ user: { id: user.id, email: user.email, name: user.name } });
});

app.post("/api/auth/logout", (req, res) => {
  const sid = req.cookies?.sid;
  if (sid) db.prepare("DELETE FROM sessions WHERE id = ?").run(sid);
  res.clearCookie("sid", { path: "/" });
  res.json({ ok: true });
});

app.get("/api/auth/me", (req, res) => {
  res.json({ user: currentUser(req) });
});

app.post("/api/auth/forgot", (req, res) => {
  const { email } = req.body ?? {};
  if (!isValidEmail(email)) return res.status(400).json({ error: "That email doesn't look right." });
  const user = db.prepare("SELECT id FROM users WHERE email = ?").get(email.toLowerCase());
  if (user) {
    const token = randomBytes(32).toString("hex");
    db.prepare("INSERT INTO reset_tokens (token, user_id, expires_at) VALUES (?,?,datetime('now','+1 hour'))").run(token, user.id);
    // TODO(email): send this link by email. No SMTP configured yet, so it is logged
    // server-side only (dev). Never return the token in the API response in production.
    console.log(`[password reset] ${email} -> ${APP_URL}/forgot-password?token=${token}`);
  }
  // Always the same response — do not reveal whether the email exists.
  res.json({ ok: true, message: "If that email has an account, a reset link is on its way." });
});

app.post("/api/auth/reset", (req, res) => {
  const { token, password } = req.body ?? {};
  if (!token || !password || password.length < 8) return res.status(400).json({ error: "Password needs at least 8 characters." });
  const row = db.prepare("SELECT * FROM reset_tokens WHERE token = ? AND used = 0 AND expires_at > datetime('now')").get(token);
  if (!row) return res.status(400).json({ error: "This reset link is invalid or expired." });
  db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hashPassword(password), row.user_id);
  db.prepare("UPDATE reset_tokens SET used = 1 WHERE token = ?").run(token);
  db.prepare("DELETE FROM sessions WHERE user_id = ?").run(row.user_id);
  res.json({ ok: true });
});

app.post("/api/account/profile", requireAuth, (req, res) => {
  const { name } = req.body ?? {};
  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return res.status(400).json({ error: "Please tell us your name." });
  }
  db.prepare("UPDATE users SET name = ? WHERE id = ?").run(name.trim(), req.user.id);
  res.json({ ok: true, name: name.trim() });
});

app.post("/api/account/password", requireAuth, (req, res) => {
  const { current, next } = req.body ?? {};
  if (!next || next.length < 8) return res.status(400).json({ error: "New password needs at least 8 characters." });
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
  if (!verifyPassword(current ?? "", user.password_hash)) {
    return res.status(401).json({ error: "Current password is incorrect." });
  }
  db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hashPassword(next), req.user.id);
  res.json({ ok: true });
});

app.get("/api/account/last-address", requireAuth, (req, res) => {
  const row = db.prepare(
    "SELECT customer_name, email, phone, address, city, postal_code, country FROM orders WHERE user_id = ? ORDER BY id DESC LIMIT 1"
  ).get(req.user.id);
  if (!row) return res.json({ address: null });
  res.json({
    address: {
      name: row.customer_name, email: row.email, phone: row.phone,
      address: row.address, city: row.city, postalCode: row.postal_code, country: row.country,
    },
  });
});

/* ---------------- catalog ---------------- */

app.get("/api/catalog", (_req, res) => {
  const products = catalog.products.map((p) => ({ ...p, stock: getStock(p.sku) }));
  const bundleList = bundles.map((b) => ({ ...b, stock: bundleStock(b) }));
  res.json({ currency: catalog.currency, shipping: { flat: SHIPPING_FLAT, freeOver: FREE_SHIPPING_OVER }, products, bundles: bundleList });
});

/* ---------------- checkout ---------------- */

function buildOrderPayload(items) {
  if (!Array.isArray(items) || items.length === 0) return { error: "Your bag is empty." };
  const lines = [];
  for (const it of items) {
    const qty = Number.isInteger(it?.qty) ? it.qty : 0;
    if (qty < 1 || qty > 50) return { error: "Invalid quantity." };
    const bundle = getBundle(it.sku);
    if (bundle) {
      const available = bundleStock(bundle);
      if (qty > available) {
        return { error: available === 0
          ? `${bundle.name} just sold out.`
          : `Only ${available} of ${bundle.name} left — please adjust the quantity.` };
      }
      lines.push({ sku: bundle.sku, name: bundle.name, price: bundle.price, quantity: qty, image: bundle.image });
      continue;
    }
    const product = catalog.products.find((p) => p.sku === it.sku && p.active);
    if (!product) return { error: `Unknown product: ${it?.sku}` };
    const available = getStock(product.sku);
    if (qty > available) {
      return { error: available === 0
        ? `${product.name} just sold out.`
        : `Only ${available} of ${product.name} left — please adjust the quantity.` };
    }
    lines.push({ sku: product.sku, name: product.name, price: product.price, quantity: qty, image: product.image });
  }
  const subtotal = Math.round(lines.reduce((s, l) => s + l.price * l.quantity, 0) * 100) / 100;
  const shipping = subtotal >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FLAT;
  const total = Math.round((subtotal + shipping) * 100) / 100;
  return { lines, subtotal, shipping, total };
}

app.post("/api/checkout", async (req, res) => {
  const { items, customer } = req.body ?? {};
  const required = ["name", "email", "phone", "address", "city", "postalCode", "country"];
  for (const f of required) {
    if (!customer?.[f] || typeof customer[f] !== "string" || !customer[f].trim()) {
      return res.status(400).json({ error: "Please fill in all the required fields." });
    }
  }
  if (!isValidEmail(customer.email)) return res.status(400).json({ error: "That email doesn't look right." });

  const payload = buildOrderPayload(items);
  if (payload.error) return res.status(400).json({ error: payload.error });

  const user = currentUser(req);
  const publicId = `LN-${Date.now().toString(36).toUpperCase()}${randomBytes(2).toString("hex").toUpperCase()}`;

  const info = db.prepare(`
    INSERT INTO orders (public_id, user_id, guest_email, customer_name, email, phone, address, city, postal_code, country, notes,
                        subtotal, shipping, total, currency, payment_provider)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(
    publicId, user?.id ?? null, user ? null : customer.email.toLowerCase(),
    customer.name.trim(), customer.email.toLowerCase(), customer.phone.trim(),
    customer.address.trim(), customer.city.trim(), customer.postalCode.trim(), customer.country.trim(),
    (customer.notes ?? "").trim() || null,
    payload.subtotal, payload.shipping, payload.total, catalog.currency,
    stripe ? "stripe" : "dev-simulator"
  );
  const insertItem = db.prepare("INSERT INTO order_items (order_id, sku, name, price, quantity, image) VALUES (?,?,?,?,?,?)");
  for (const l of payload.lines) insertItem.run(info.lastInsertRowid, l.sku, l.name, l.price, l.quantity, l.image);

  if (stripe) {
    try {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: customer.email.toLowerCase(),
        line_items: [
          ...payload.lines.map((l) => ({
            price_data: {
              currency: catalog.currency.toLowerCase(),
              product_data: { name: l.name, metadata: { sku: l.sku } },
              unit_amount: Math.round(l.price * 100),
            },
            quantity: l.quantity,
          })),
          ...(payload.shipping > 0
            ? [{
                price_data: {
                  currency: catalog.currency.toLowerCase(),
                  product_data: { name: "Shipping" },
                  unit_amount: Math.round(payload.shipping * 100),
                },
                quantity: 1,
              }]
            : []),
        ],
        metadata: { orderId: publicId },
        success_url: `${APP_URL}/checkout/success?order=${publicId}`,
        cancel_url: `${APP_URL}/checkout/cancel?order=${publicId}`,
      });
      db.prepare("UPDATE orders SET payment_ref = ? WHERE public_id = ?").run(session.id, publicId);
      return res.json({ url: session.url, orderId: publicId });
    } catch (err) {
      console.error("[stripe]", err.message);
      db.prepare("UPDATE orders SET payment_status='failed' WHERE public_id = ?").run(publicId);
      return res.status(502).json({ error: "Payment could not be started. Please try again." });
    }
  }

  // DEV simulator: local page that lets you approve/cancel the payment.
  res.json({ url: `${APP_URL}/dev-pay?order=${publicId}`, orderId: publicId });
});

/* DEV-ONLY payment confirmation (acts as the "webhook" for the simulator). */
app.post("/api/dev/confirm-payment", (req, res) => {
  if (stripe) return res.status(404).json({ error: "Not available when Stripe is configured." });
  const { orderId, outcome } = req.body ?? {};
  const order = db.prepare("SELECT * FROM orders WHERE public_id = ?").get(orderId ?? "");
  if (!order) return res.status(404).json({ error: "Order not found." });
  if (order.payment_status !== "pending") return res.status(409).json({ error: "Order already resolved." });
  if (outcome === "paid") {
    db.prepare("UPDATE orders SET payment_status='paid', order_status='processing', payment_ref=? WHERE id=?")
      .run(`dev-${randomBytes(6).toString("hex")}`, order.id);
    decrementStockForOrder(order.id);
    // TODO(email): order confirmation + admin notification (no SMTP configured).
  } else {
    db.prepare("UPDATE orders SET payment_status='cancelled', order_status='cancelled' WHERE id=?").run(order.id);
  }
  res.json({ ok: true });
});

/* ---------------- orders ---------------- */

const orderItems = (orderId) =>
  db.prepare("SELECT sku, name, price, quantity, image FROM order_items WHERE order_id = ?").all(orderId);

const publicOrder = (o) => ({
  id: o.public_id,
  customerName: o.customer_name,
  email: o.email,
  subtotal: o.subtotal,
  shipping: o.shipping,
  total: o.total,
  currency: o.currency,
  paymentStatus: o.payment_status,
  orderStatus: o.order_status,
  createdAt: o.created_at,
  items: orderItems(o.id),
});

app.get("/api/orders/:publicId", (req, res) => {
  const order = db.prepare("SELECT * FROM orders WHERE public_id = ?").get(req.params.publicId);
  if (!order) return res.status(404).json({ error: "Order not found." });
  // guests may look up their own fresh order via the success/cancel redirect
  res.json({ order: publicOrder(order) });
});

app.get("/api/account/orders", requireAuth, (req, res) => {
  const rows = db.prepare("SELECT * FROM orders WHERE user_id = ? OR email = ? ORDER BY id DESC").all(req.user.id, req.user.email);
  res.json({ orders: rows.map(publicOrder) });
});

/* ---------------- newsletter ---------------- */

app.post("/api/newsletter", (req, res) => {
  const { email, lang, interest } = req.body ?? {};
  if (!isValidEmail(email)) return res.status(400).json({ error: "That email doesn't look right." });
  const tag = interest === "plush" ? "plush" : null;
  db.prepare("INSERT INTO newsletter (email, lang, interest) VALUES (?, ?, ?) ON CONFLICT(email) DO UPDATE SET interest = COALESCE(excluded.interest, interest)")
    .run(email.toLowerCase(), lang === "pt" ? "pt" : "en", tag);
  // TODO(email): double opt-in confirmation before launch (GDPR).
  res.json({ ok: true });
});

/* ---------------- guest order tracking ---------------- */

app.get("/api/track", (req, res) => {
  const { order, email } = req.query;
  if (!order || !isValidEmail(String(email ?? ""))) {
    return res.status(400).json({ error: "Order number and email are required." });
  }
  const row = db.prepare("SELECT * FROM orders WHERE public_id = ? AND email = ?")
    .get(String(order).trim().toUpperCase(), String(email).toLowerCase());
  if (!row) return res.status(404).json({ error: "No order found for that combination." });
  res.json({ order: publicOrder(row) });
});

/* ---------------- first-party, cookie-less pageview metrics ---------------- */

const ALLOWED_PATHS = /^\/($|products\/|cart$|checkout|club$|world$|login$|register$|track$)/;

app.post("/api/metrics/view", (req, res) => {
  const path = String(req.body?.path ?? "");
  if (ALLOWED_PATHS.test(path) && path.length < 80) {
    db.prepare(`INSERT INTO pageviews (path, day, views) VALUES (?, date('now'), 1)
                ON CONFLICT(path, day) DO UPDATE SET views = views + 1`).run(path);
  }
  res.json({ ok: true });
});

app.get("/api/admin/stats", requireAdmin, (_req, res) => {
  const pages = db.prepare("SELECT path, SUM(views) AS views FROM pageviews GROUP BY path ORDER BY views DESC LIMIT 30").all();
  const days = db.prepare("SELECT day, SUM(views) AS views FROM pageviews GROUP BY day ORDER BY day DESC LIMIT 14").all();
  const orders = db.prepare("SELECT COUNT(*) AS n, COALESCE(SUM(CASE WHEN payment_status='paid' THEN total END), 0) AS revenue FROM orders WHERE payment_status='paid'").get();
  const subscribers = db.prepare("SELECT COUNT(*) AS n FROM newsletter").get();
  res.json({ pages, days, paidOrders: orders.n, revenue: orders.revenue, subscribers: subscribers.n });
});

/* ---------------- back-office: suppliers, costs, expeditions, finance ---------------- */

app.get("/api/admin/suppliers", requireAdmin, (_req, res) => {
  res.json({ suppliers: db.prepare("SELECT * FROM suppliers ORDER BY name").all() });
});

app.post("/api/admin/suppliers", requireAdmin, (req, res) => {
  const { id, name, contact, email, notes } = req.body ?? {};
  if (!name || typeof name !== "string" || !name.trim()) return res.status(400).json({ error: "Name required." });
  if (id) {
    db.prepare("UPDATE suppliers SET name=?, contact=?, email=?, notes=? WHERE id=?")
      .run(name.trim(), contact ?? null, email ?? null, notes ?? null, id);
    return res.json({ ok: true, id });
  }
  const info = db.prepare("INSERT INTO suppliers (name, contact, email, notes) VALUES (?,?,?,?)")
    .run(name.trim(), contact ?? null, email ?? null, notes ?? null);
  res.json({ ok: true, id: info.lastInsertRowid });
});

app.delete("/api/admin/suppliers/:id", requireAdmin, (req, res) => {
  db.prepare("UPDATE product_costs SET supplier_id = NULL WHERE supplier_id = ?").run(req.params.id);
  db.prepare("DELETE FROM suppliers WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

app.get("/api/admin/costs", requireAdmin, (_req, res) => {
  const costs = db.prepare("SELECT * FROM product_costs").all();
  const map = {};
  for (const c of costs) map[c.sku] = c;
  const skus = [...catalog.products.map((p) => ({ sku: p.sku, name: p.name, price: p.price })),
                ...bundles.map((b) => ({ sku: b.sku, name: b.name, price: b.price, bundle: true }))];
  res.json({ skus, costs: map });
});

app.post("/api/admin/costs", requireAdmin, (req, res) => {
  const { sku, unitCost, supplierId } = req.body ?? {};
  const known = catalog.products.some((p) => p.sku === sku) || bundles.some((b) => b.sku === sku);
  if (!known) return res.status(400).json({ error: "Unknown SKU." });
  const cost = Number(unitCost);
  if (!Number.isFinite(cost) || cost < 0) return res.status(400).json({ error: "Invalid cost." });
  db.prepare(`INSERT INTO product_costs (sku, unit_cost, supplier_id) VALUES (?,?,?)
              ON CONFLICT(sku) DO UPDATE SET unit_cost=excluded.unit_cost, supplier_id=excluded.supplier_id`)
    .run(sku, cost, supplierId ?? null);
  res.json({ ok: true });
});

function unitCostOf(sku) {
  const direct = db.prepare("SELECT unit_cost FROM product_costs WHERE sku = ?").get(sku);
  if (direct) return direct.unit_cost;
  const bundle = getBundle(sku);
  if (bundle) {
    return bundle.items.reduce((sum, s) => sum + (db.prepare("SELECT unit_cost FROM product_costs WHERE sku = ?").get(s)?.unit_cost ?? 0), 0);
  }
  return 0;
}

app.post("/api/admin/orders/:publicId/shipment", requireAdmin, (req, res) => {
  const { carrier, tracking, shippingCost } = req.body ?? {};
  if (!carrier || !tracking) return res.status(400).json({ error: "Carrier and tracking required." });
  const cost = shippingCost === undefined || shippingCost === "" ? null : Number(shippingCost);
  if (cost !== null && (!Number.isFinite(cost) || cost < 0)) return res.status(400).json({ error: "Invalid shipping cost." });
  const info = db.prepare(`UPDATE orders SET carrier=?, tracking=?, shipping_cost=?, order_status='shipped', shipped_at=datetime('now')
                           WHERE public_id=? AND payment_status='paid'`)
    .run(String(carrier).trim(), String(tracking).trim(), cost, req.params.publicId);
  if (info.changes === 0) return res.status(404).json({ error: "Paid order not found." });
  res.json({ ok: true });
});

app.get("/api/admin/finance", requireAdmin, (_req, res) => {
  const paid = db.prepare("SELECT * FROM orders WHERE payment_status='paid' ORDER BY id DESC").all();
  let revenue = 0, cogs = 0, shipCharged = 0, shipPaid = 0;
  const perOrder = paid.map((o) => {
    const items = db.prepare("SELECT sku, quantity, price FROM order_items WHERE order_id = ?").all(o.id);
    const orderCogs = items.reduce((s, it) => s + unitCostOf(it.sku) * it.quantity, 0);
    revenue += o.total;
    cogs += orderCogs;
    shipCharged += o.shipping;
    shipPaid += o.shipping_cost ?? 0;
    return {
      id: o.public_id, total: o.total, cogs: Math.round(orderCogs * 100) / 100,
      shippingCharged: o.shipping, shippingPaid: o.shipping_cost,
      profit: Math.round((o.total - orderCogs - (o.shipping_cost ?? 0)) * 100) / 100,
      status: o.order_status, carrier: o.carrier, tracking: o.tracking, shippedAt: o.shipped_at,
      createdAt: o.created_at, customer: o.customer_name,
    };
  });
  const grossProfit = Math.round((revenue - cogs - shipPaid) * 100) / 100;
  res.json({
    revenue: Math.round(revenue * 100) / 100,
    cogs: Math.round(cogs * 100) / 100,
    shippingCharged: Math.round(shipCharged * 100) / 100,
    shippingPaid: Math.round(shipPaid * 100) / 100,
    grossProfit,
    marginPct: revenue > 0 ? Math.round((grossProfit / revenue) * 1000) / 10 : 0,
    orders: perOrder,
  });
});

/* ---------------- bloop book club ---------------- */

const BOOK_SLUGS = ["gloss-that-ran-away", "pink-cloud-adventure", "secret-jellyboop-club", "share-the-sparkle", "honest-reader-challenge"];

// public: which rewards are actually active (never promise inactive rewards)
app.get("/api/bookclub/rewards", (_req, res) => {
  const rows = db.prepare("SELECT book, reward_type, reward_value FROM reward_rules WHERE active = 1").all();
  const map = {};
  for (const r of rows) map[r.book] = { type: r.reward_type, value: r.reward_value };
  res.json({ rewards: map });
});

// parent confirmation ("Bloop may ask your parents 😄")
app.post("/api/bookclub/confirm", (req, res) => {
  const { book, childName, parentEmail } = req.body ?? {};
  if (!BOOK_SLUGS.includes(book)) return res.status(400).json({ error: "Unknown book." });
  if (!isValidEmail(parentEmail)) return res.status(400).json({ error: "Parent email doesn't look right." });
  db.prepare("INSERT INTO book_confirmations (book, child_name, parent_email) VALUES (?,?,?)")
    .run(book, (childName ?? "").trim().slice(0, 40) || null, parentEmail.toLowerCase());
  // TODO(email): send confirmation request to the parent before launch.
  res.json({ ok: true });
});

// admin: view + configure reward rules
app.get("/api/admin/rewards", requireAdmin, (_req, res) => {
  const rules = db.prepare("SELECT * FROM reward_rules").all();
  const confirmations = db.prepare("SELECT book, COUNT(*) AS n FROM book_confirmations GROUP BY book").all();
  res.json({ books: BOOK_SLUGS, rules, confirmations });
});

app.post("/api/admin/rewards", requireAdmin, (req, res) => {
  const { book, rewardType, rewardValue, active } = req.body ?? {};
  if (!BOOK_SLUGS.includes(book)) return res.status(400).json({ error: "Unknown book." });
  const types = ["surprise", "sticker", "card", "discount", "gift", "gloss"];
  if (!types.includes(rewardType)) return res.status(400).json({ error: "Invalid reward type." });
  db.prepare(`INSERT INTO reward_rules (book, reward_type, reward_value, active) VALUES (?,?,?,?)
              ON CONFLICT(book) DO UPDATE SET reward_type=excluded.reward_type, reward_value=excluded.reward_value, active=excluded.active`)
    .run(book, rewardType, (rewardValue ?? "").slice(0, 120), active ? 1 : 0);
  res.json({ ok: true });
});

/* ---------------- admin ---------------- */

app.get("/api/admin/orders", requireAdmin, (_req, res) => {
  const rows = db.prepare("SELECT * FROM orders ORDER BY id DESC LIMIT 200").all();
  res.json({ orders: rows.map((o) => ({ ...publicOrder(o), phone: o.phone, address: o.address, city: o.city, postalCode: o.postal_code, country: o.country, notes: o.notes, carrier: o.carrier, tracking: o.tracking, shippedAt: o.shipped_at })) });
});

const ORDER_STATUSES = ["new", "processing", "shipped", "completed", "cancelled"];

app.post("/api/admin/orders/:publicId/status", requireAdmin, (req, res) => {
  const { status } = req.body ?? {};
  if (!ORDER_STATUSES.includes(status)) return res.status(400).json({ error: "Invalid status." });
  const info = db.prepare("UPDATE orders SET order_status = ? WHERE public_id = ?").run(status, req.params.publicId);
  if (info.changes === 0) return res.status(404).json({ error: "Order not found." });
  res.json({ ok: true });
});

app.get("/api/admin/me", (req, res) => {
  const user = currentUser(req);
  res.json({ isAdmin: !!user && ADMIN_EMAILS.includes(user.email.toLowerCase()) });
});

/* ---------------- content library (admin) ---------------- */

const CONTENT_DIR = join(ROOT, "..", "..", "content-library");

// raw files (previews, newsletter HTML) — admin only, pre-launch material
app.use("/content-library", requireAdmin, express.static(CONTENT_DIR));

app.get("/api/admin/content", requireAdmin, async (req, res) => {
  const { readdirSync, statSync } = await import("node:fs");
  const byFolder = {};
  const walk = (dir, rel) => {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      const r = rel ? `${rel}/${name}` : name;
      if (statSync(p).isDirectory()) { walk(p, r); continue; }
      const folder = rel || "(root)";
      (byFolder[folder] ??= []).push({ name, path: r, size: statSync(p).size });
    }
  };
  try {
    walk(CONTENT_DIR, "");
    res.json({ folders: byFolder });
  } catch (err) {
    res.status(500).json({ error: `content-library unavailable: ${err.message}` });
  }
});

app.listen(PORT, () => console.log(`[leones-api] listening on http://localhost:${PORT}`));
