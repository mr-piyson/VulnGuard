"use client";

import ReactMarkdown from "react-markdown";
// @ts-ignore
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// @ts-ignore
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface LessonContentProps {
  lesson: {
    title: string;
    content: string;
    codeExample?: string | null;
    duration: number;
  };
}

export default function LessonContent({ lesson }: LessonContentProps) {
  return (
    <div className="space-y-6">
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <ReactMarkdown
          components={{
            h1: ({ children }) => <h1 className="text-3xl font-bold mt-8 mb-4">{children}</h1>,
            h2: ({ children }) => <h2 className="text-2xl font-bold mt-6 mb-3 border-b pb-2">{children}</h2>,
            h3: ({ children }) => <h3 className="text-xl font-bold mt-4 mb-2">{children}</h3>,
            code({ node, inline, className, children, ...props }: any) {
              const match = /language-(\w+)/.exec(className || "");
              return !inline && match ? (
                <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div" className="rounded-lg my-4" {...props}>
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
          }}
        >
          {lesson.content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
