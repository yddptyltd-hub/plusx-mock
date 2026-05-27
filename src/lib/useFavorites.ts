"use client";

const FAVORITES_KEY = "plusx_favorites";

export function getFavorites(): string[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(FAVORITES_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function toggleFavorite(id: string): string[] {
  const favorites = getFavorites();
  const index = favorites.indexOf(id);
  let newFavorites: string[];
  
  if (index === -1) {
    newFavorites = [...favorites, id];
  } else {
    newFavorites = favorites.filter(favId => favId !== id);
  }
  
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
  return newFavorites;
}

export function isFavorite(id: string): boolean {
  return getFavorites().includes(id);
}
