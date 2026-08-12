import { trpc } from "@/lib/trpc";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ArrowLeft, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useState } from "react";

const schema = z.object({
  fullName: z.string().min(2, "Full name required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(7, "Phone number required"),
  city: z.string().min(2, "City required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  isOver18: z.boolean().refine((v) => v, "You must be 18 or older"),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

export default function Register() {
  const [, navigate] = useLocation();
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: () => setSuccess(true),
    onError: (err) => toast.error(err.message),
  });

  const { register: reg, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { isOver18: false },
  });

  const isOver18 = watch("isOver18");

  if (success) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center p-10 rounded-lg border border-[#1E293B] bg-[#111111]">
          {/* HD Labs stripe */}
          <div className="h-[3px] w-24 mx-auto mb-8" style={{ background: "linear-gradient(90deg, #E11D48 0%, #E11D48 50%, #0EA5E9 50%, #0EA5E9 100%)" }} />
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: "linear-gradient(135deg, #0EA5E9, #0284C7)" }}>
            <CheckCircle2 className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-3">
            Application Submitted!
          </h2>
          <p className="text-[#64748B] mb-6 leading-relaxed text-sm">
            Your application is now under review. You'll be notified once approved — typically within 24 hours.
          </p>
          <Link href="/login" className="no-underline">
            <Button className="text-white font-bold uppercase tracking-widest"
              style={{ background: "linear-gradient(135deg, #0EA5E9, #0284C7)" }}>
              Go to Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#080808]">
        <div className="absolute inset-0 hex-pattern opacity-80" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full opacity-12 blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, #0EA5E9 0%, transparent 70%)" }} />
        <div className="absolute bottom-1/4 right-0 w-[300px] h-[300px] rounded-full opacity-10 blur-3xl pointer-events-none"
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
            <span className="text-white">Join the</span>
            <br />
            <span style={{ color: "#0EA5E9" }}>Elite</span>
          </h2>
          <p className="text-[#64748B] leading-relaxed mb-8 max-w-xs">
            Apply for exclusive access to South Africa's premium performance compound platform. Every application is reviewed by our team.
          </p>
          <ul className="space-y-3">
            {[
              "Manual approval process",
              "Exclusive pricing for members",
              "Discreet nationwide delivery",
              "18+ verified platform",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-[#64748B]">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#0EA5E9" }} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-[#0A0A0A] overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-[#64748B] hover:text-white mb-8 no-underline transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          {/* HD Labs stripe */}
          <div className="h-[3px] w-16 mb-6" style={{ background: "linear-gradient(90deg, #E11D48 0%, #E11D48 50%, #0EA5E9 50%, #0EA5E9 100%)" }} />

          <h1 className="text-3xl font-black uppercase tracking-tight text-white mb-2">
            Apply for Access
          </h1>
          <p className="text-[#64748B] text-sm mb-8">
            Already have an account?{" "}
            <Link href="/login" className="font-bold no-underline hover:underline" style={{ color: "#0EA5E9" }}>
              Login here
            </Link>
          </p>

          <form onSubmit={handleSubmit((data) => registerMutation.mutate(data))} className="space-y-4">
            <div>
              <Label htmlFor="fullName" className="text-xs font-bold uppercase tracking-wide text-[#94A3B8]">Full Name</Label>
              <Input id="fullName" {...reg("fullName")} placeholder="John Smith"
                className="mt-1.5 bg-[#111111] border-[#1E293B] text-white placeholder:text-[#334155] focus:border-[#0EA5E9]/50" />
              {errors.fullName && <p className="text-[#E11D48] text-xs mt-1">{errors.fullName.message}</p>}
            </div>

            <div>
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wide text-[#94A3B8]">Email Address</Label>
              <Input id="email" type="email" {...reg("email")} placeholder="john@example.com"
                className="mt-1.5 bg-[#111111] border-[#1E293B] text-white placeholder:text-[#334155] focus:border-[#0EA5E9]/50" />
              {errors.email && <p className="text-[#E11D48] text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wide text-[#94A3B8]">Phone</Label>
                <Input id="phone" {...reg("phone")} placeholder="+27 82 000 0000"
                  className="mt-1.5 bg-[#111111] border-[#1E293B] text-white placeholder:text-[#334155] focus:border-[#0EA5E9]/50" />
                {errors.phone && <p className="text-[#E11D48] text-xs mt-1">{errors.phone.message}</p>}
              </div>
              <div>
                <Label htmlFor="city" className="text-xs font-bold uppercase tracking-wide text-[#94A3B8]">City</Label>
                <Input id="city" {...reg("city")} placeholder="Johannesburg"
                  className="mt-1.5 bg-[#111111] border-[#1E293B] text-white placeholder:text-[#334155] focus:border-[#0EA5E9]/50" />
                {errors.city && <p className="text-[#E11D48] text-xs mt-1">{errors.city.message}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wide text-[#94A3B8]">Password</Label>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={showPass ? "text" : "password"}
                  {...reg("password")}
                  placeholder="Min. 8 characters"
                  className="bg-[#111111] border-[#1E293B] text-white placeholder:text-[#334155] focus:border-[#0EA5E9]/50 pr-10"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white transition-colors">
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-[#E11D48] text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-wide text-[#94A3B8]">Confirm Password</Label>
              <div className="relative mt-1.5">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  {...reg("confirmPassword")}
                  placeholder="Repeat password"
                  className="bg-[#111111] border-[#1E293B] text-white placeholder:text-[#334155] focus:border-[#0EA5E9]/50 pr-10"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white transition-colors">
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-[#E11D48] text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <div className="flex items-start gap-3 pt-1">
              <Checkbox
                id="isOver18"
                checked={isOver18}
                onCheckedChange={(v) => setValue("isOver18", v === true)}
                className="mt-0.5 border-[#1E293B] data-[state=checked]:bg-[#0EA5E9] data-[state=checked]:border-[#0EA5E9]"
              />
              <Label htmlFor="isOver18" className="text-sm text-[#64748B] leading-relaxed cursor-pointer">
                I confirm that I am <strong className="text-white">18 years of age or older</strong> and agree to the terms of service.
              </Label>
            </div>
            {errors.isOver18 && <p className="text-[#E11D48] text-xs">{errors.isOver18.message}</p>}

            <Button
              type="submit"
              className="w-full text-white font-bold uppercase tracking-widest mt-2 h-11"
              style={{ background: "linear-gradient(135deg, #0EA5E9, #0284C7)" }}
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? "Submitting Application..." : "Submit Application"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
