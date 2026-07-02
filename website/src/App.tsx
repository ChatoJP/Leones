import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { AuthProvider } from "./context/AuthContext";
import { I18nProvider } from "./lib/i18n";
import { CartProvider } from "./context/CartContext";
import AnnouncementBar from "./components/AnnouncementBar";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import Newsletter from "./components/Newsletter";
import { BackToTop, MascotPeek, ScrollProgress, SparkleTrail } from "./components/FunLayer";
import FindJelly from "./components/FindJelly";
import PartyMode from "./components/PartyMode";
import Home from "./pages/Home";

const Product = lazy(() => import("./pages/Product"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const CheckoutResult = lazy(() => import("./pages/CheckoutResult").then((m) => ({ default: m.CheckoutSuccess })));
const CheckoutCancelPage = lazy(() => import("./pages/CheckoutResult").then((m) => ({ default: m.CheckoutCancel })));
const DevPay = lazy(() => import("./pages/DevPay"));
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const Account = lazy(() => import("./pages/account/Account"));
const AccountOrders = lazy(() => import("./pages/account/Orders"));
const AdminOrders = lazy(() => import("./pages/admin/Orders"));
const Club = lazy(() => import("./pages/Club"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Privacy = lazy(() => import("./pages/Legal").then((m) => ({ default: m.Privacy })));
const Terms = lazy(() => import("./pages/Legal").then((m) => ({ default: m.Terms })));
const ShippingReturns = lazy(() => import("./pages/Legal").then((m) => ({ default: m.ShippingReturns })));
const Contact = lazy(() => import("./pages/Legal").then((m) => ({ default: m.Contact })));
const World = lazy(() => import("./pages/World"));
const Track = lazy(() => import("./pages/Track"));
const AdminStats = lazy(() => import("./pages/admin/Stats"));
const AdminRewards = lazy(() => import("./pages/admin/Rewards"));
const AdminExpeditions = lazy(() => import("./pages/admin/BackOffice").then((m) => ({ default: m.AdminExpeditions })));
const AdminCosts = lazy(() => import("./pages/admin/BackOffice").then((m) => ({ default: m.AdminCosts })));
const AdminSuppliers = lazy(() => import("./pages/admin/BackOffice").then((m) => ({ default: m.AdminSuppliers })));
const BloopBooks = lazy(() => import("./pages/BloopBooks"));
const BloopBookReader = lazy(() => import("./pages/BloopBookReader"));
const GlossLab = lazy(() => import("./pages/GlossLab"));
const AdminContent = lazy(() => import("./pages/admin/Content"));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  // first-party, cookie-less pageview beacon
  useEffect(() => {
    fetch("/api/metrics/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);
  return null;
}

function PageLoader() {
  return (
    <div className="flex min-h-[50svh] items-center justify-center">
      <span className="animate-pulse font-display text-2xl font-semibold text-pink-deep">✦</span>
    </div>
  );
}

export default function App() {
  return (
    <I18nProvider>
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <ScrollToTop />
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-ink focus:px-5 focus:py-2 focus:font-bold focus:text-cloud"
          >
            Skip to content
          </a>
          <ScrollProgress />
          <SparkleTrail />
          <div className="flex min-h-svh flex-col">
            <AnnouncementBar />
            <Nav />
            <main id="main" className="flex-1">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/products/:slug" element={<Product />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/checkout/success" element={<CheckoutResult />} />
                  <Route path="/checkout/cancel" element={<CheckoutCancelPage />} />
                  <Route path="/dev-pay" element={<DevPay />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/account" element={<Account />} />
                  <Route path="/account/orders" element={<AccountOrders />} />
                  <Route path="/admin/orders" element={<AdminOrders />} />
                  <Route path="/club" element={<Club />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/shipping-returns" element={<ShippingReturns />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/world" element={<World />} />
                  <Route path="/track" element={<Track />} />
                  <Route path="/admin/stats" element={<AdminStats />} />
                  <Route path="/admin/rewards" element={<AdminRewards />} />
                  <Route path="/admin/expeditions" element={<AdminExpeditions />} />
                  <Route path="/admin/costs" element={<AdminCosts />} />
                  <Route path="/admin/suppliers" element={<AdminSuppliers />} />
                  <Route path="/admin/content" element={<AdminContent />} />
                  <Route path="/bloop-books" element={<BloopBooks />} />
                  <Route path="/bloop-books/:slug" element={<BloopBookReader />} />
                  <Route path="/lab" element={<GlossLab />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </main>
            <Newsletter />
            <Footer />
          </div>
          <MascotPeek />
          <BackToTop />
          <FindJelly />
          <PartyMode />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
    </I18nProvider>
  );
}
