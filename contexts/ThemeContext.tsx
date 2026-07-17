import { createContext, useContext, useState } from "react";
import { useColorScheme } from "react-native";

export type ThemeMode = "light" | "dark";

const darkColors = {
  background: "#070913",
  surface: "rgba(255,255,255,0.06)",
  surfaceSecondary: "rgba(255,255,255,0.04)",
  cardBackground: "rgba(255,255,255,0.06)",
  card: "rgba(15,23,42,0.95)",
  text: "#f8fafc",
  textSecondary: "rgba(226,232,240,0.75)",
  textTertiary: "rgba(226,232,240,0.45)",
  primary: "#6366f1",
  primaryLight: "#c7d2fe",
  accent: "#ff7850",
  success: "#10b981",
  border: "rgba(255,255,255,0.1)",
  borderLight: "rgba(255,255,255,0.06)",
  inputBackground: "rgba(255,255,255,0.08)",
  buttonPrimary: "#6366f1",
  buttonSecondary: "rgba(255,255,255,0.08)",
  buttonDisabled: "rgba(255,255,255,0.12)",
  buttonText: "#ffffff",
};

const lightColors = {
  background: "#f1f5f9",
  surface: "#ffffff",
  surfaceSecondary: "#f8fafc",
  cardBackground: "#ffffff",
  card: "rgba(255,255,255,0.95)",
  text: "#0f172a",
  textSecondary: "#64748b",
  textTertiary: "#94a3b8",
  primary: "#6366f1",
  primaryLight: "#4f46e5",
  accent: "#ff7850",
  success: "#10b981",
  border: "rgba(0,0,0,0.08)",
  borderLight: "rgba(0,0,0,0.04)",
  inputBackground: "#f8fafc",
  buttonPrimary: "#6366f1",
  buttonSecondary: "rgba(0,0,0,0.06)",
  buttonDisabled: "rgba(0,0,0,0.08)",
  buttonText: "#ffffff",
};

export type ThemeColors = typeof darkColors;

export interface Theme {
  mode: ThemeMode;
  colors: ThemeColors;
}

interface ThemeContextType {
  theme: Theme;
  themeType: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: { mode: "dark", colors: darkColors },
  themeType: "dark",
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();

  // start with system preference
  const [themeType, setThemeType] = useState<ThemeMode>(
    systemScheme === "light" ? "light" : "dark"
  );

  const colors = themeType === "dark" ? darkColors : lightColors;

  const toggleTheme = () => {
    setThemeType((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: { mode: themeType, colors },
        themeType,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  return useContext(ThemeContext);
}
