import React from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Coaching from "./pages/Coaching";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Account from "./pages/Account";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminProductEdit from "./pages/admin/AdminProductEdit";
import ApprovalPending from "./pages/ApprovalPending";
import OrderDetail from "./pages/OrderDetail";
import OrderCancelled from "./pages/OrderCancelled";
import AdminOrderDetail from "./pages/admin/AdminOrderDetail";
import AdminBulkImport from "./pages/admin/AdminBulkImport";
import AdminBulkImages from "./pages/admin/AdminBulkImages";
import AdminMemberPreview from "./pages/admin/AdminMemberPreview";
import AdminResetAudit from "./pages/admin/AdminResetAudit";
import AdminCoachingEnquiries from "./pages/admin/AdminCoachingEnquiries";
import AdminIkhokhaPaymentAudit from "./pages/admin/AdminIkhokhaPaymentAudit";
import MobileBottomNav from "./components/MobileBottomNav";
import { shouldShowMobileNav } from "@shared/mobileNav";

function Router() {
  const [location] = useLocation();
  const showMobileNav = shouldShowMobileNav(location);

  return (
    <>
      <div className={showMobileNav ? "pb-24 md:pb-0" : ""}>
      <Switch>
        {/* Public */}
        <Route path="/" component={Home} />
        <Route path="/register" component={Register} />
        <Route path="/login" component={Login} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/reset-password" component={ResetPassword} />
        <Route path="/coaching" component={Coaching} />
        <Route path="/products" component={Products} />
        <Route path="/products/:slug" component={ProductDetail} />

        {/* Authenticated */}
        <Route path="/cart" component={Cart} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/order-success/:orderId" component={OrderSuccess} />
        <Route path="/account" component={Account} />
        <Route path="/account/:tab" component={Account} />
        <Route path="/approval-pending" component={ApprovalPending} />
        <Route path="/orders/:orderId" component={OrderDetail} />
        <Route path="/order-cancelled" component={OrderCancelled} />

        {/* Admin */}
        <Route path="/admin">
          {() => (
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          )}
        </Route>
        <Route path="/admin/dashboard">
          {() => (
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          )}
        </Route>
        <Route path="/admin/users/:userId/preview">
          {(params) => (
            <AdminLayout>
              <AdminMemberPreview />
            </AdminLayout>
          )}
        </Route>
        <Route path="/admin/users">
          {() => (
            <AdminLayout>
              <AdminUsers />
            </AdminLayout>
          )}
        </Route>
        <Route path="/admin/reset-audit">
          {() => (
            <AdminLayout>
              <AdminResetAudit />
            </AdminLayout>
          )}
        </Route>
        <Route path="/admin/payment-audit">
          {() => (
            <AdminLayout>
              <AdminIkhokhaPaymentAudit />
            </AdminLayout>
          )}
        </Route>
        <Route path="/admin/coaching-enquiries">
          {() => (
            <AdminLayout>
              <AdminCoachingEnquiries />
            </AdminLayout>
          )}
        </Route>
        <Route path="/admin/products">
          {() => (
            <AdminLayout>
              <AdminProducts />
            </AdminLayout>
          )}
        </Route>
        <Route path="/admin/products/new">
          {() => (
            <AdminLayout>
              <AdminProductEdit />
            </AdminLayout>
          )}
        </Route>
        <Route path="/admin/products/:id/edit">
          {(params) => (
            <AdminLayout>
              <AdminProductEdit productId={parseInt((params as any).id)} />
            </AdminLayout>
          )}
        </Route>
        <Route path="/admin/bulk-import">
          {() => (
            <AdminLayout>
              <AdminBulkImport />
            </AdminLayout>
          )}
        </Route>
        <Route path="/admin/bulk-images">
          {() => (
            <AdminLayout>
              <AdminBulkImages />
            </AdminLayout>
          )}
        </Route>
        <Route path="/admin/categories">
          {() => (
            <AdminLayout>
              <AdminCategories />
            </AdminLayout>
          )}
        </Route>
        <Route path="/admin/orders">
          {() => (
            <AdminLayout>
              <AdminOrders />
            </AdminLayout>
          )}
        </Route>
        <Route path="/admin/orders/:orderId">
          {() => (
            <AdminLayout>
              <AdminOrderDetail />
            </AdminLayout>
          )}
        </Route>

        {/* Fallback */}
        <Route component={NotFound} />
      </Switch>
      </div>
      {showMobileNav && <MobileBottomNav />}
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
