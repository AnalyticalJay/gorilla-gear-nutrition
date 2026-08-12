import { Link } from "wouter";
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
            <p className="mt-5 max-w-sm text-sm leading-6 text-black/55">A private performance nutrition catalogue for approved members across South Africa. Clear process, responsive support, and discreet delivery.</p>
            <div className="mt-6 flex flex-wrap gap-5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-black/50">
              {[{ icon: ShieldCheck, label: "Verified range" }, { icon: LockKeyhole, label: "Private access" }, { icon: Truck, label: "Discreet delivery" }].map(({ icon: Icon, label }) => <div key={label} className="flex items-center gap-2"><Icon className="h-4 w-4 text-[#d7472f]" />{label}</div>)}
            </div>
          </div>
          <div>
            <h4 className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#d7472f]">Explore</h4>
            <ul className="mt-5 space-y-3 text-sm text-black/60">
              {[{ href: "/", label: "Home" }, { href: "/products", label: "Products" }, { href: "/register", label: "Apply for membership" }, { href: "/account", label: "My account" }, { href: "/cart", label: "Quote cart" }].map(({ href, label }) => <li key={href}><Link href={href} className="no-underline transition-colors hover:text-[#d7472f]">{label}</Link></li>)}
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#d7472f]">Delivery & payment</h4>
            <ul className="mt-5 space-y-3 text-sm text-black/60">
              <li>Port Elizabeth — <strong className="text-black">free delivery</strong></li>
              <li>Other South African locations — <strong className="text-black">R150 flat rate</strong></li>
              <li>Discreet packaging</li>
              <li>EFT or PayFast in ZAR</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-black/10 pt-6 text-[10px] font-bold uppercase tracking-[0.12em] text-black/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Gorilla Gear Nutrition. All rights reserved.</p>
          <p>For adults 18+ only. Membership approval required.</p>
        </div>
      </div>
    </footer>
  );
}
