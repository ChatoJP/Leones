import { chromium } from "playwright";

const B = "http://localhost:5173";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
const email = `test-${Date.now()}@leones.dev`;

// 1. register
await page.goto(`${B}/register`, { waitUntil: "networkidle" });
await page.fill('input[autocomplete="name"]', "Test Lioness");
await page.fill('input[autocomplete="email"]', email);
await page.fill('input[autocomplete="new-password"]', "supersecret1");
await page.click('button:has-text("Create my account")');
await page.waitForSelector("text=Hi, Test");
console.log("register: OK ->", email);

// 2. session survives refresh
await page.reload({ waitUntil: "networkidle" });
await page.waitForSelector("text=Hi, Test");
console.log("session persistence: OK");

// 3. add to cart from home (hero CTA = pH Gloss) + drop card
await page.goto(B, { waitUntil: "networkidle" });
await page.click('button:has-text("Get pH Gloss")');
await page.locator("#drop").scrollIntoViewIfNeeded();
await page.waitForTimeout(800);
await page.locator('button:has-text("+ Bag")').nth(1).click(); // Crystal Lip Oil
await page.waitForTimeout(300);
const bagCount = await page.locator("nav a[href='/cart'] span").innerText();
console.log("cart count after 2 adds:", bagCount);

// 4. cart page: qty controls
await page.goto(`${B}/cart`, { waitUntil: "networkidle" });
await page.waitForSelector("text=Your bag");
await page.locator('button[aria-label="increase"]').first().click();
await page.waitForTimeout(300);
const subtotal = await page.locator("text=Subtotal").locator("..").innerText();
console.log("cart after qty increase:", subtotal.replace(/\n/g, " "));

// 5. checkout
await page.click('a:has-text("Checkout")');
await page.waitForSelector("text=Delivery details");
await page.fill('input[autocomplete="tel"]', "+351 912 345 678");
await page.fill('input[autocomplete="street-address"]', "Rua das Flores 12");
await page.fill('input[autocomplete="address-level2"]', "Lisboa");
await page.fill('input[autocomplete="postal-code"]', "1200-192");
await page.click('button:has-text("Pay now")');

// 6. dev payment simulator
await page.waitForSelector("text=Payment simulator", { timeout: 15000 });
console.log("dev-pay page reached");
await page.click('button:has-text("Simulate successful payment")');

// 7. success page
await page.waitForSelector("text=Obrigada pela tua compra", { timeout: 15000 });
const orderId = await page.locator(".font-display.mt-4").innerText();
console.log("success page: OK, order", orderId);
await page.waitForTimeout(1000);
const bagAfter = await page.locator("nav a[href='/cart'] span").innerText();
console.log("cart cleared after payment:", bagAfter === "0" ? "OK" : `FAIL (${bagAfter})`);
await page.screenshot({ path: "e2e-success.png" });

// 8. account orders shows the paid order
await page.goto(`${B}/account/orders`, { waitUntil: "networkidle" });
await page.waitForSelector(`text=${orderId}`);
console.log("account orders: OK");

// 9. admin denied for normal user
await page.goto(`${B}/admin/orders`, { waitUntil: "networkidle" });
await page.waitForSelector("text=Not authorized");
console.log("admin denied for non-admin: OK");

// 10. admin allowed for ADMIN_EMAILS user
const adminEmail = "jorge.manuel.granja@gmail.com";
const reg = await page.request.post(`${B}/api/auth/register`, {
  data: { name: "Jorge Admin", email: adminEmail, password: "adminsecret1" },
});
if (!reg.ok()) {
  await page.request.post(`${B}/api/auth/login`, { data: { email: adminEmail, password: "adminsecret1" } });
}
await page.goto(`${B}/admin/orders`, { waitUntil: "networkidle" });
await page.waitForSelector("text=Orders · Admin");
await page.waitForSelector(`text=${orderId}`);
console.log("admin orders view: OK");
await page.screenshot({ path: "e2e-admin.png" });

// 11. empty-cart checkout redirect
await page.goto(`${B}/checkout`, { waitUntil: "networkidle" });
await page.waitForSelector("text=Nothing here yet");
console.log("empty-cart checkout redirect: OK");

// 12. server-side price validation (tampered request)
const tampered = await page.request.post(`${B}/api/checkout`, {
  data: {
    items: [{ sku: "LN-LIP-001", qty: 999 }],
    customer: { name: "X", email: "x@x.pt", phone: "1", address: "a", city: "b", postalCode: "c", country: "d" },
  },
});
console.log("tampered qty rejected:", tampered.status() === 400 ? "OK" : `FAIL (${tampered.status()})`);

console.log("PAGE ERRORS:", JSON.stringify(errors));
await browser.close();
