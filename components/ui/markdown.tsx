"use client";

import ReactMarkdown from "react-markdown";
// @ts-ignore
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// @ts-ignore
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "@/lib/utils";

interface MarkdownProps {
  content: string;
  className?: string;
}

export function Markdown({ content, className }: MarkdownProps) {
  return (
    <div className={cn("prose prose-slate dark:prose-invert max-w-none antialiased", className)}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => <h1 className="text-3xl font-extrabold mt-8 mb-4 tracking-tight text-foreground">{children}</h1>,
          h2: ({ children }) => <h2 className="text-2xl font-bold mt-8 mb-4 tracking-tight border-b pb-2 text-foreground/90">{children}</h2>,
          h3: ({ children }) => <h3 className="text-xl font-semibold mt-6 mb-3 tracking-tight text-foreground/80">{children}</h3>,
          p: ({ children }) => <p className="mb-4 leading-relaxed text-muted-foreground leading-7">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-6 mb-6 space-y-2 text-muted-foreground">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-6 mb-6 space-y-2 text-muted-foreground">{children}</ol>,
          li: ({ children }) => <li className="pl-1">{children}</li>,
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <div className="relative group my-6">
                <div className="absolute -inset-2 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
                <SyntaxHighlighter
                  style={vscDarkPlus}
                  language={match[1]}
                  PreTag="div"
                  className="rounded-xl !bg-slate-950 !m-0 border border-white/5 shadow-2xl relative"
                  {...props}
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code className={cn("bg-muted/50 border border-border/50 px-1.5 py-0.5 rounded text-sm font-mono text-primary font-medium", className)} {...props}>
                {children}
              </code>
            );
          },
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary/40 pl-6 italic my-8 text-foreground/70 bg-primary/5 py-4 pr-4 rounded-r-lg">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-8 border-t border-border/50" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
