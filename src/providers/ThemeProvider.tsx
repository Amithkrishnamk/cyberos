"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { CyberTheme } from "@/types";

interface ThemeContextType {
  theme: CyberTheme;
  setTheme: (theme: CyberTheme) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { data: session, update } = useSession();
  const [theme, setThemeState] = useState<CyberTheme>("cyan");

  const applyThemeToDOM = (t: CyberTheme) => {
    document.documentElement.setAttribute("data-theme", t);
    if (document.body) {
      document.body.setAttribute("data-theme", t);
    }
  };

  useEffect(() => {
    let activeTheme: CyberTheme = "cyan";
    if (session?.user && (session.user as any).theme) {
      activeTheme = (session.user as any).theme as CyberTheme;
    } else {
      const localTheme = localStorage.getItem("cyber_theme") as CyberTheme;
      if (localTheme) activeTheme = localTheme;
    }
    setThemeState(activeTheme);
    applyThemeToDOM(activeTheme);
  }, [session]);

  const setTheme = async (newTheme: CyberTheme) => {
    setThemeState(newTheme);
    applyThemeToDOM(newTheme);
    localStorage.setItem("cyber_theme", newTheme);

    if (session?.user) {
      try {
        await fetch("/api/user/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ theme: newTheme }),
        });
        if (update) {
          await update({ theme: newTheme });
        }
      } catch (err) {
        console.error("Failed to persist theme to database:", err);
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useCyberTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useCyberTheme must be used within ThemeProvider");
  }
  return context;
}
