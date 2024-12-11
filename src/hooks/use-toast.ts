import { Toast } from "@/components/ui/toast"
import { useContext, createContext } from "react"

type ToasterToast = Toast & {
  id: string
  title?: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

type ToastContextType = {
  toasts: ToasterToast[]
  addToast: (toast: Omit<ToasterToast, "id">) => void
  removeToast: (id: string) => void
}

export const ToastContext = createContext<ToastContextType | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}