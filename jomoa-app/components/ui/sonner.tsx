"use client"

import {
  CircleCheck,
  Info,
  LoaderCircle,
  OctagonX,
  TriangleAlert,
} from "lucide-react"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      icons={{
        success: <CircleCheck className="h-4 w-4" />,
        info: <Info className="h-4 w-4" />,
        warning: <TriangleAlert className="h-4 w-4" />,
        error: <OctagonX className="h-4 w-4" />,
        loading: <LoaderCircle className="h-4 w-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[#FEFCF8] group-[.toaster]:text-[#5A6B5D] group-[.toaster]:border-[rgba(232,229,224,0.4)] group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-[#5A6B5D]/70",
          actionButton:
            "group-[.toast]:bg-[#8B6F47] group-[.toast]:text-[#FEFCF8]",
          cancelButton:
            "group-[.toast]:bg-[#E8E5E0] group-[.toast]:text-[#5A6B5D]",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
