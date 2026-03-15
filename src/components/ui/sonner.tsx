"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          // ค่า Default ทั่วไป
          toast:
            "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800",

          // แยกสีเฉพาะตอนสั่ง toast.success(...)
          success: "!bg-green-600 !text-white !border-green-700",

          // แยกสีเฉพาะตอนสั่ง toast.error(...)
          error: "!bg-red-600 !text-white !border-red-700",

          // จัดการสีปุ่ม Action (ถ้ามี)
          actionButton: "!bg-zinc-100 !text-zinc-900",
        },
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
