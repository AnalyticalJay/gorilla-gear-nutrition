import React from "react";
import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

const NotFound = lazy(() => import("@/pages/NotFound"));
const Register = lazy(() => import("./pages/Register"));
const Login = lazy(() => import("./pages/Login"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Coaching = lazy(() => import("./pages/Coaching"));
const Products = lazy(() => import("./pages/Products"));
const SupplementsShop = lazy(() => import("./pages/SupplementsShop"));
const ApparelShop = lazy(() => import("./pages/ApparelShop"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess"));
const Account = lazy(() => import("./pages/Account"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminProductEdit = lazy(() => import("./pages/admin/AdminProductEdit"));
const ApprovalPending = lazy(() => import("./pages/ApprovalPending"));
const OrderDetail = lazy(() => import("./pages/OrderDetail"));
const OrderCancelled = lazy(() => import("./pages/OrderCancelled"));
const AdminOrderDetail = lazy(() => import("./pages/admin/AdminOrderDetail"));
const AdminBulkImport = lazy(() => import("./pages/admin/AdminBulkImport"));
const AdminBulkImages = lazy(() => import("./pages/admin/AdminBulkImages"));
const AdminMemberPreview = lazy(() => import("./pages/admin/AdminMemberPreview"));
const AdminResetAudit = lazy(() => import("./pages/admin/AdminResetAudit"));
const AdminCoachingEnquiries = lazy(() => import("./pages/admin/AdminCoachingEnquiries"));
const AdminIkhokhaPaymentAudit = lazy(() => import("./pages/admin/AdminIkhokhaPaymentAudit"));

function RouteLoading() {
  return <div role="status" className="grid min-h-screen place-items-center bg-[#070707] text-[11px] font-black uppercase tracking-[0.2em] text-[#c99a3d]">Loading Gorilla Gear</div>;
}

function Router() {
  return (
    <>
      <Suspense fallback={<RouteLoading />}>
        <Switch>
        {/* Public */}
        <Route path="/" component={Home} />
        <Route path="/register" component={Register} />
        <Route path="/login" component={Login} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/reset-password" component={ResetPassword} />
        <Route path="/coaching" component={Coaching} />
        <Route path="/products" component={Products} />
        <Route path="/supplements" component={SupplementsShop} />
        <Route path="/apparel" component={ApparelShop} />
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
      </Suspense>
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
