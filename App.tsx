import React, { Component, ErrorInfo, ReactNode } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatWidget from './components/ChatWidget';

// Pages
import Home from './pages/Home';
import Services from './pages/Services';
import Gallery from './pages/Gallery';
import About from './pages/About';
import Quote from './pages/Quote';
import DesignStudio from './pages/DesignStudio';
import Community from './pages/Community';
import Diagnostics from './pages/Diagnostics';

// Context Providers
import { ContentProvider } from './context/ContentContext';
import { GalleryProvider } from './context/GalleryContext';
import { CommunityProvider } from './context/CommunityContext';

// Services
import { diagnostics } from './services/diagnostics';

// Define explicit interfaces for Props and State
interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

// Fix: Extending the Component class directly from the 'react' import ensures that TypeScript correctly identifies 'state' and 'props' via the generic parameters.
class GlobalErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    // Properly initialize state on the instance with the defined interface
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    // Return a new state object to trigger the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    diagnostics.log('error', `CRITICAL UI CRASH: ${error.message}`, errorInfo.componentStack);
  }

  render() {
    // Check state property which is now correctly recognized by inheriting from the generic Component
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-brand-cream flex items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md bg-white p-12 rounded-[2.5rem] shadow-2xl border border-gray-100">
            <h1 className="text-4xl font-serif font-bold text-brand-dark mb-4">Oops!</h1>
            <p className="text-gray-600 mb-8 leading-relaxed">The application encountered an unexpected error. This usually happens due to a connection timeout or a security restriction in the preview frame.</p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => window.location.hash = '/'}
                className="px-8 py-4 bg-brand-green text-white rounded-2xl font-bold shadow-lg hover:bg-brand-light transition-all"
              >
                Back to Safety
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="px-8 py-4 bg-brand-cream text-brand-dark border border-brand-green/10 rounded-2xl font-bold hover:bg-white transition-all"
              >
                Reload Application
              </button>
            </div>
          </div>
        </div>
      );
    }
    // Access props property which is now correctly recognized via inheritance
    return this.props.children;
  }
}

const App = () => {
  return (
    <GlobalErrorBoundary>
      <ContentProvider>
        <GalleryProvider>
          <CommunityProvider>
            {/* HashRouter is required for framed environments like AI Studio preview to avoid "refused to connect" pathing errors */}
            <Router>
              <div className="flex flex-col min-h-screen font-sans selection:bg-brand-accent selection:text-white bg-brand-cream">
                <Navbar />
                
                <main className="flex-grow">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/gallery" element={<Gallery />} />
                    <Route path="/design-studio" element={<DesignStudio />} />
                    <Route path="/community" element={<Community />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/quote" element={<Quote />} />
                    <Route path="/diagnostics" element={<Diagnostics />} />
                    {/* Catch-all route to prevent blank pages or 404s */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>

                <Footer />
                <ChatWidget />
              </div>
            </Router>
          </CommunityProvider>
        </GalleryProvider>
      </ContentProvider>
    </GlobalErrorBoundary>
  );
};

export default App;