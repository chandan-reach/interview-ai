import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        console.error('ErrorBoundary caught:', error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <main className="error-screen">
                    <h1>Something went wrong.</h1>
                    <p>{this.state.error?.message || 'Unknown error'}</p>
                </main>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
