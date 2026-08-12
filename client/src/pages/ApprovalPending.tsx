import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, XCircle, Mail, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

export default function ApprovalPending() {
  const { user, logout } = useAuth();
  const status = (user as any)?.status ?? "pending";

  const { data: meData } = trpc.auth.me.useQuery(undefined, { refetchInterval: 30000 });
  const currentStatus = (meData as any)?.status ?? status;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-lg w-full text-center">
          {currentStatus === "pending" && (
            <>
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="h-10 w-10 text-black" />
              </div>
              <h1 className="text-3xl font-black mb-4" >
                Application <span style={{ color: "#0EA5E9" }}>Under Review</span>
              </h1>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Thank you for registering with Gorilla Gear Nutrition. Your application is currently being reviewed by our team.
                You will be notified once your account has been approved.
              </p>
              <div className="glass-card rounded-xl p-6 mb-8 text-left space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary text-sm font-bold">1</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Application Submitted</p>
                    <p className="text-xs text-muted-foreground">Your registration has been received</p>
                  </div>
                  <CheckCircle className="h-4 w-4 text-green-400 ml-auto mt-1" />
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary text-sm font-bold">2</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Under Review</p>
                    <p className="text-xs text-muted-foreground">Our team is reviewing your application</p>
                  </div>
                  <Clock className="h-4 w-4 text-yellow-400 ml-auto mt-1 animate-pulse" />
                </div>
                <div className="flex items-start gap-3 opacity-50">
                  <div className="w-8 h-8 rounded-full bg-muted/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-muted-foreground text-sm font-bold">3</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-muted-foreground">Access Granted</p>
                    <p className="text-xs text-muted-foreground">Full access to pricing and ordering</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-6">
                This page refreshes automatically every 30 seconds. If you have questions, contact us directly.
              </p>
            </>
          )}

          {currentStatus === "approved" && (
            <>
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-green-400" />
              </div>
              <h1 className="text-3xl font-black mb-4" >
                Account <span style={{ color: "#0EA5E9" }}>Approved!</span>
              </h1>
              <p className="text-muted-foreground mb-8">
                Your account has been approved. You now have full access to pricing and can place orders.
              </p>
              <Link href="/products">
                <Button className="text-white font-bold px-8">
                  Browse Products
                </Button>
              </Link>
            </>
          )}

          {currentStatus === "rejected" && (
            <>
              <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-6">
                <XCircle className="h-10 w-10 text-destructive" />
              </div>
              <h1 className="text-3xl font-black mb-4" >
                Application <span className="text-destructive">Not Approved</span>
              </h1>
              <p className="text-muted-foreground mb-8">
                Unfortunately, your application was not approved at this time. Please contact us if you believe this is an error.
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={logout} className="border-border">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
                <Button className="text-white font-bold">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Us
                </Button>
              </div>
            </>
          )}

          {currentStatus === "pending" && (
            <Button variant="ghost" onClick={logout} className="text-muted-foreground hover:text-foreground">
              Sign out
            </Button>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
