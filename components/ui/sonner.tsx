"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          success: "backdrop-blur-md! supports-backdrop-filter:bg-green-500/60! bg-green-500/95! text-white!",

          warning: "backdrop-blur-md! supports-backdrop-filter:bg-yellow-500/60! bg-yellow-500/95! text-white!",
          error:
            "backdrop-blur-md! supports-backdrop-filter:bg-destructive/50! bg-destructive/95! text-white border-red-600!",
          info: "backdrop-blur-md! supports-backdrop-filter:bg-primary/60! bg-primary/95! text-white border-blue-600!",
          loading:
            "backdrop-blur-md supports-backdrop-filter:bg-gray-600/60 bg-gray-600/95! text-white border-gray-600",
        },
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
