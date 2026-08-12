import { trpc } from "@/lib/trpc";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Eye, EyeOff, Lock, Shield } from "lucide-react";
import { useState } from "react";
import { getLoginUrl } from "@/const";

const schema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(1, "Password required"),
});

type FormData = z.infer<typeof schema>;

export default function Login() {
  const [, navigate] = useLocation();
  const [showPass, setShowPass] = useState(false);

  const utils = trpc.useUtils();

  const login = trpc.auth.login.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      toast.success("Welcome back!");
      navigate("/products");
    },
    onError: (err) => toast.error(err.message),
  });

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#080808]">
        {/* Hex pattern */}
        <div className="absolute inset-0 hex-pattern opacity-80" />
        {/* Blue glow */}
        <div className="absolute top-1/4 right-0 w-[400px] h-[400px] rounded-full opacity-15 blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, #0EA5E9 0%, transparent 70%)" }} />
        {/* Red glow */}
        <div className="absolute bottom-1/4 left-0 w-[300px] h-[300px] rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, #E11D48 0%, transparent 70%)" }} />

        <div className="relative z-10 flex flex-col justify-center p-16">
          <Link href="/" className="flex items-center gap-2.5 mb-16 no-underline">
            <div className="w-10 h-10 rounded flex items-center justify-center overflow-hidden border border-[#1E293B] bg-black">
              <img src="/manus-storage/anabolics-africa-logo_2013ad4b.png" alt="Anabolics Africa logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <span className="font-black text-white text-base tracking-widest uppercase">Anabolics</span>
              <span className="font-black text-base tracking-widest uppercase ml-1.5" style={{ color: "#0EA5E9" }}>Africa</span>
            </div>
          </Link>

          <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tight leading-tight mb-4 break-words">
            <span className="text-white">Welcome</span>
            <br />
            <span style={{ color: "#0EA5E9" }}>Back</span>
          </h2>
          <p className="text-[#64748B] leading-relaxed max-w-xs">
            Sign in to access your approved account and browse our exclusive catalog of premium HD Labs compounds.
          </p>

          {/* Features */}
          <div className="mt-10 space-y-3">
            {[
              { icon: Shield, text: "Verified HD Labs products" },
              { icon: Lock, text: "Gated access — approved members only" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-[#64748B]">
                <Icon className="h-4 w-4 text-[#0EA5E9]" />
                <span className="text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-[#0A0A0A]">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-[#64748B] hover:text-white mb-8 no-underline transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          {/* HD Labs stripe */}
          <div className="h-[3px] w-16 mb-6" style={{ background: "linear-gradient(90deg, #E11D48 0%, #E11D48 50%, #0EA5E9 50%, #0EA5E9 100%)" }} />

          <h1 className="text-3xl font-black uppercase tracking-tight text-white mb-2">
            Sign In
          </h1>
          <p className="text-[#64748B] text-sm mb-8">
            Don't have an account?{" "}
            <Link href="/register" className="font-bold no-underline hover:underline" style={{ color: "#0EA5E9" }}>
              Apply for access
            </Link>
          </p>

          <form onSubmit={handleSubmit((data) => login.mutate(data))} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm font-bold uppercase tracking-wide text-[#94A3B8]">Email Address</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="john@example.com"
                className="mt-1.5 bg-[#111111] border-[#1E293B] text-white placeholder:text-[#334155] focus:border-[#0EA5E9]/50"
              />
              {errors.email && <p className="text-[#E11D48] text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-bold uppercase tracking-wide text-[#94A3B8]">Password</Label>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={showPass ? "text" : "password"}
                  {...register("password")}
                  placeholder="Your password"
                  className="bg-[#111111] border-[#1E293B] text-white placeholder:text-[#334155] focus:border-[#0EA5E9]/50 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white transition-colors"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-[#E11D48] text-xs mt-1">{errors.password.message}</p>}
            </div>

            <Button
              type="submit"
              className="w-full text-white font-bold uppercase tracking-widest mt-2 h-11"
              style={{ background: "linear-gradient(135deg, #0EA5E9, #0284C7)" }}
              disabled={login.isPending}
            >
              {login.isPending ? "Signing In..." : "Sign In"}
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#1E293B]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#111111] text-[#64748B]">or</span>
              </div>
            </div>

            <a href={getLoginUrl()}>
              <Button
                type="button"
                className="w-full text-white font-bold uppercase tracking-widest h-11"
                style={{ background: "linear-gradient(135deg, #E11D48, #DC2626)" }}
              >
                Sign In with Manus
              </Button>
            </a>
          </form>
        </div>
      </div>
    </div>
  );
}
