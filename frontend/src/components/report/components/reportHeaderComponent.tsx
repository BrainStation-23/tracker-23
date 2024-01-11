import classNames from "classnames";
import React from "react";
import type { PropsWithChildren } from "react";

export default function ReportHeaderComponent({
  title,
  children,
  className,
  innerClassName,
  exportButton,
}: PropsWithChildren<{
  title?: string;
  className?: string;
  innerClassName?: string;
  exportButton?: React.ReactNode;
}>) {
  return (
    <div className={classNames("my-5 flex w-full flex-col  gap-4", className)}>
      {exportButton && title ? (
        <div className="flex items-center justify-between gap-3">
          <div className="text-2xl font-semibold">{title}</div>
          {exportButton}
        </div>
      ) : title ? (
        <div className="text-xl font-semibold">{title}</div>
      ) : exportButton ? (
        <div className="flex items-center justify-end">{exportButton}</div>
      ) : (
        <></>
      )}
      <div className="flex h-auto w-full">
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
