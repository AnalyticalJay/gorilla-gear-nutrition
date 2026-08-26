import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  const handleGoHome = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#fcfbf8] px-4">
      <Card className="w-full max-w-lg border border-[#e5dfd4] bg-white shadow-[0_18px_45px_rgba(69,69,69,0.10)]">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-[#a8751c]/15 animate-pulse" />
              <AlertCircle className="relative h-16 w-16 text-[#a8751c]" />
            </div>
          </div>

          <h1 className="text-4xl font-black text-[#1f1f1f] mb-2">404</h1>

          <h2 className="text-xl font-bold text-[#454545] mb-4">
            Page Not Found
          </h2>

          <p className="text-[#6b665e] mb-8 leading-relaxed">
            Sorry, the page you are looking for doesn't exist.
            <br />
            It may have been moved or deleted.
          </p>

          <div
            id="not-found-button-group"
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Button
              onClick={handleGoHome}
              className="bg-[#a8751c] hover:bg-[#7c5a20] text-white px-6 py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
