import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Tag, Edit, Check, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminCategories() {
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const utils = trpc.useUtils();

  const categoriesQuery = trpc.categories.list.useQuery();
  const create = trpc.categories.create.useMutation({
    onSuccess: () => { utils.categories.list.invalidate(); setNewName(""); setNewDesc(""); toast.success("Category created"); },
    onError: (e) => toast.error(e.message),
  });
  const update = trpc.categories.update.useMutation({
    onSuccess: () => { utils.categories.list.invalidate(); setEditId(null); toast.success("Category updated"); },
    onError: (e) => toast.error(e.message),
  });
  const remove = trpc.categories.delete.useMutation({
    onSuccess: () => { utils.categories.list.invalidate(); toast.success("Category deleted"); },
    onError: (e) => toast.error(e.message),
  });

  const categories = categoriesQuery.data ?? [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black" >
          Category <span style={{ color: "#0EA5E9" }}>Management</span>
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Organize your product catalog</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        {/* Create Form */}
        <div className="glass-card rounded-xl p-4 sm:p-6">
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <Plus className="h-4 w-4 text-primary" />
            Add Category
          </h2>
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium">Name</Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Injectables"
                className="mt-1.5 bg-input border-border"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Description (optional)</Label>
              <Input
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Brief description"
                className="mt-1.5 bg-input border-border"
              />
            </div>
            <Button
              onClick={() => create.mutate({ name: newName, slug: newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), description: newDesc || undefined })}
              disabled={!newName.trim() || create.isPending}
              className="w-full text-white font-semibold"
            >
              {create.isPending ? "Creating..." : "Create Category"}
            </Button>
          </div>
        </div>

        {/* Categories List */}
        <div className="glass-card rounded-xl p-4 sm:p-6">
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <Tag className="h-4 w-4 text-primary" />
            Existing Categories ({categories.length})
          </h2>
          {categoriesQuery.isLoading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-accent/20 rounded animate-pulse" />)}
            </div>
          ) : categories.length === 0 ? (
            <p className="text-sm text-muted-foreground">No categories yet.</p>
          ) : (
            <div className="space-y-2">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/40">
                  {editId === cat.id ? (
                    <>
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 h-7 text-sm bg-input border-border"
                        autoFocus
                      />
                      <button
                        onClick={() => update.mutate({ id: cat.id, name: editName })}
                        className="flex h-11 w-11 items-center justify-center text-green-400 hover:text-green-300"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button onClick={() => setEditId(null)} className="flex h-11 w-11 items-center justify-center text-muted-foreground hover:text-foreground">
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{cat.name}</p>
                        {cat.description && <p className="text-xs text-muted-foreground">{cat.description}</p>}
                      </div>
                      <button
                        onClick={() => { setEditId(cat.id); setEditName(cat.name); }}
                        className="flex h-11 w-11 items-center justify-center text-muted-foreground hover:text-foreground"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => { if (confirm(`Delete "${cat.name}"?`)) remove.mutate({ id: cat.id }); }}
                        className="flex h-11 w-11 items-center justify-center text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
