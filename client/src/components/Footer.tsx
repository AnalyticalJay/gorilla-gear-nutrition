import React from "react";
import { LockKeyhole, ShieldCheck, Truck } from "lucide-react";

const logoSrc = "/manus-storage/logo_2d6e0f20.png";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-black/10 bg-[#f7f5f0] text-[#111111]">
      <div className="container py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_0.8fr_0.8fr]">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-12 w-11 overflow-hidden rounded-md bg-white/65 p-1"><img src={logoSrc} alt="Gorilla Gear Nutrition logo" className="h-full w-full object-contain" /></div>
              <div className="leading-none"><span className="block text-[15px] font-black uppercase tracking-[0.11em]">Gorilla Gear</span><span className="mt-1 block text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#d7472f]">Nutrition</span></div>
            </div>
            <p className="mt-4 max-w-sm text-xs font-medium leading-relaxed text-[#555555]">
              South Africa’s premier gated performance nutrition catalogue. Serving serious athletes and fitness enthusiasts with verified compounds and secure quote workflows.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#111111]">Quick Navigation</p>
            <ul className="mt-4 space-y-2.5 text-xs font-bold uppercase tracking-wider text-[#555555]">
              <li><a href="/" className="no-underline hover:text-[#111111]">Home Catalog</a></li>
              <li><a href="/products" className="no-underline hover:text-[#111111]">Shop Products</a></li>
              <li><a href="/register" className="no-underline hover:text-[#111111]">Member Application</a></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#111111]">Security & Standards</p>
            <ul className="mt-4 space-y-3 text-xs font-semibold text-[#555555]">
              <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#d7472f]" /> <span>Admin-verified member access</span></li>
              <li className="flex items-center gap-2"><Truck className="h-4 w-4 text-[#d7472f]" /> <span>Port Elizabeth & nationwide delivery</span></li>
              <li className="flex items-center gap-2"><LockKeyhole className="h-4 w-4 text-[#d7472f]" /> <span>Encrypted quote & EFT checkout</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-black/10 pt-6 text-center text-xs font-medium text-[#777777] sm:flex-row">
          <p>© 2026 Gorilla Gear Nutrition. All rights reserved. Strict 18+ adult performance catalogue.</p>
          <div className="flex gap-6 uppercase tracking-wider text-[10px] font-bold">
            <span>Controlled Access</span>
            <span>Secure Quotes</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
