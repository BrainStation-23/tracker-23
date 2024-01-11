import classNames from "classnames";
import React from "react";
import type { PropsWithChildren } from "react";

export default function ReportHeaderComponent({
  title,
  children,
  className,
  innerClassName,
}: PropsWithChildren<{
  title: string;
  className?: string;
  innerClassName?: string;
}>) {
  return (
    <div
      className={classNames(
        "my-5 flex w-full justify-between gap-1",
        className
      )}
    >
      <div className="text-xl font-semibold">{title}</div>
      <div className="flex h-auto max-w-[950px] gap-2">
        <div
          className={classNames(
            "flex h-auto w-full flex-wrap items-center justify-end gap-6",
            innerClassName
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
