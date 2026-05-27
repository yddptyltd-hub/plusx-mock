"use client";

import React, { useEffect } from "react";
import { copyData } from "@/lib/data";
import termsData from "@/lib/references/plusx_lpx_terms_of_use.json";

export default function Docs() {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const id = window.location.hash.substring(1);
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, []);

  const sections = termsData.full.split(/\n(\d+)\.\s+/);
  const parsedSections = [];
  
  for (let i = 1; i < sections.length; i += 2) {
    parsedSections.push({
      number: sections[i],
      content: sections[i+1]
    });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-6 lg:py-10 flex flex-col lg:flex-row gap-8 lg:gap-12">
      <aside className="w-full lg:w-60 shrink-0 lg:sticky lg:top-24 lg:self-start">
        <nav className="space-y-1">
          <div className="text-[11px] font-bold text-text-tertiary uppercase tracking-widest mb-4">Documentation</div>
          <a href="/docs#overview" className="block py-2 text-sm font-medium text-text-secondary hover:text-brand-teal transition-colors">Overview</a>
          <a href="/docs#terms-of-use" className="block py-2 text-sm font-semibold text-brand-teal">LPX Terms of Use</a>
          <a href="/docs#risks" className="block py-2 text-sm font-medium text-text-secondary hover:text-brand-teal transition-colors">uP Ecosystem Risks</a>
          <a href="/docs#faq" className="block py-2 text-sm font-medium text-text-secondary hover:text-brand-teal transition-colors">FAQ</a>
        </nav>
      </aside>

      <article className="flex-1 max-w-3xl prose prose-slate">
        <h1 id="terms-of-use" className="text-3xl font-bold text-text-primary mb-8">LPX Terms of Use</h1>
        
        <div className="bg-slate-50 p-6 rounded-2xl mb-10 text-sm text-text-secondary leading-relaxed border border-border">
          {copyData.disclaimer.websiteTermsIntro}
        </div>

        <div className="space-y-10">
          {parsedSections.map((section) => (
            <div key={section.number} id={`section-${section.number}`}>
              <h2 className="text-xl font-bold text-text-primary mb-4">
                {section.number}. {section.content.split('\n')[0]}
              </h2>
              <div className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                {section.content.split('\n').slice(1).join('\n').trim()}
              </div>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}
