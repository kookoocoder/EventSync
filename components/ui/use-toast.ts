"use client"

import * as React from "react"

export interface ToastProps {
  id?: string
  title?: string
  description?: string
  variant?: "default" | "destructive"
  duration?: number
  onDismiss?: () => void
}

interface ToastContextType {
  toasts: ToastProps[]
  toast: (props: ToastProps) => void
  dismissToast: (id?: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  const toast = React.useCallback((props: ToastProps) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast = { ...props, id }
    setToasts((prevToasts) => [...prevToasts, newToast])

    if (props.duration !== 0) {
      setTimeout(() => {
        dismissToast(id)
      }, props.duration || 5000)
    }
  }, [])

  const dismissToast = React.useCallback((id?: string) => {
    if (id) {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
    } else {
      setToasts((prevToasts) => prevToasts.slice(0, -1))
    }
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, toast, dismissToast }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  
  return context
} 