/**
 * Error Boundary Component
 * Catches React errors and displays fallback UI
 */

import { Component } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { logError } from '../utils/errorHandler'
import ENV from '../config/env'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(_error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Log error to monitoring service
    logError(error, {
      componentStack: errorInfo.componentStack,
      boundary: this.props.name || 'ErrorBoundary',
    })

    this.setState({
      error,
      errorInfo,
    })
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <AlertTriangle size={64} className="error-icon" />
            <h1>Bir şeyler ters gitti</h1>
            <p>Üzgünüz, beklenmeyen bir hata oluştu.</p>
            
            {ENV.IS_DEV && this.state.error && (
              <details className="error-details">
                <summary>Hata Detayları (Development Mode)</summary>
                <pre>{this.state.error.toString()}</pre>
                {this.state.errorInfo && (
                  <pre>{this.state.errorInfo.componentStack}</pre>
                )}
              </details>
            )}

            <div className="error-actions">
              <button 
                type="button" 
                className="primary-btn" 
                onClick={this.handleReset}
              >
                <RefreshCw size={18} />
                Tekrar Dene
              </button>
              <button 
                type="button" 
                className="outline-btn" 
                onClick={this.handleReload}
              >
                Sayfayı Yenile
              </button>
              <button 
                type="button" 
                className="ghost-btn" 
                onClick={this.handleGoHome}
              >
                <Home size={18} />
                Ana Sayfaya Dön
              </button>
            </div>

            <p className="error-help">
              Sorun devam ederse, lütfen yönetici ile iletişime geçin.
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
