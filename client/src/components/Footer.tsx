import React from "react";
import { LockKeyhole, Truck, Users } from "lucide-react";

const footerLogoSrc = "/manus-storage/ggn-logo-transparent_bf4fb645.png";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-black/10 bg-white text-black">
      <div className="container py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_0.8fr_0.8fr]">
          <div>
            <div className="flex items-center">
              <img src={footerLogoSrc} alt="Gorilla Gear Nutrition" className="h-16 w-28 object-contain object-left sm:h-20 sm:w-36" />
            </div>
            <p className="mt-4 max-w-sm text-xs font-medium leading-relaxed text-black/72">
              Discipline. Dedication. Dominate. Premium supplements, performance apparel and coaching for serious progress.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a8751c]">Explore</p>
            <ul className="mt-4 space-y-2.5 text-xs font-bold uppercase tracking-wider text-black/84">
              <li><a href="/#collections" className="inline-flex border-b border-transparent pb-0.5 no-underline transition-colors hover:border-[#a8751c] hover:text-[#a8751c]">Supplements</a></li>
              <li><a href="/#collections" className="inline-flex border-b border-transparent pb-0.5 no-underline transition-colors hover:border-[#a8751c] hover:text-[#a8751c]">Clothing</a></li>
              <li><a href="/#coaching" className="inline-flex border-b border-transparent pb-0.5 no-underline transition-colors hover:border-[#a8751c] hover:text-[#a8751c]">Coaching</a></li>
              <li><a href="/register" className="inline-flex border-b border-transparent pb-0.5 no-underline transition-colors hover:border-[#a8751c] hover:text-[#a8751c]">Apply for access</a></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a8751c]">Member standards</p>
            <ul className="mt-4 space-y-3 text-xs font-semibold text-black/76">
              <li className="flex items-center gap-2"><Users className="h-4 w-4 text-[#a8751c]" /> <span>Admin-verified member access</span></li>
              <li className="flex items-center gap-2"><Truck className="h-4 w-4 text-[#a8751c]" /> <span>Nationwide delivery</span></li>
              <li className="flex items-center gap-2"><LockKeyhole className="h-4 w-4 text-[#a8751c]" /> <span>Secure quotes and checkout</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-black/12 pt-6 text-center text-xs font-medium text-black/68 sm:flex-row">
          <p>© 2026 Gorilla Gear Nutrition. All rights reserved.</p>
          <div className="flex gap-6 uppercase tracking-wider text-[10px] font-bold text-black/82">
            <span>Controlled Access</span>
            <span>Member support</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
