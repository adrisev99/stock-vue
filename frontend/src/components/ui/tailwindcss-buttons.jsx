import React from "react";
import { IconClipboard } from "@tabler/icons-react";
import { cn } from "../../utils/cn";

export const ButtonsCard = ({ children, className, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative inline-flex h-10 w-32 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50",
        className
      )}
    >
      <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
      <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-white text-black dark:bg-gray-800 dark:text-white px-3 py-1 text-sm font-medium backdrop-blur-3xl">
        {children}
      </span>
    </button>
  );
};
