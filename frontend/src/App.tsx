import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { VibeProvider } from './context/VibeContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { EventsPage } from './pages/EventsPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { RsvpModal } from './components/modals/RsvpModal';
import { SubmitProjectGuideModal } from './components/modals/SubmitProjectGuideModal';
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
  const [isSubmitGuideOpen, setIsSubmitGuideOpen] = useState(false);
  const [selectedRsvpEvent, setSelectedRsvpEvent] = useState<Event | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <VibeProvider>
      <BrowserRouter>
        <ScrollToTop />
        {/* Interactive Spotlight Grid & Dynamic Glow Background */}
        <GridBackground />
        <div className="ambient-glow" />

        {/* Navigation Header */}
        <Navbar />

        {/* Main Content Routed Pages */}
        <main>
          <Routes>
            <Route 
              path="/" 
              element={
                <HomePage 
                  onOpenSubmitProject={() => setIsSubmitGuideOpen(true)}
                  onOpenRsvp={(event) => setSelectedRsvpEvent(event)}
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
                  onOpenSubmitProject={() => setIsSubmitGuideOpen(true)}
                  refreshKey={refreshKey}
                />
              } 
            />
            <Route 
              path="/leaderboard" 
              element={
                <LeaderboardPage 
                  onOpenSubmitProject={() => setIsSubmitGuideOpen(true)}
                />
              } 
            />
          </Routes>
        </main>

        {/* Footer */}
        <Footer />

        {/* Interactive Modals */}
        <RsvpModal 
          event={selectedRsvpEvent} 
          onClose={() => setSelectedRsvpEvent(null)}
          onSuccess={() => setRefreshKey(prev => prev + 1)}
        />

        <SubmitProjectGuideModal 
          isOpen={isSubmitGuideOpen} 
          onClose={() => setIsSubmitGuideOpen(false)}
        />
      </BrowserRouter>
    </VibeProvider>
  );
};

export default App;
