import React, { createContext, useContext, useState, useEffect } from 'react';

export type VibeId = 'hacker' | 'systems' | 'vibe' | 'kernel';

export interface VibeData {
  id: VibeId;
  name: string;
  role: string;
  emoticon: string;
  color: string;
  glow: string;
  subtle: string;
  quote: string;
  tips: string[];
}

export const VIBES: Record<VibeId, VibeData> = {
  hacker: {
    id: 'hacker',
    name: 'The Happy Hacker',
    role: 'Open Source Explorer',
    emoticon: ':)',
    color: '#08B74F',
    glow: 'rgba(8, 183, 79, 0.35)',
    subtle: 'rgba(8, 183, 79, 0.12)',
    quote: 'Every master was once a beginner who refused to stop tinkering.',
    tips: [
      'git commit --amend lets you quickly fix your last commit message or staging without a messy extra commit!',
      'git log --oneline --graph --all displays a clean ASCII visualization of your Git branches.',
      'gh repo fork <owner/repo> --clone forks and clones any open-source repo in one CLI command.',
      'Starred a great repo? Star it on GitHub and feature your fork on our Project Radar!'
    ]
  },
  systems: {
    id: 'systems',
    name: 'The Systems Master',
    role: 'Systems & Backend Architect',
    emoticon: ';)',
    color: '#2B7FFF',
    glow: 'rgba(43, 127, 255, 0.35)',
    subtle: 'rgba(43, 127, 255, 0.12)',
    quote: 'Talk is cheap. Show me the code.',
    tips: [
      'grep -rnw . -e "search_term" searches recursively across code files in seconds.',
      'btop and htop give you instant terminal-based GPU/CPU and process telemetry.',
      'docker system prune -a safely reclaims gigabytes of cached unused containers and layers.',
      'curl -IL <url> inspects all HTTP redirects and response headers directly from the terminal.'
    ]
  },
  vibe: {
    id: 'vibe',
    name: 'The Vibe Coder',
    role: 'UI/UX & Creative Craftsman',
    emoticon: '^_^',
    color: '#F5C040',
    glow: 'rgba(245, 192, 64, 0.35)',
    subtle: 'rgba(245, 192, 64, 0.12)',
    quote: 'Good software is functional. Great software is a joy to experience.',
    tips: [
      'console.table(data) renders arrays of objects into neat inspectable tables in devtools.',
      'Use CSS clamp(min, val, max) for fluid responsive typography without media queries.',
      'Shift + Click on Chrome devtools color picker toggles between HEX, RGB, and HSL formats.',
      'npm outdated lists newer dependencies with breaking-change color codes.'
    ]
  },
  kernel: {
    id: 'kernel',
    name: 'The Kernel Debugger',
    role: 'Low-Level & OS Hacker',
    emoticon: ':|',
    color: '#E84A36',
    glow: 'rgba(232, 74, 54, 0.35)',
    subtle: 'rgba(232, 74, 54, 0.12)',
    quote: "There is no cloud, just someone else's Linux computer.",
    tips: [
      'strace -c <command> profiles system calls to pinpoint I/O and latency bottlenecks.',
      'dmesg -T prints kernel ring buffer messages with human-readable timestamps.',
      'valgrind --leak-check=full pinpoint exact memory leaks in C and C++ programs.',
      'journalctl -xeu <service> inspects systemd unit crash logs and traceback dumps.'
    ]
  }
};

interface VibeContextType {
  activeVibe: VibeData;
  setVibe: (vibeId: VibeId) => void;
  activeTipIndex: number;
  nextTip: () => void;
}

const VibeContext = createContext<VibeContextType | undefined>(undefined);

export const VibeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vibeId, setVibeId] = useState<VibeId>(() => {
    const saved = localStorage.getItem('foss_builder_vibe') as VibeId;
    return saved && VIBES[saved] ? saved : 'hacker';
  });

  const [activeTipIndex, setActiveTipIndex] = useState(0);

  const activeVibe = VIBES[vibeId];

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--vibe-accent', activeVibe.color);
    root.style.setProperty('--vibe-glow', activeVibe.glow);
    root.style.setProperty('--vibe-subtle', activeVibe.subtle);
    localStorage.setItem('foss_builder_vibe', vibeId);
  }, [activeVibe, vibeId]);

  const setVibe = (id: VibeId) => {
    if (VIBES[id]) {
      setVibeId(id);
      setActiveTipIndex(0);
    }
  };

  const nextTip = () => {
    setActiveTipIndex(prev => (prev + 1) % activeVibe.tips.length);
  };

  return (
    <VibeContext.Provider value={{ activeVibe, setVibe, activeTipIndex, nextTip }}>
      {children}
    </VibeContext.Provider>
  );
};

export const useVibe = () => {
  const context = useContext(VibeContext);
  if (!context) {
    throw new Error('useVibe must be used within a VibeProvider');
  }
  return context;
};
