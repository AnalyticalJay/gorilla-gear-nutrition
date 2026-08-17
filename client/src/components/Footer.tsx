import React from "react";
import { LockKeyhole, Truck, Users } from "lucide-react";

const footerLogoSrc = "/manus-storage/ggn-logo-transparent-light_b806869d.png";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-white/18 bg-[#454545] text-white">
      <div className="container py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_0.8fr_0.8fr]">
          <div>
            <div className="flex items-center">
              <img src={footerLogoSrc} alt="Gorilla Gear Nutrition" className="h-16 w-28 object-contain object-left sm:h-20 sm:w-36" />
            </div>
            <p className="mt-4 max-w-sm text-xs font-medium leading-relaxed text-white/90">
              Discipline. Dedication. Dominate. Premium supplements, performance apparel and coaching for serious progress.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f0c65e]">Explore</p>
            <ul className="mt-4 space-y-2.5 text-xs font-bold uppercase tracking-wider text-white">
              <li><a href="/#collections" className="inline-flex border-b border-transparent pb-0.5 no-underline transition-colors hover:border-[#f0c65e] hover:text-[#f0c65e]">Supplements</a></li>
              <li><a href="/#collections" className="inline-flex border-b border-transparent pb-0.5 no-underline transition-colors hover:border-[#f0c65e] hover:text-[#f0c65e]">Clothing</a></li>
              <li><a href="/#coaching" className="inline-flex border-b border-transparent pb-0.5 no-underline transition-colors hover:border-[#f0c65e] hover:text-[#f0c65e]">Coaching</a></li>
              <li><a href="/register" className="inline-flex border-b border-transparent pb-0.5 no-underline transition-colors hover:border-[#f0c65e] hover:text-[#f0c65e]">Apply for access</a></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f0c65e]">Member standards</p>
            <ul className="mt-4 space-y-3 text-xs font-semibold text-white/90">
              <li className="flex items-center gap-2"><Users className="h-4 w-4 text-[#f0c65e]" /> <span>Admin-verified member access</span></li>
              <li className="flex items-center gap-2"><Truck className="h-4 w-4 text-[#f0c65e]" /> <span>Nationwide delivery</span></li>
              <li className="flex items-center gap-2"><LockKeyhole className="h-4 w-4 text-[#f0c65e]" /> <span>Secure quotes and checkout</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/28 pt-6 text-center text-xs font-medium text-white/85 sm:flex-row">
          <p>© 2026 Gorilla Gear Nutrition. All rights reserved.</p>
          <div className="flex gap-6 uppercase tracking-wider text-[10px] font-bold text-white">
            <span>Controlled Access</span>
            <span>Member support</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
