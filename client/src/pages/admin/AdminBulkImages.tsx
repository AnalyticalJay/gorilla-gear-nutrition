import { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, FileImage, Loader2, Search, UploadCloud, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { trpc } from "@/lib/trpc";

type MatchResult = {
  fileName: string;
  normalizedKey: string;
  product: { id: number; name: string; slug: string } | null;
  status: "matched" | "unmatched";
};

type PendingFile = {
  file: File;
  previewUrl: string;
  match: MatchResult | null;
  uploadStatus: "pending" | "uploading" | "uploaded" | "failed";
  error?: string;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      resolve(result.includes(",") ? result.split(",", 2)[1] : result);
    };
    reader.onerror = () => reject(reader.error ?? new Error("Could not read image"));
    reader.readAsDataURL(file);
  });
}

export default function AdminBulkImages() {
  const [files, setFiles] = useState<PendingFile[]>([]);
  const [isMatching, setIsMatching] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadIndex, setUploadIndex] = useState(0);
  const [search, setSearch] = useState("");
  const previewUrlsRef = useRef<Set<string>>(new Set());

  const matchMutation = trpc.products.matchImageFiles.useMutation();
  const uploadMutation = trpc.products.uploadImage.useMutation();

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      previewUrlsRef.current.clear();
    };
  }, []);

  const matchedFiles = files.filter((item) => item.match?.product);
  const unmatchedFiles = files.filter((item) => item.match?.status === "unmatched" || !item.match);
  const visibleFiles = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return files;
    return files.filter((item) =>
      item.file.name.toLowerCase().includes(query) ||
      item.match?.product?.name.toLowerCase().includes(query)
    );
  }, [files, search]);

  const selectFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []).filter((file) => file.type.startsWith("image/"));
    if (!selected.length) {
      toast.error("Please select one or more image files");
      return;
    }
    if (selected.length > 500) {
      toast.error("Please upload no more than 500 images at a time");
      return;
    }
    setFiles((current) => {
      current.forEach((item) => {
        URL.revokeObjectURL(item.previewUrl);
        previewUrlsRef.current.delete(item.previewUrl);
      });
      return selected.map((file) => {
        const previewUrl = URL.createObjectURL(file);
        previewUrlsRef.current.add(previewUrl);
        return {
        file,
        previewUrl,
        match: null,
        uploadStatus: "pending" as const,
        };
      });
    });
    setUploadIndex(0);
  };

  const matchFiles = async () => {
    if (!files.length) {
      toast.error("Select images first");
      return;
    }
    setIsMatching(true);
    try {
      const matches = await matchMutation.mutateAsync({ fileNames: files.map((item) => item.file.name) });
      setFiles((current) => current.map((item) => ({
        ...item,
        match: matches.find((match) => match.fileName === item.file.name) ?? null,
        uploadStatus: "pending",
        error: undefined,
      })));
      const found = matches.filter((match) => match.status === "matched").length;
      toast.success(`${found} of ${matches.length} images matched to products`);
    } catch (error: any) {
      toast.error(error.message || "Could not match image filenames");
    } finally {
      setIsMatching(false);
    }
  };

  const uploadMatchedImages = async () => {
    const ready = files.filter((item) => item.match?.product && item.uploadStatus !== "uploaded");
    if (!ready.length) {
      toast.error("Run matching first and make sure at least one image matches a product");
      return;
    }

    setIsUploading(true);
    setUploadIndex(0);
    let uploaded = 0;
    let failed = 0;

    for (const item of ready) {
      const product = item.match?.product;
      if (!product) continue;
      setFiles((current) => current.map((candidate) => candidate.file === item.file ? { ...candidate, uploadStatus: "uploading", error: undefined } : candidate));
      try {
        const fileData = await fileToBase64(item.file);
        await uploadMutation.mutateAsync({
          productId: product.id,
          fileName: item.file.name,
          fileData,
          mimeType: item.file.type || "application/octet-stream",
          isPrimary: true,
        });
        uploaded += 1;
        setFiles((current) => current.map((candidate) => candidate.file === item.file ? { ...candidate, uploadStatus: "uploaded" } : candidate));
      } catch (error: any) {
        failed += 1;
        setFiles((current) => current.map((candidate) => candidate.file === item.file ? { ...candidate, uploadStatus: "failed", error: error.message || "Upload failed" } : candidate));
      }
      setUploadIndex((current) => current + 1);
    }

    setIsUploading(false);
    toast.success(`Uploaded ${uploaded} image${uploaded === 1 ? "" : "s"}${failed ? `; ${failed} failed` : ""}`);
  };

  const clearFiles = () => {
    files.forEach((item) => {
      URL.revokeObjectURL(item.previewUrl);
      previewUrlsRef.current.delete(item.previewUrl);
    });
    setFiles([]);
    setSearch("");
    setUploadIndex(0);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#0EA5E9]">Product media</p>
            <h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-white">Bulk Image Upload</h1>
            <p className="mt-2 max-w-2xl text-sm text-[#64748B]">
              Upload product images in one batch. Each filename is matched against the product name and slug after punctuation, hyphens, and file extensions are normalized.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded border border-[#1E293B] bg-[#111111] px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
            <FileImage className="h-4 w-4 text-[#0EA5E9]" />
            {files.length} selected
          </div>
        </div>
      </div>

      <Card className="border-[#1E293B] bg-[#111111]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white"><UploadCloud className="h-5 w-5 text-[#0EA5E9]" /> Select product images</CardTitle>
          <CardDescription className="text-[#64748B]">Recommended naming: the exact product name, for example <span className="text-[#94A3B8]">Testosterone Enanthate 250mg HD Labs.jpg</span>.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-4 sm:p-6">
          <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded border border-dashed border-[#0EA5E9]/50 bg-[#0EA5E9]/5 px-6 text-center transition-colors hover:border-[#0EA5E9] hover:bg-[#0EA5E9]/10">
            <UploadCloud className="mb-3 h-8 w-8 text-[#0EA5E9]" />
            <span className="text-sm font-bold uppercase tracking-wide text-white">Choose multiple images</span>
            <span className="mt-1 text-xs text-[#64748B]">JPG, PNG, WEBP, GIF, or other browser-supported image formats</span>
            <input type="file" multiple accept="image/*" className="hidden" onChange={selectFiles} disabled={isUploading || isMatching} />
          </label>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button onClick={matchFiles} disabled={!files.length || isMatching || isUploading} className="min-h-11 bg-[#0EA5E9] font-bold uppercase tracking-wide text-white hover:bg-[#0284C7]">
              {isMatching ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Matching...</> : <><Search className="mr-2 h-4 w-4" /> Match to products</>}
            </Button>
            <Button onClick={uploadMatchedImages} disabled={!matchedFiles.length || isMatching || isUploading} className="min-h-11 bg-[#E11D48] font-bold uppercase tracking-wide text-white hover:bg-[#BE123C]">
              {isUploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading {Math.min(uploadIndex + 1, matchedFiles.length)}/{matchedFiles.length}</> : <><UploadCloud className="mr-2 h-4 w-4" /> Upload matched images</>}
            </Button>
            <Button onClick={clearFiles} disabled={!files.length || isUploading} variant="outline" className="min-h-11 border-[#1E293B] text-[#94A3B8] hover:bg-white/5 hover:text-white">Clear</Button>
          </div>
        </CardContent>
      </Card>

      {files.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
            <Card className="border-[#1E293B] bg-[#111111]"><CardContent className="p-4"><p className="text-xs uppercase tracking-wide text-[#64748B]">Selected</p><p className="mt-1 text-2xl font-black text-white">{files.length}</p></CardContent></Card>
            <Card className="border-[#1E293B] bg-[#111111]"><CardContent className="p-4"><p className="text-xs uppercase tracking-wide text-[#64748B]">Matched</p><p className="mt-1 text-2xl font-black text-[#10B981]">{matchedFiles.length}</p></CardContent></Card>
            <Card className="border-[#1E293B] bg-[#111111]"><CardContent className="p-4"><p className="text-xs uppercase tracking-wide text-[#64748B]">Unmatched</p><p className="mt-1 text-2xl font-black text-[#E11D48]">{unmatchedFiles.length}</p></CardContent></Card>
            <Card className="border-[#1E293B] bg-[#111111]"><CardContent className="p-4"><p className="text-xs uppercase tracking-wide text-[#64748B]">Uploaded</p><p className="mt-1 text-2xl font-black text-[#0EA5E9]">{files.filter((item) => item.uploadStatus === "uploaded").length}</p></CardContent></Card>
          </div>

          {unmatchedFiles.length > 0 && files.some((item) => item.match) && (
            <Alert className="border-[#E11D48]/40 bg-[#E11D48]/5">
              <AlertCircle className="h-4 w-4 text-[#E11D48]" />
              <AlertDescription className="text-[#FDA4AF]">Unmatched files are not uploaded. Rename them to the exact product name or slug and select them again.</AlertDescription>
            </Alert>
          )}

          <Card className="border-[#1E293B] bg-[#111111]">
            <CardHeader className="flex-col items-stretch gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between">
              <div><CardTitle className="text-white">Image review</CardTitle><CardDescription className="text-[#64748B]">Review the filename-to-product matches before uploading.</CardDescription></div>
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Filter files" className="min-h-11 w-full rounded border border-[#1E293B] bg-[#0A0A0A] px-3 py-2 text-sm text-white outline-none focus:border-[#0EA5E9] sm:w-44" />
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {visibleFiles.map((item) => (
                  <div key={`${item.file.name}-${item.file.lastModified}`} className="overflow-hidden rounded border border-[#1E293B] bg-[#0A0A0A]">
                    <div className="flex h-36 items-center justify-center bg-[#090909]">
                      <img src={item.previewUrl} alt={item.file.name} className="h-full w-full object-contain" />
                    </div>
                    <div className="space-y-2 p-3">
                      <p className="truncate text-xs font-bold text-white" title={item.file.name}>{item.file.name}</p>
                      <p className="text-[11px] text-[#64748B]">{formatBytes(item.file.size)}</p>
                      {item.match?.product ? (
                        <div className="flex items-start gap-2 text-xs text-[#A7F3D0]"><CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" /><span className="line-clamp-2">{item.match.product.name}</span></div>
                      ) : item.match ? (
                        <div className="flex items-start gap-2 text-xs text-[#FDA4AF]"><XCircle className="mt-0.5 h-4 w-4 flex-shrink-0" /><span>Unmatched product</span></div>
                      ) : (
                        <div className="text-xs text-[#64748B]">Not matched yet</div>
                      )}
                      {item.uploadStatus === "uploaded" && <p className="text-xs font-bold uppercase tracking-wide text-[#0EA5E9]">Uploaded</p>}
                      {item.uploadStatus === "failed" && <p className="text-xs text-[#FDA4AF]">{item.error}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
