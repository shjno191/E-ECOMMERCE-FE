import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
// import { ChatSupport } from "@/components/ChatSupport";
import { ScrollToTop } from "@/components/ScrollToTop";
import { AppInitializer } from "@/components/AppInitializer";
import { AdminLayout } from "@/layouts/AdminLayout";
import { useEffect } from "react";
import { validateStoredToken } from "@/utils/authHelpers";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderTracking from "./pages/OrderTracking";
import Orders from "./pages/Orders";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/Products";
import AdminOrders from "./pages/admin/Orders";
import AdminCustomers from "./pages/admin/Customers";
import AdminAnalytics from "./pages/admin/Analytics";
import AdminSettings from "./pages/admin/Settings";

const queryClient = new QueryClient();

const App = () => {
  // Validate stored token on app startup
  useEffect(() => {
    console.log('🚀 App starting, validating stored token...');
    validateStoredToken();
  }, []);

  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppInitializer>
          <ScrollToTop />
          <Routes>
          {/* Public Routes */}
          <Route path="/" element={
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">
                <Products />
              </main>
              <Footer />
              {/* <ChatSupport /> */}
            </div>
          } />
          <Route path="/products" element={
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">
                <Products />
              </main>
              <Footer />
              {/* <ChatSupport /> */}
            </div>
          } />
          <Route path="/product/:id" element={
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">
                <ProductDetail />
              </main>
              <Footer />
              {/* <ChatSupport /> */}
            </div>
          } />
          <Route path="/cart" element={
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">
                <Cart />
              </main>
              <Footer />
              {/* <ChatSupport /> */}
            </div>
          } />
          <Route path="/checkout" element={
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">
                <Checkout />
              </main>
              <Footer />
              {/* <ChatSupport /> */}
            </div>
          } />
          <Route path="/order/:id" element={
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">
                <OrderTracking />
              </main>
              <Footer />
              {/* <ChatSupport /> */}
            </div>
          } />
          <Route path="/orders" element={
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">
                <Orders />
              </main>
              <Footer />
              {/* <ChatSupport /> */}
            </div>
          } />
          <Route path="/auth" element={<Auth />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            {/* <Route path="customers" element={<AdminCustomers />} /> */}
            {/* <Route path="analytics" element={<AdminAnalytics />} /> */}
            {/* <Route path="settings" element={<AdminSettings />} /> */}
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
        </AppInitializer>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
