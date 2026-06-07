import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    // Redirect to home page silently instead of showing an error screen
    window.location.href = '/';
  }

  render() {
    if (this.state.hasError) {
      return null; // Return null while the browser redirects
    }
    return this.props.children; 
  }
}
