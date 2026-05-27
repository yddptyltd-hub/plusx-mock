"use client";

import React, { useState } from "react";
import { Star, User, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchBar } from "./SearchBar";

interface FilterChipsProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: { favorites: boolean; managed: boolean; solo: boolean }) => void;
}

export function FilterChips({ onSearch, onFilterChange }: FilterChipsProps) {
  const [favorites, setFavorites] = useState(false);
  const [managed, setManaged] = useState(false);
  const [solo, setSolo] = useState(false);

  const toggleFilter = (type: "favorites" | "managed" | "solo") => {
    let nextFilters = { favorites, managed, solo };
    if (type === "favorites") {
      nextFilters.favorites = !favorites;
      setFavorites(!favorites);
    } else if (type === "managed") {
      nextFilters.managed = !managed;
      setManaged(!managed);
    } else if (type === "solo") {
      nextFilters.solo = !solo;
      setSolo(!solo);
    }
    onFilterChange(nextFilters);
  };

  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      <SearchBar onSearch={onSearch} />

      <div className="flex items-center gap-3">
        <button
          onClick={() => toggleFilter("favorites")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full border text-[13px] font-medium transition-all",
            favorites
              ? "bg-brand-teal-light border-brand-teal text-brand-teal"
              : "bg-white border-border text-text-secondary hover:border-brand-teal"
          )}
        >
          <Star className={cn("w-3.5 h-3.5", favorites && "fill-brand-teal")} />
          Favorites
        </button>
        <button
          onClick={() => toggleFilter("managed")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full border text-[13px] font-medium transition-all",
            managed
              ? "bg-brand-teal-light border-brand-teal text-brand-teal"
              : "bg-white border-border text-text-secondary hover:border-brand-teal"
          )}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Managed Pools
        </button>
        <button
          onClick={() => toggleFilter("solo")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full border text-[13px] font-medium transition-all",
            solo
              ? "bg-brand-teal-light border-brand-teal text-brand-teal"
              : "bg-white border-border text-text-secondary hover:border-brand-teal"
          )}
        >
          <User className="w-3.5 h-3.5" />
          Solo Pools
        </button>
      </div>
    </div>
  );
}
