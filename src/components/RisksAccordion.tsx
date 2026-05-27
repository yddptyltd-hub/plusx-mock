"use client";

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { copyData } from "@/lib/data";

export function RisksAccordion() {
  return (
    <Accordion className="w-full">
      <AccordionItem value="risks" className="border border-border rounded-2xl px-6 bg-white overflow-hidden shadow-sm">
        <AccordionTrigger className="hover:no-underline py-4">
          <span className="text-sm font-bold text-text-primary">Technology & Market Risk</span>
        </AccordionTrigger>
        <AccordionContent className="pb-6">
          <div className="text-xs text-text-secondary leading-relaxed whitespace-pre-wrap">
            {copyData.disclaimer.lpxTermsOfUseExcerpt}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
