import { createContext, useCallback, useContext, useState, useRef, useEffect } from 'react'

/**
 * Toast notification system.
 * - ToastProvider mounts a fixed, bottom-right stack of toasts.
 * - useToast() exposes `showToast(message, type)` to trigger a toast.
 * - Each toast auto-dismisses after 3 seconds.
 */

const ToastContext = createContext(null)

const AUTO_DISMISS_MS = 3000

let _id = 0
const nextId = () => ++_id

const STYLES = {
  success: {
    container: 'bg-white border-emerald-200',
    icon: 'text-emerald-600',
    bar: 'bg-emerald-500',
    title: 'text-emerald-800',
  },
  error: {
    container: 'bg-white border-red-200',
    icon: 'text-red-600',
    bar: 'bg-red-500',
    title: 'text-red-800',
  },
  info: {
    container: 'bg-white border-blue-200',
    icon: 'text-blue-600',
    bar: 'bg-blue-600',
    title: 'text-blue-800',
  },
}

function Icon({ type }) {
  if (type === 'success') {
    return (
      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.7-9.3a1 1 0 00-1.4-1.4L9 10.6 7.7 9.3a1 1 0 00-1.4 1.4l2 2a1 1 0 001.4 0l4-4z" clipRule="evenodd" />
      </svg>
    )
  }
  if (type === 'error') {
    return (
      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.7 7.3a1 1 0 00-1.4 1.4L8.6 10l-1.3 1.3a1 1 0 101.4 1.4L10 11.4l1.3 1.3a1 1 0 001.4-1.4L11.4 10l1.3-1.3a1 1 0 00-1.4-1.4L10 8.6 8.7 7.3z" clipRule="evenodd" />
      </svg>
    )
  }
  return (
    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
  )
}

function ToastItem({ toast, onDismiss }) {
  const s = STYLES[toast.type] || STYLES.info
  return (
    <div
      className={`animate-fade-in-up pointer-events-auto flex w-80 overflow-hidden rounded-lg border ${s.container} card-shadow`}
      role="alert"
    >
      <div className={`flex w-1.5 flex-shrink-0 ${s.bar}`} />
      <div className="flex items-start gap-3 p-4">
        <span className={`mt-0.5 flex-shrink-0 ${s.icon}`}>
          <Icon type={toast.type} />
        </span>
        <div className="flex-1">
          <p className={`text-sm font-medium ${s.title}`}>
            {toast.title || (toast.type === 'success' ? 'Success' : toast.type === 'error' ? 'Error' : 'Info')}
          </p>
          <p className="mt-0.5 text-sm text-slate-600">{toast.message}</p>
        </div>
        <button
          onClick={() => onDismiss(toast.id)}
          className="flex-shrink-0 text-slate-400 transition hover:text-slate-600"
          aria-label="Dismiss"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef({})

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    if (timers.current[id]) {
      clearTimeout(timers.current[id])
      delete timers.current[id]
    }
  }, [])

  const showToast = useCallback(
    (message, type = 'info', title = null) => {
      const id = nextId()
      setToasts((prev) => [...prev, { id, message, type, title }])
      timers.current[id] = setTimeout(() => dismiss(id), AUTO_DISMISS_MS)
    },
    [dismiss],
  )

  // Clear all timers on unmount.
  useEffect(() => {
    const saved = timers.current
    return () => {
      Object.values(saved).forEach(clearTimeout)
    }
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-3">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return ctx
}

export default ToastProvider
