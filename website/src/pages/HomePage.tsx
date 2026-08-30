import React from 'react';
import { Hero } from '../components/Hero';
import { ProblemSolution } from '../components/ProblemSolution';
import { PipelineSimulator } from '../components/PipelineSimulator';
import { AgentRoster } from '../components/AgentRoster';
import { DataProvenance } from '../components/DataProvenance';
import { TechStack } from '../components/TechStack';
import { DemoVideoSection } from '../components/DemoVideoSection';
import { OpenSourceSection } from '../components/OpenSourceSection';
import { TeamSection } from '../components/TeamSection';
import { JudgeFeedbackSection } from '../components/JudgeFeedbackSection';
import { AgentInfo } from '../data/agents';

interface HomePageProps {
  onOpenDemo: () => void;
  onOpenWaitlist: () => void;
  onSelectAgent: (agent: AgentInfo) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ 
  onOpenDemo, 
  onOpenWaitlist, 
  onSelectAgent 
}) => {
  const scrollToSimulator = () => {
    const el = document.getElementById('simulator');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div>
      {/* 1. Hero Section */}
      <Hero 
        onOpenDemo={onOpenDemo}
        onOpenWaitlist={onOpenWaitlist}
        onScrollToSimulator={scrollToSimulator}
      />

      {/* 2. Problem vs Solution */}
      <ProblemSolution />

      {/* 3. Interactive Simulator */}
      <PipelineSimulator />

      {/* 4. Complete Agent Roster Deep Dive */}
      <AgentRoster 
        onSelectAgent={onSelectAgent}
      />

      {/* 5. Real vs. Simulated Data Provenance */}
      <DataProvenance />

      {/* 6. Tech Stack Badges & Architecture */}
      <TechStack />

      {/* 7. Demo Video & Product UI Views */}
      <DemoVideoSection />

      {/* 8. Apache 2.0 Open Source & Contributing */}
      <OpenSourceSection />

      {/* 9. Team & Credits */}
      <TeamSection />

      {/* 10. Live Judge Feedback Board */}
      <JudgeFeedbackSection />
    </div>
  );
};
