import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { copyData } from "@/lib/data";

interface TooltipProps {
  contentKey: string;
  text?: string;
}

export function InfoTooltip({ contentKey, text: directText }: TooltipProps) {
  const text = directText ?? (copyData.tooltips as Record<string, string>)[contentKey];

  if (!text) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="cursor-help">
          <Info className="w-3.5 h-3.5 text-text-tertiary hover:text-text-secondary transition-colors" />
        </TooltipTrigger>
        <TooltipContent className="max-w-[280px] bg-slate-900 text-slate-50 border-none p-3 rounded-lg shadow-xl">
          <p className="text-xs leading-relaxed">{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Ensure "Tooltip" export exists if used elsewhere
export { InfoTooltip as Tooltip };
