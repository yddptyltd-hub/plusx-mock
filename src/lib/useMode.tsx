"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Mode = "simple" | "pro";

interface ModeContextType {
  mode: Mode;
  setMode: (m: Mode) => void;
}

const ModeContext = createContext<ModeContextType>({ mode: "simple", setMode: () => {} });

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<Mode>("simple");

  useEffect(() => {
    const stored = localStorage.getItem("plusx_mode");
    if (stored === "pro" || stored === "simple") setModeState(stored);
  }, []);

  function setMode(m: Mode) {
    setModeState(m);
    localStorage.setItem("plusx_mode", m);
  }

  return (
    <ModeContext.Provider value={{ mode, setMode }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode(): ModeContextType {
  return useContext(ModeContext);
}

export default function ProOnly({ children }: { children: React.ReactNode }) {
  const { mode } = useMode();
  if (mode !== "pro") return null;
  return <>{children}</>;
}
