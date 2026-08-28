import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { trpc } from "@/lib/trpc";
import { registrationSchema, toRegistrationPayload, type RegistrationValues } from "@/lib/registrationValidation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const fieldClassName =
  "mt-1.5 border-[#d8d1c2] bg-white text-[#1c1c1c] placeholder:text-[#9a9285] shadow-sm focus-visible:border-[#a8751c] focus-visible:ring-[#a8751c]/20";

export function RegistrationForm({ onSubmitted }: { onSubmitted: () => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const registrationMutation = trpc.auth.register.useMutation({
    onSuccess: () => onSubmitted(),
    onError: (error) => toast.error(error.message),
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegistrationValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      city: "",
      password: "",
      confirmPassword: "",
      isOver18: false,
    },
  });

  const isOver18 = watch("isOver18");
  const isSubmitting = registrationMutation.isPending;

  const onSubmit = (values: RegistrationValues) => {
    registrationMutation.mutate(toRegistrationPayload(values));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <Label htmlFor="fullName" className="text-xs font-bold uppercase tracking-wide text-[#4c463d]">
          Full Name
        </Label>
        <Input
          id="fullName"
          autoComplete="name"
          {...register("fullName")}
          placeholder="John Smith"
          aria-invalid={Boolean(errors.fullName)}
          aria-describedby={errors.fullName ? "fullName-error" : undefined}
          className={fieldClassName}
        />
        {errors.fullName && <p id="fullName-error" className="mt-1 text-xs text-[#FB7185]">{errors.fullName.message}</p>}
      </div>

      <div>
        <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wide text-[#4c463d]">
          Email Address
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          {...register("email")}
          placeholder="john@example.com"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "email-error" : undefined}
          className={fieldClassName}
        />
        {errors.email && <p id="email-error" className="mt-1 text-xs text-[#FB7185]">{errors.email.message}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wide text-[#4c463d]">
            Phone
          </Label>
          <Input
            id="phone"
            type="tel"
            autoComplete="tel"
            {...register("phone")}
            placeholder="+27 82 000 0000"
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "phone-error" : undefined}
            className={fieldClassName}
          />
          {errors.phone && <p id="phone-error" className="mt-1 text-xs text-[#FB7185]">{errors.phone.message}</p>}
        </div>
        <div>
          <Label htmlFor="city" className="text-xs font-bold uppercase tracking-wide text-[#4c463d]">
            City
          </Label>
          <Input
            id="city"
            autoComplete="address-level2"
            {...register("city")}
            placeholder="Gqeberha"
            aria-invalid={Boolean(errors.city)}
            aria-describedby={errors.city ? "city-error" : undefined}
            className={fieldClassName}
          />
          {errors.city && <p id="city-error" className="mt-1 text-xs text-[#FB7185]">{errors.city.message}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wide text-[#4c463d]">
          Password
        </Label>
        <div className="relative mt-1.5">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            {...register("password")}
            placeholder="Minimum 8 characters"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "password-error" : undefined}
            className={`${fieldClassName} pr-10`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a806f] transition-colors hover:text-[#a8751c]"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p id="password-error" className="mt-1 text-xs text-[#FB7185]">{errors.password.message}</p>}
      </div>

      <div>
        <Label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-wide text-[#4c463d]">
          Confirm Password
        </Label>
        <div className="relative mt-1.5">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            {...register("confirmPassword")}
            placeholder="Repeat your password"
            aria-invalid={Boolean(errors.confirmPassword)}
            aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
            className={`${fieldClassName} pr-10`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((visible) => !visible)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a806f] transition-colors hover:text-[#a8751c]"
            aria-label={showConfirmPassword ? "Hide confirmation password" : "Show confirmation password"}
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.confirmPassword && <p id="confirm-password-error" className="mt-1 text-xs text-[#FB7185]">{errors.confirmPassword.message}</p>}
      </div>

      <div className="flex items-start gap-3 pt-1">
        <Checkbox
          id="isOver18"
          checked={isOver18}
          onCheckedChange={(checked) => setValue("isOver18", checked === true, { shouldValidate: true })}
          className="mt-0.5 border-[#b9ad99] data-[state=checked]:border-[#a8751c] data-[state=checked]:bg-[#a8751c]"
          aria-describedby={errors.isOver18 ? "age-error" : undefined}
        />
        <Label htmlFor="isOver18" className="cursor-pointer text-sm leading-relaxed text-[#6a6257]">
          I confirm that I am <strong className="text-[#1c1c1c]">18 years of age or older</strong> and agree to the private catalogue terms.
        </Label>
      </div>
      {errors.isOver18 && <p id="age-error" className="text-xs text-[#FB7185]">{errors.isOver18.message}</p>}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 h-11 w-full bg-[#c99a3d] font-bold uppercase tracking-widest text-black hover:bg-[#e0b35a]"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting Application
          </>
        ) : (
          "Submit Application"
        )}
      </Button>
    </form>
  );
}

export function RegistrationSubmitted() {
  return (
    <div className="w-full max-w-md border border-[#d8d1c2] bg-white p-10 text-center shadow-[0_18px_45px_rgba(52,45,35,0.1)]" role="status" aria-live="polite">
      <div className="mx-auto mb-8 h-[3px] w-24 bg-[#c99a3d]" />
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#c99a3d]/15 text-[#a8751c]">
        <CheckCircle2 className="h-8 w-8" />
      </div>
      <h2 className="mb-3 text-2xl font-black uppercase tracking-tight text-[#1c1c1c]">Application Submitted</h2>
      <p className="mb-3 text-sm leading-relaxed text-[#6a6257]">
        Your application has been received and is now under review. We will notify you once Gorilla Gear Nutrition has approved your private catalogue access.
      </p>
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#a8751c]">Redirecting you to sign in…</p>
    </div>
  );
}
