"use client";

import React, { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { isFavorite, toggleFavorite } from "@/lib/useFavorites";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  id: string;
  onToggle?: () => void;
}

export function FavoriteButton({ id, onToggle }: FavoriteButtonProps) {
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    setFavorite(isFavorite(id));
  }, [id]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(id);
    setFavorite(!favorite);
    if (onToggle) onToggle();
  };

  return (
    <button
      onClick={handleToggle}
      className="p-1 hover:bg-slate-100 rounded-full transition-colors"
    >
      <Star
        className={cn(
          "w-4 h-4 transition-all",
          favorite ? "fill-brand-teal text-brand-teal scale-110" : "text-text-tertiary"
        )}
      />
    </button>
  );
}
