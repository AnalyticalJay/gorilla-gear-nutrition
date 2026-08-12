import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2, Package } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function AdminProducts() {
  const [search, setSearch] = useState("");
  const utils = trpc.useUtils();

  const productsQuery = trpc.products.list.useQuery({ search: search || undefined });
  const deleteProduct = trpc.products.delete.useMutation({
    onSuccess: () => { utils.products.list.invalidate(); toast.success("Product deleted"); },
    onError: (e) => toast.error(e.message),
  });

  const products = productsQuery.data ?? [];

  return (
    <div>
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black" >
            Product <span style={{ color: "#0EA5E9" }}>Management</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{products.length} products in catalog</p>
        </div>
        <Link href="/admin/products/new">
          <Button className="min-h-11 w-full text-white font-semibold sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>

      <div className="relative mb-6 w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-input border-border" />
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        {productsQuery.isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-accent/20 rounded animate-pulse" />)}
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" />
            <p className="text-muted-foreground mb-4">No products yet</p>
            <Link href="/admin/products/new">
              <Button size="sm" className="text-white font-semibold">Add First Product</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-b border-border/40 text-xs text-muted-foreground">
                  <th className="text-left p-4 font-medium">Product</th>
                  <th className="text-left p-4 font-medium">Category</th>
                  <th className="text-left p-4 font-medium">Price</th>
                  <th className="text-left p-4 font-medium">Stock</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-border/20 hover:bg-accent/10 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted/30 shrink-0">
                          {product.primaryImage ? (
                            <img src={product.primaryImage} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">AC</span>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{product.categoryName ?? "—"}</td>
                    <td className="p-4 text-sm font-medium text-primary">
                      {product.price ? `R${parseFloat(product.price).toFixed(2)}` : "—"}
                    </td>
                    <td className="p-4">
                      <span className={`text-sm ${product.stockQuantity === 0 ? "text-destructive" : "text-green-400"}`}>
                        {product.stockQuantity}
                      </span>
                    </td>
                    <td className="p-4">
                      {product.isActive ? (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">Active</Badge>
                      ) : (
                        <Badge className="bg-muted text-muted-foreground text-xs">Inactive</Badge>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Link href={`/admin/products/${product.id}/edit`}>
                          <button className="flex min-h-10 items-center gap-1 rounded bg-accent px-3 py-2 text-xs hover:bg-accent/80 transition-colors">
                            <Edit className="h-3 w-3" />
                            Edit
                          </button>
                        </Link>
                        <button
                          onClick={() => {
                            if (confirm(`Delete "${product.name}"?`)) {
                              deleteProduct.mutate({ id: product.id });
                            }
                          }}
                          className="flex min-h-10 items-center gap-1 rounded bg-destructive/20 px-3 py-2 text-xs text-destructive hover:bg-destructive/30 transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
