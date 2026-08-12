import React from "react";
import { trpc } from "@/lib/trpc";
import { Users, Package, ShoppingBag, TrendingUp, Clock, CheckCircle, AlertTriangle, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const statsQuery = trpc.admin.stats.useQuery();
  const stats = statsQuery.data;

  const cards = [
    { label: "Total Users", value: stats?.totalUsers ?? 0, icon: Users, color: "text-blue-400" },
    { label: "Pending Approvals", value: stats?.pendingUsers ?? 0, icon: Clock, color: "text-yellow-400" },
    { label: "New Quotes", value: stats?.pendingQuotes ?? 0, icon: AlertTriangle, color: "text-[#E11D48]" },
    { label: "Total Orders", value: stats?.totalOrders ?? 0, icon: ShoppingBag, color: "text-primary" },
    { label: "Revenue (ZAR)", value: `R${parseFloat(String(stats?.revenue ?? "0")).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: "text-green-400" },
    { label: "Approved Users", value: stats?.approvedUsers ?? 0, icon: CheckCircle, color: "text-green-400" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black" >
          Gorilla Gear <span style={{ color: "#0EA5E9" }}>Dashboard</span>
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Overview of the Gorilla Gear Nutrition platform</p>
      </div>

      {(stats?.pendingQuotes ?? 0) > 0 && stats && (
        <div className="mb-6 flex flex-col gap-4 rounded-xl border border-[#E11D48]/50 bg-[#E11D48]/10 p-4 shadow-[0_0_24px_rgba(225,29,72,0.12)] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E11D48]/20 text-[#FDA4AF]">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-white">New quote request{stats.pendingQuotes === 1 ? "" : "s"} awaiting review</p>
              <p className="mt-1 text-xs leading-relaxed text-[#FDA4AF]">{stats.pendingQuotes} customer quote{stats.pendingQuotes === 1 ? "" : "s"} need{stats.pendingQuotes === 1 ? "s" : ""} your attention.</p>
            </div>
          </div>
          <Link href="/admin/orders" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#E11D48] px-4 py-2 text-xs font-black uppercase tracking-wide text-white transition hover:bg-[#BE123C]">
            Review quotes <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground">{card.label}</p>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
            <p className="text-2xl font-black">{statsQuery.isLoading ? "—" : card.value}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
