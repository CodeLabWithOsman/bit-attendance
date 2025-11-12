"use client"

import { X, AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react"
import { useEffect } from "react"

export interface CustomDialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  type?: "success" | "error" | "warning" | "info"
  actions?: {
    label: string
    onClick: () => void
    variant?: "primary" | "secondary" | "danger"
  }[]
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
}

export default function CustomDialog({
  isOpen,
  onClose,
  title,
  message,
  type = "info",
  actions,
  showCloseButton = true,
  closeOnOverlayClick = true,
}: CustomDialogProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!isOpen) return null

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-12 h-12 text-green-500" />
      case "error":
        return <XCircle className="w-12 h-12 text-red-500" />
      case "warning":
        return <AlertTriangle className="w-12 h-12 text-yellow-500" />
      default:
        return <Info className="w-12 h-12 text-blue-500" />
    }
  }

  const getButtonClass = (variant: string = "primary") => {
    switch (variant) {
      case "danger":
        return "px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105"
      case "secondary":
        return "px-6 py-3 border border-border hover:bg-muted text-foreground rounded-lg font-medium transition-all duration-200"
      default:
        return "px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105"
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={closeOnOverlayClick ? onClose : undefined}
    >
      {/* Glassmorphic overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Dialog */}
      <div
        className="relative bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        )}

        {/* Content */}
        <div className="p-8">
          {/* Icon */}
          <div className="flex justify-center mb-4">{getIcon()}</div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center mb-4">{title}</h2>

          {/* Message */}
          <p className="text-foreground/80 text-center whitespace-pre-line mb-6">{message}</p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {actions && actions.length > 0 ? (
              actions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => {
                    action.onClick()
                    if (action.variant !== "secondary") {
                      onClose()
                    }
                  }}
                  className={getButtonClass(action.variant)}
                >
                  {action.label}
                </button>
              ))
            ) : (
              <button onClick={onClose} className={getButtonClass("primary")}>
                Okay
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Simple dialog for backwards compatibility
interface DialogProps {
  message: string
  onClose: () => void
}

export function Dialog({ message, onClose }: DialogProps) {
  return (
    <CustomDialog
      isOpen={true}
      onClose={onClose}
      title="Notification"
      message={message}
      type="info"
    />
  )
}
