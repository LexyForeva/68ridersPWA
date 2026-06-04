/**
 * Loading Spinner Component
 * Displays loading state with optional text
 */

import { Loader2 } from 'lucide-react'

export default function LoadingSpinner({ 
  size = 24, 
  text = null, 
  fullScreen = false,
  className = '' 
}) {
  const spinner = (
    <div className={`loading-spinner ${className}`}>
      <Loader2 size={size} className="spinner-icon" />
      {text && <p className="spinner-text">{text}</p>}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="loading-spinner-fullscreen">
        {spinner}
      </div>
    )
  }

  return spinner
}

/**
 * Loading Skeleton Component
 * Displays placeholder while content loads
 */
export function LoadingSkeleton({ 
  width = '100%', 
  height = '20px', 
  borderRadius = '4px',
  className = '' 
}) {
  return (
    <div 
      className={`loading-skeleton ${className}`}
      style={{ width, height, borderRadius }}
    />
  )
}

/**
 * Card Skeleton
 */
export function CardSkeleton({ count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="card-skeleton">
          <LoadingSkeleton height="200px" borderRadius="12px" />
          <div className="card-skeleton-content">
            <LoadingSkeleton width="70%" height="24px" />
            <LoadingSkeleton width="100%" height="16px" />
            <LoadingSkeleton width="90%" height="16px" />
          </div>
        </div>
      ))}
    </>
  )
}

/**
 * List Skeleton
 */
export function ListSkeleton({ count = 5 }) {
  return (
    <div className="list-skeleton">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="list-skeleton-item">
          <LoadingSkeleton width="48px" height="48px" borderRadius="50%" />
          <div className="list-skeleton-content">
            <LoadingSkeleton width="60%" height="16px" />
            <LoadingSkeleton width="40%" height="14px" />
          </div>
        </div>
      ))}
    </div>
  )
}
