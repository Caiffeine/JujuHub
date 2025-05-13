import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error to an error reporting service
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div style={{ 
          padding: '20px', 
          margin: '20px', 
          backgroundColor: 'rgba(255, 227, 230, 0.7)',
          borderRadius: '10px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#ff6b81' }}>Something went wrong</h2>
          <p>The application encountered an error. Please try refreshing the page.</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              backgroundColor: '#ff91a4',
              border: 'none',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              marginTop: '15px'
            }}
          >
            Refresh Page
          </button>
          {process.env.NODE_ENV === 'development' && (
            <details style={{ marginTop: '20px', textAlign: 'left' }}>
              <summary>Error Details</summary>
              <p>{this.state.error && this.state.error.toString()}</p>
              <div>
                {this.state.errorInfo && 
                  <pre style={{ 
                    overflowX: 'auto', 
                    background: '#f5f5f5', 
                    padding: '10px',
                    borderRadius: '5px' 
                  }}>
                    {this.state.errorInfo.componentStack}
                  </pre>
                }
              </div>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
