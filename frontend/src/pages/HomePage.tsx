import React from 'react';
import { Hero } from '../components/hero/Hero';
import { Pillars } from '../components/sections/Pillars';
import { EventsGrid } from '../components/sections/EventsGrid';
import { ProjectsGrid } from '../components/sections/ProjectsGrid';
import { MascotBanner } from '../components/sections/MascotBanner';
import { Manifesto } from '../components/sections/Manifesto';
import { Event } from '../types';

interface HomePageProps {
  onOpenJoin: () => void;
  onOpenRsvp: (event: Event) => void;
  onOpenSubmitProject: () => void;
  refreshKey: number;
}

export const HomePage: React.FC<HomePageProps> = ({
  onOpenJoin,
  onOpenRsvp,
  onOpenSubmitProject,
  refreshKey
}) => {
  return (
    <div>
      <Hero onOpenJoin={onOpenJoin} />
      <Pillars />
      
      {/* Featured Top 3 Events */}
      <EventsGrid 
        key={`home-events-${refreshKey}`}
        limit={3}
        showViewAll={true}
        onOpenRsvp={onOpenRsvp}
      />

      {/* Featured Top 3 Projects */}
      <ProjectsGrid 
        key={`home-projects-${refreshKey}`}
        limit={3}
        showViewAll={true}
        onOpenSubmitProject={onOpenSubmitProject}
      />

      <MascotBanner />
      <Manifesto />
    </div>
  );
};
