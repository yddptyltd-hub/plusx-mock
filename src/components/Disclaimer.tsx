"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { copyData } from "@/lib/data";

export function DisclaimerBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("plusx_disclaimer_dismissed");
    if (!dismissed) {
      setIsVisible(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem("plusx_disclaimer_dismissed", "1");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="bg-[#FFFBEB] border-b border-amber-200 px-4 sm:px-8 lg:px-12 py-2 flex items-center justify-between sticky top-0 z-[60]">
      <p className="text-[12px] text-amber-900 leading-tight pr-8">
        {copyData.disclaimer.firstVisitBanner}
      </p>
      <button
        onClick={dismiss}
        className="p-1 hover:bg-amber-100 rounded-md transition-colors"
      >
        <X className="w-4 h-4 text-amber-700" />
      </button>
    </div>
  );
}
