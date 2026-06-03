import { useEffect } from 'react'
import { CheckCircle2, X } from 'lucide-react'

export default function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return undefined
    const timeout = window.setTimeout(onDismiss, 2400)
    return () => window.clearTimeout(timeout)
  }, [onDismiss, toast])

  if (!toast) return null

  return (
    <div className={`toast ${toast.type}`} role="status" aria-live="polite">
      <CheckCircle2 size={18} />
      <span>{toast.message}</span>
      <button type="button" onClick={onDismiss} aria-label="Bildirimi kapat">
        <X size={15} />
      </button>
    </div>
  )
}
