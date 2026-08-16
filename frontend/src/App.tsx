import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { EventsPage } from './pages/EventsPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { JoinModal } from './components/modals/JoinModal';
import { RsvpModal } from './components/modals/RsvpModal';
import { ProjectModal } from './components/modals/ProjectModal';
import { GridBackground } from './components/ui/GridBackground';
import { Event } from './types';

// Automatically scroll to top or hash target on route change with navbar offset
const ScrollToTop: React.FC = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      setTimeout(() => {
        const id = hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          const navHeight = 74;
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({
            top: Math.max(0, elementPosition - navHeight),
            behavior: 'smooth'
          });
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
};

export const App: React.FC = () => {
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isProjectOpen, setIsProjectOpen] = useState(false);
  const [selectedRsvpEvent, setSelectedRsvpEvent] = useState<Event | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        {/* Interactive Spotlight Grid & Glow Background */}
        <GridBackground />
        <div className="ambient-glow" />

        {/* Navigation Header */}
        <Navbar onOpenJoin={() => setIsJoinOpen(true)} />

        {/* Main Content Routed Pages */}
        <main>
          <Routes>
            <Route 
              path="/" 
              element={
                <HomePage 
                  onOpenJoin={() => setIsJoinOpen(true)}
                  onOpenRsvp={(event) => setSelectedRsvpEvent(event)}
                  onOpenSubmitProject={() => setIsProjectOpen(true)}
                  refreshKey={refreshKey}
                />
              } 
            />
            <Route 
              path="/events" 
              element={
                <EventsPage 
                  onOpenRsvp={(event) => setSelectedRsvpEvent(event)}
                  refreshKey={refreshKey}
                />
              } 
            />
            <Route 
              path="/projects" 
              element={
                <ProjectsPage 
                  onOpenSubmitProject={() => setIsProjectOpen(true)}
                  refreshKey={refreshKey}
                />
              } 
            />
            <Route 
              path="/auth/callback" 
              element={<AuthCallbackPage />} 
            />
          </Routes>
        </main>

        {/* Footer */}
        <Footer onOpenJoin={() => setIsJoinOpen(true)} />

        {/* Interactive Global Modals */}
        <JoinModal 
          isOpen={isJoinOpen} 
          onClose={() => setIsJoinOpen(false)} 
        />

        <RsvpModal 
          event={selectedRsvpEvent} 
          onClose={() => setSelectedRsvpEvent(null)}
          onSuccess={() => setRefreshKey(prev => prev + 1)}
        />

        <ProjectModal 
          isOpen={isProjectOpen} 
          onClose={() => setIsProjectOpen(false)}
          onSuccess={() => setRefreshKey(prev => prev + 1)}
        />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
