import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/utils/cn";

/**
 * Renders markdown descriptions (headings, lists, bold, links) for admin review UIs.
 */
export function MarkdownContent({
  content,
  className,
  emptyFallback = "No description provided.",
}) {
  const text = typeof content === "string" ? content.trim() : "";
  if (!text) {
    return <p className={cn("text-sm text-slate-500", className)}>{emptyFallback}</p>;
  }

  return (
    <div
      className={cn(
        "markdown-body text-sm leading-relaxed text-slate-700",
        "[&>:first-child]:mt-0 [&>:last-child]:mb-0",
        "[&_h1]:mt-4 [&_h1]:mb-2 [&_h1]:text-xl [&_h1]:font-semibold [&_h1]:text-slate-900",
        "[&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-slate-900",
        "[&_h3]:mt-3 [&_h3]:mb-1.5 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-slate-900",
        "[&_h4]:mt-3 [&_h4]:mb-1 [&_h4]:text-sm [&_h4]:font-semibold [&_h4]:text-slate-900",
        "[&_p]:my-2",
        "[&_strong]:font-semibold [&_strong]:text-slate-900",
        "[&_em]:italic",
        "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1",
        "[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1",
        "[&_a]:font-medium [&_a]:text-brand-600 [&_a]:underline-offset-2 hover:[&_a]:underline",
        "[&_blockquote]:border-l-2 [&_blockquote]:border-slate-200 [&_blockquote]:pl-3 [&_blockquote]:italic",
        "[&_hr]:my-4 [&_hr]:border-slate-200",
        "[&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.85em]",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

export default MarkdownContent;
