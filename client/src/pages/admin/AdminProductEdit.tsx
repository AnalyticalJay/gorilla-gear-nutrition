import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, Trash2, Star } from "lucide-react";
import { useState, useRef } from "react";
import { Link, useParams, useLocation } from "wouter";
import { toast } from "sonner";
import { useForm } from "react-hook-form";

type FormData = {
  name: string;
  slug: string;
  description?: string;
  dosageInfo?: string;
  price: string;
  stockQuantity: number;
  categoryId?: number;
  isActive: boolean;
  isFeatured: boolean;
};

export default function AdminProductEdit({ productId: productIdProp }: { productId?: number }) {
  const { productId: productIdParam } = useParams<{ productId: string }>();
  const productIdStr = productIdProp !== undefined ? String(productIdProp) : productIdParam;
  const productId = productIdStr;
  const isNew = productId === "new" || productId === undefined;
  const [, navigate] = useLocation();
  const fileRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();

  const productQuery = trpc.products.byId.useQuery(
    { id: parseInt(productId ?? "0") },
    { enabled: !isNew && !!productId }
  );
  const product = productQuery.data;

  const imagesQuery = trpc.products.getImages.useQuery(
    { productId: parseInt(productId ?? "0") },
    { enabled: !isNew && !!productId }
  );
  const images = imagesQuery.data ?? [];

  const categoriesQuery = trpc.categories.list.useQuery();
  const categories = categoriesQuery.data ?? [];

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      name: product?.name ?? "",
      slug: product?.slug ?? "",
      description: product?.description ?? "",
      dosageInfo: product?.dosageInfo ?? "",
      price: product?.price ?? "",
      stockQuantity: product?.stockQuantity ?? 0,
      categoryId: product?.categoryId ?? undefined,
      isActive: product?.isActive ?? true,
      isFeatured: product?.isFeatured ?? false,
    },
    values: product ? {
      name: product.name,
      slug: product.slug,
      description: product.description ?? "",
      dosageInfo: product.dosageInfo ?? "",
      price: product.price,
      stockQuantity: product.stockQuantity,
      categoryId: product.categoryId ?? undefined,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
    } : undefined,
  });

  const isActive = watch("isActive");
  const isFeatured = watch("isFeatured");

  const create = trpc.products.create.useMutation({
    onSuccess: (data) => {
      toast.success("Product created");
      navigate(`/admin/products/${data.id}/edit`);
    },
    onError: (e) => toast.error(e.message),
  });

  const update = trpc.products.update.useMutation({
    onSuccess: () => { utils.products.list.invalidate(); toast.success("Product updated"); },
    onError: (e) => toast.error(e.message),
  });

  const uploadImage = trpc.products.uploadImage.useMutation({
    onSuccess: () => { imagesQuery.refetch(); toast.success("Image uploaded"); },
    onError: (e) => toast.error(e.message),
  });

  const deleteImage = trpc.products.deleteImage.useMutation({
    onSuccess: () => imagesQuery.refetch(),
    onError: (e) => toast.error(e.message),
  });

  const setPrimary = trpc.products.setPrimaryImage.useMutation({
    onSuccess: () => imagesQuery.refetch(),
    onError: (e) => toast.error(e.message),
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || isNew) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      uploadImage.mutate({
        productId: parseInt(productId!),
        fileName: file.name,
        fileData: base64!,
        mimeType: file.type,
        isPrimary: images.length === 0,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const onSubmit = (data: any) => {
    // HTML inputs always return strings — coerce numeric fields before sending
    const payload = {
      ...data,
      stockQuantity: parseInt(String(data.stockQuantity ?? 0), 10) || 0,
      categoryId: data.categoryId ? parseInt(String(data.categoryId), 10) : undefined,
    };
    if (isNew) {
      create.mutate(payload as any);
    } else {
      update.mutate({ id: parseInt(productId!), ...payload } as any);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/products" className="no-underline">
          <button aria-label="Back to products" className="flex h-11 w-11 items-center justify-center rounded-md hover:bg-accent">
            <ArrowLeft className="h-4 w-4" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-black" >
            {isNew ? "New" : "Edit"} <span style={{ color: "#0EA5E9" }}>Product</span>
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card rounded-xl p-4 sm:p-6">
              <h2 className="font-bold mb-4">Product Details</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label className="text-sm font-medium">Product Name</Label>
                  <Input
                    {...register("name")}
                    onChange={(e) => {
                      register("name").onChange(e);
                      if (isNew) {
                        setValue("slug", e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
                      }
                    }}
                    className="mt-1.5 bg-input border-border"
                  />
                  {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <Label className="text-sm font-medium">Slug (URL)</Label>
                  <Input {...register("slug")} className="mt-1.5 bg-input border-border font-mono text-sm" />
                  {errors.slug && <p className="text-destructive text-xs mt-1">{errors.slug.message}</p>}
                </div>
                <div>
                  <Label className="text-sm font-medium">Price (ZAR)</Label>
                  <Input {...register("price")} placeholder="0.00" className="mt-1.5 bg-input border-border" />
                  {errors.price && <p className="text-destructive text-xs mt-1">{errors.price.message}</p>}
                </div>
                <div>
                  <Label className="text-sm font-medium">Stock Quantity</Label>
                  <Input {...register("stockQuantity")} type="number" min="0" className="mt-1.5 bg-input border-border" />
                </div>
                <div>
                  <Label className="text-sm font-medium">Category</Label>
                  <Select
                    value={watch("categoryId")?.toString() ?? ""}
                    onValueChange={(v) => setValue("categoryId", parseInt(v))}
                  >
                    <SelectTrigger className="mt-1.5 min-h-11 bg-input border-border">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-sm font-medium">Description</Label>
                  <textarea
                    {...register("description")}
                    rows={4}
                    className="mt-1.5 w-full rounded-md border border-border bg-input px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-sm font-medium">Dosage Information</Label>
                  <textarea
                    {...register("dosageInfo")}
                    rows={3}
                    className="mt-1.5 w-full rounded-md border border-border bg-input px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="glass-card rounded-xl p-4 sm:p-6">
              <h2 className="font-bold mb-4">Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Active</p>
                    <p className="text-xs text-muted-foreground">Visible in the catalog</p>
                  </div>
                  <Switch checked={isActive} onCheckedChange={(v) => setValue("isActive", v)} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Featured</p>
                    <p className="text-xs text-muted-foreground">Show on homepage</p>
                  </div>
                  <Switch checked={isFeatured} onCheckedChange={(v) => setValue("isFeatured", v)} />
                </div>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="space-y-6">
            <div className="glass-card rounded-xl p-4 sm:p-6">
              <h2 className="font-bold mb-4">Product Images</h2>
              {isNew ? (
                <p className="text-sm text-muted-foreground">Save the product first, then upload images.</p>
              ) : (
                <>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full mb-4 border-dashed border-border/60"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploadImage.isPending}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadImage.isPending ? "Uploading..." : "Upload Image"}
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    {images.map((img) => (
                      <div key={img.id} className="relative group rounded-lg overflow-hidden aspect-square bg-muted/30">
                        <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setPrimary.mutate({ imageId: img.id, productId: parseInt(productId!) })}
                            className="p-1.5 rounded-md bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                          >
                            <Star className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteImage.mutate({ imageId: img.id })}
                            className="p-1.5 rounded-md bg-destructive/20 text-destructive hover:bg-destructive/30"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        {img.isPrimary && (
                          <div className="absolute top-1 left-1 bg-yellow-500 text-black text-xs px-1.5 py-0.5 rounded font-bold">
                            Primary
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <Button
              type="submit"
              className="w-full text-white font-bold"
              disabled={create.isPending || update.isPending}
            >
              {create.isPending || update.isPending ? "Saving..." : isNew ? "Create Product" : "Save Changes"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
