import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, CheckCircle, XCircle, Clock, User } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";

function StatusBadge({ status }: { status: string }) {
  if (status === "approved") return <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">Approved</Badge>;
  if (status === "rejected") return <Badge className="bg-destructive/20 text-destructive border-destructive/30 text-xs">Rejected</Badge>;
  return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">Pending</Badge>;
}

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const utils = trpc.useUtils();

  const usersQuery = trpc.admin.users.useQuery();
  const approve = trpc.admin.approveUser.useMutation({
    onSuccess: () => { utils.admin.users.invalidate(); utils.admin.stats.invalidate(); toast.success("User approved"); },
    onError: (e) => toast.error(e.message),
  });
  const reject = trpc.admin.rejectUser.useMutation({
    onSuccess: () => { utils.admin.users.invalidate(); utils.admin.stats.invalidate(); toast.success("User rejected"); },
    onError: (e) => toast.error(e.message),
  });

  const allUsers = usersQuery.data ?? [];
  const filtered = allUsers.filter((u) => {
    const matchFilter = filter === "all" || u.status === filter;
    const matchSearch = !search || u.fullName?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black" >
          User <span style={{ color: "#0EA5E9" }}>Management</span>
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Review and manage member applications</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-input border-border" />
        </div>
        <div className="flex flex-wrap gap-2">
          {(["all", "pending", "approved", "rejected"] as const).map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? "default" : "outline"}
              onClick={() => setFilter(f)}
              className={filter === f ? "text-white font-semibold" : "border-border/60 capitalize"}
            >
              {f}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        {usersQuery.isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-accent/20 rounded animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <User className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" />
            <p className="text-muted-foreground">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-border/40 text-xs text-muted-foreground">
                  <th className="text-left p-4 font-medium">User</th>
                  <th className="text-left p-4 font-medium">Phone</th>
                  <th className="text-left p-4 font-medium">City</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Joined</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id} className="border-b border-border/20 hover:bg-accent/10 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                          <span className="text-black font-bold text-xs">{user.fullName?.charAt(0) ?? "U"}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{user.fullName}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{user.phone ?? "—"}</td>
                    <td className="p-4 text-sm text-muted-foreground">{user.city ?? "—"}</td>
                    <td className="p-4"><StatusBadge status={user.status} /></td>
                    <td className="p-4 text-xs text-muted-foreground">{format(new Date(user.createdAt), "d MMM yyyy")}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {user.status !== "approved" && (
                          <button
                            onClick={() => approve.mutate({ userId: user.id })}
                            disabled={approve.isPending}
                            className="flex min-h-10 items-center gap-1 rounded bg-green-500/20 px-3 py-2 text-xs text-green-400 hover:bg-green-500/30 transition-colors"
                          >
                            <CheckCircle className="h-3 w-3" />
                            Approve
                          </button>
                        )}
                        {user.status !== "rejected" && (
                          <button
                            onClick={() => reject.mutate({ userId: user.id })}
                            disabled={reject.isPending}
                            className="flex min-h-10 items-center gap-1 rounded bg-destructive/20 px-3 py-2 text-xs text-destructive hover:bg-destructive/30 transition-colors"
                          >
                            <XCircle className="h-3 w-3" />
                            Reject
                          </button>
                        )}
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
