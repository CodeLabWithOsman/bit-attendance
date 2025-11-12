"use client"

interface DialogProps {
  message: string
  onClose: () => void
}

export default function Dialog({ message, onClose }: DialogProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-card border border-border rounded-lg shadow-xl max-w-md w-full animate-in scale-in-95 duration-200">
        <div className="p-6 text-center">
          <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-indigo-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
          </div>
          <p className="text-foreground mb-6">{message}</p>
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
          >
            Okay
          </button>
        </div>
      </div>
    </div>
  )
}
