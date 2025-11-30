'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'

interface MarkdownMessageProps {
  content: string
}

export function MarkdownMessage({ content }: MarkdownMessageProps) {
  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
        h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-6 mb-4 text-slate-900 dark:text-slate-100" {...props} />,
        h2: ({node, ...props}) => <h2 className="text-xl font-semibold mt-5 mb-3 text-slate-900 dark:text-slate-100" {...props} />,
        h3: ({node, ...props}) => <h3 className="text-lg font-semibold mt-4 mb-2 text-slate-900 dark:text-slate-100" {...props} />,
        p: ({node, ...props}) => <p className="mb-4 last:mb-0 leading-relaxed" {...props} />,
        ul: ({node, ...props}) => <ul className="mb-4 pl-6 space-y-2 list-disc" {...props} />,
        ol: ({node, ...props}) => <ol className="mb-4 pl-6 space-y-2 list-decimal" {...props} />,
        li: ({node, ...props}) => <li className="leading-relaxed" {...props} />,
        strong: ({node, ...props}) => <strong className="font-semibold text-slate-900 dark:text-slate-100" {...props} />,
        em: ({node, ...props}) => <em className="italic" {...props} />,
        code: ({node, inline, ...props}: any) =>
          inline ? (
            <code className="bg-slate-100 dark:bg-zinc-800 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded text-sm font-mono" {...props} />
          ) : (
            <code className="font-mono text-sm" {...props} />
          ),
        pre: ({node, ...props}) => <pre className="rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 overflow-x-auto my-4" {...props} />,
        table: ({node, ...props}) => <table className="w-full border-collapse my-4 text-sm" {...props} />,
        thead: ({node, ...props}) => <thead className="bg-slate-50 dark:bg-zinc-800" {...props} />,
        th: ({node, ...props}) => <th className="border border-slate-200 dark:border-zinc-700 px-4 py-2 text-left font-semibold" {...props} />,
        td: ({node, ...props}) => <td className="border border-slate-200 dark:border-zinc-700 px-4 py-2" {...props} />,
        a: ({node, ...props}) => <a className="text-blue-600 dark:text-blue-400 hover:underline" {...props} />,
        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-slate-300 dark:border-slate-600 pl-4 py-2 my-4 italic text-slate-700 dark:text-slate-300" {...props} />,
        hr: ({node, ...props}) => <hr className="border-slate-200 dark:border-zinc-700 my-6" {...props} />,
      }}
    >
      {content}
    </ReactMarkdown>
    </div>
  )
}
