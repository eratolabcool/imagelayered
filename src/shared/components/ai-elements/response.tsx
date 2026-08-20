"use client";

import { cn } from "@/shared/lib/utils";
import { type HTMLAttributes, memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export type ResponseProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  children?: string;
};

export const Response = memo(
  ({ className, children = "", ...props }: ResponseProps) => (
    <div
      className={cn(
        "size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
        className
      )}
      {...props}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  ),
  (prevProps, nextProps) => prevProps.children === nextProps.children
);

Response.displayName = "Response";
