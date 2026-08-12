import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2, Package } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function AdminProducts() {
  const [search, setSearch] = useState("");
  const utils = trpc.useUtils();

  const productsQuery = trpc.products.list.useQuery({ search: search || undefined });
  const deleteProduct = trpc.products.delete.useMutation({
    onSuccess: () => {
      utils.products.list.invalidate();
      toast.success("Product deleted successfully");
    },
    onError: (err) => {
      toast.error(`Failed to delete product: ${err.message}`);
    },
  });

  const updateProduct = trpc.products.update.useMutation({
    onSuccess: () => {
      utils.products.list.invalidate();
      toast.success("Product status updated");
    },
    onError: (err: any) => {
      toast.error(`Failed to update status: ${err.message}`);
    },
  });

  const products = productsQuery.data ?? [];

  return (
    <div>
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white">Product Management</h1>
          <p className="text-sm text-[#64748B]">Manage catalogue items, pricing, and stock levels</p>
        </div>
        <Link href="/admin/products/new" className="no-underline">
          <Button
            className="text-xs font-black uppercase tracking-wider text-white shadow-lg transition hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #0EA5E9, #0284C7)" }}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Product
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
          <Input
            placeholder="Search products by name, compound, or brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-[#111111] border-[#1E293B] text-white placeholder:text-[#64748B]"
          />
        </div>
      </div>

      <div className="rounded-xl border border-[#1E293B] bg-[#111111] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1E293B] bg-black/40 text-[11px] font-black uppercase tracking-widest text-[#64748B]">
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Stock</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B] text-sm">
              {productsQuery.isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#64748B]">Loading products...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#64748B]">No products found.</td>
                </tr>
              ) : (
                products.map((product: any) => (
                  <tr key={product.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-medium text-white">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded bg-[#1A1A1A] border border-[#1E293B] flex items-center justify-center shrink-0">
                          <Package className="h-4 w-4 text-[#0EA5E9]" />
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{product.name}</p>
                          <p className="text-xs text-[#64748B] font-mono">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#94A3B8]">
                      {product.category?.name || "General"}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#0EA5E9]">
                      R{parseFloat(product.price).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-white">
                      {product.stockQuantity}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => updateProduct.mutate({ id: product.id, isActive: !product.isActive })}
                        className="inline-flex cursor-pointer"
                      >
                        <Badge variant={product.isActive ? "default" : "secondary"} className={product.isActive ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-red-500/10 text-red-400 border-red-500/30"}>
                          {product.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/products/${product.id}/edit`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-[#64748B] hover:text-white hover:bg-white/5">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-[#64748B] hover:text-[#E11D48] hover:bg-[#E11D48]/10"
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
                              deleteProduct.mutate({ id: product.id });
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
