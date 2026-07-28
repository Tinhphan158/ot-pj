"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, toast, type ToasterProps } from "sonner"

import { TOAST_ID_CLASS_PREFIX } from "@/shared/utils/notify"

const TOAST_ID_PATTERN = new RegExp(`(?:^|\\s)${TOAST_ID_CLASS_PREFIX}(\\S+)`)

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  // Click anywhere on a toast to dismiss it instead of waiting it out. Sonner
  // has no such option, so the id travels in a class that `notify()` sets.
  const dismissClickedToast = (event: React.MouseEvent<HTMLDivElement>) => {
    const item = (event.target as HTMLElement).closest("[data-sonner-toast]")
    if (!item) return

    const id = TOAST_ID_PATTERN.exec(item.className)?.[1]
    toast.dismiss(id ?? undefined)
  }

  return (
    <div onClick={dismissClickedToast}>
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
        toastOptions={{ className: "cursor-pointer" }}
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
    </div>
  )
}

export { Toaster }
