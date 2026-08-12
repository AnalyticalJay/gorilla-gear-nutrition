import { FormEvent, useState } from "react";
import { MessageSquare, Send } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";

type QuoteComment = {
  id: number;
  orderId: number;
  userId: number;
  body: string;
  createdAt: Date | string;
  authorName: string;
  authorRole: "user" | "admin";
};

export default function QuoteConversation({
  orderId,
  comments,
  viewerRole = "user",
}: {
  orderId: number;
  comments?: QuoteComment[];
  viewerRole?: "user" | "admin";
}) {
  const [body, setBody] = useState("");
  const utils = trpc.useUtils();
  const addComment = trpc.orders.addComment.useMutation({
    onSuccess: () => {
      setBody("");
      toast.success("Message sent");
      utils.orders.detail.invalidate({ orderId });
      utils.orders.adminDetail.invalidate({ orderId });
    },
    onError: (error) => toast.error(error.message),
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = body.trim();
    if (!message) return;
    addComment.mutate({ orderId, body: message });
  };

  return (
    <section className="glass-card rounded-xl p-4 sm:p-6" aria-labelledby="quote-conversation-heading">
      <div className="mb-5 flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#0EA5E9]/30 bg-[#0EA5E9]/10 text-[#38BDF8]">
          <MessageSquare className="h-4 w-4" />
        </span>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#0EA5E9]">Quote conversation</p>
          <h2 id="quote-conversation-heading" className="mt-1 text-lg font-black text-white">Message the {viewerRole === "admin" ? "customer" : "admin"}</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Ask questions or share information about this quote. Your messages are visible to the other party.</p>
        </div>
      </div>

      <div className="mb-5 max-h-[26rem] space-y-3 overflow-y-auto pr-1" aria-live="polite">
        {comments && comments.length > 0 ? comments.map((comment) => {
          const isMine = comment.authorRole === viewerRole;
          return (
            <div key={comment.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <article className={`max-w-[92%] rounded-2xl border px-3.5 py-3 sm:max-w-[78%] ${isMine ? "border-[#0EA5E9]/30 bg-[#0EA5E9]/10" : "border-[#334155]/60 bg-[#111827]/70"}`}>
                <div className="mb-1.5 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-wide">
                  <span className={`font-bold ${comment.authorRole === "admin" ? "text-[#FDA4AF]" : "text-[#7DD3FC]"}`}>
                    {isMine ? "You" : comment.authorRole === "admin" ? "Anabolics Africa Admin" : comment.authorName}
                  </span>
                  <span className="text-[#64748B]">{format(new Date(comment.createdAt), "d MMM yyyy, HH:mm")}</span>
                </div>
                <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-200">{comment.body}</p>
              </article>
            </div>
          );
        }) : (
          <div className="rounded-lg border border-dashed border-[#334155] px-4 py-6 text-center text-sm text-muted-foreground">
            No messages yet. Start the conversation if you have a question about this quote.
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder={viewerRole === "admin" ? "Write a message to the customer..." : "Write a message to the admin..."}
          maxLength={2000}
          rows={3}
          className="min-h-24 resize-y bg-background/50 text-sm"
          aria-label="Quote message"
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-[11px] text-muted-foreground">{body.length}/2000 characters</span>
          <Button type="submit" className="min-h-11 text-white font-bold" disabled={!body.trim() || addComment.isPending}>
            <Send className="mr-2 h-4 w-4" />
            {addComment.isPending ? "Sending..." : "Send message"}
          </Button>
        </div>
      </form>
    </section>
  );
}
