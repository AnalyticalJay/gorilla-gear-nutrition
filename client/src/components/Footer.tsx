import React from "react";
import { LockKeyhole, ShieldCheck, Truck, Users } from "lucide-react";

const logoSrc = "/manus-storage/logo_2d6e0f20.png";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-[#070707] text-white">
      <div className="container py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_0.8fr_0.8fr]">
          <div>
            <div className="flex items-center gap-3">
              <img src={logoSrc} alt="Gorilla Gear Nutrition logo" className="h-12 w-11 object-contain" />
              <div className="leading-none"><span className="block text-[15px] font-black uppercase tracking-[0.11em]">Gorilla Gear</span><span className="mt-1 block text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#c99a3d]">Nutrition</span></div>
            </div>
            <p className="mt-4 max-w-sm text-xs font-medium leading-relaxed text-[#555555]">
              Discipline. Dedication. Dominate. Premium supplements, performance apparel and coaching for serious progress.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white">Explore</p>
            <ul className="mt-4 space-y-2.5 text-xs font-bold uppercase tracking-wider text-white/55">
              <li><a href="/#collections" className="no-underline hover:text-[#c99a3d]">Supplements</a></li>
              <li><a href="/#collections" className="no-underline hover:text-[#c99a3d]">Clothing</a></li>
              <li><a href="/#coaching" className="no-underline hover:text-[#c99a3d]">Coaching</a></li>
              <li><a href="/register" className="no-underline hover:text-[#c99a3d]">Apply for access</a></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white">Member standards</p>
            <ul className="mt-4 space-y-3 text-xs font-semibold text-white/55">
              <li className="flex items-center gap-2"><Users className="h-4 w-4 text-[#c99a3d]" /> <span>Admin-verified member access</span></li>
              <li className="flex items-center gap-2"><Truck className="h-4 w-4 text-[#c99a3d]" /> <span>Nationwide delivery</span></li>
              <li className="flex items-center gap-2"><LockKeyhole className="h-4 w-4 text-[#c99a3d]" /> <span>Secure quotes and checkout</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-center text-xs font-medium text-white/40 sm:flex-row">
          <p>© 2026 Gorilla Gear Nutrition. All rights reserved.</p>
          <div className="flex gap-6 uppercase tracking-wider text-[10px] font-bold text-white/55">
            <span>Controlled Access</span>
            <span>Member support</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
