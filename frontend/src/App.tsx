import React, { useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Hero } from './components/hero/Hero';
import { Pillars } from './components/sections/Pillars';
import { EventsGrid } from './components/sections/EventsGrid';
import { ProjectsGrid } from './components/sections/ProjectsGrid';
import { MascotBanner } from './components/sections/MascotBanner';
import { Manifesto } from './components/sections/Manifesto';
import { JoinModal } from './components/modals/JoinModal';
import { RsvpModal } from './components/modals/RsvpModal';
import { ProjectModal } from './components/modals/ProjectModal';
import { Event } from './types';

export const App: React.FC = () => {
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isProjectOpen, setIsProjectOpen] = useState(false);
  const [selectedRsvpEvent, setSelectedRsvpEvent] = useState<Event | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <>
      <div className="ambient-glow" />

      {/* Navigation Header */}
      <Navbar onOpenJoin={() => setIsJoinOpen(true)} />

      {/* Main Content Sections */}
      <main>
        <Hero onOpenJoin={() => setIsJoinOpen(true)} />
        <Pillars />
        <EventsGrid 
          key={`events-${refreshKey}`} 
          onOpenRsvp={(event) => setSelectedRsvpEvent(event)} 
        />
        <ProjectsGrid 
          key={`projects-${refreshKey}`} 
          onOpenSubmitProject={() => setIsProjectOpen(true)} 
        />
        <MascotBanner />
        <Manifesto />
      </main>

      {/* Footer */}
      <Footer onOpenJoin={() => setIsJoinOpen(true)} />

      {/* Interactive Modals */}
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
    </>
  );
};
export default App;
