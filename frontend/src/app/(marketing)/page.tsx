'use client';
import React, { useState } from 'react';
import { Hero } from '@/components/marketing/Hero';
import { ProblemSolution } from '@/components/marketing/ProblemSolution';
import { PipelineSimulator } from '@/components/marketing/PipelineSimulator';
import { AgentRoster } from '@/components/marketing/AgentRoster';
import { DataProvenance } from '@/components/marketing/DataProvenance';
import { TechStack } from '@/components/marketing/TechStack';
import { DemoVideoSection } from '@/components/marketing/DemoVideoSection';
import { OpenSourceSection } from '@/components/marketing/OpenSourceSection';
import { TeamSection } from '@/components/marketing/TeamSection';
import { AgentInfo } from '@/data/marketing/agents';
import { AgentDetailModal } from '@/components/marketing/AgentDetailModal';
import { useMarketing } from '../../context/MarketingContext';

const HomePage = () => {
  const { openDemo, openWaitlist } = useMarketing();
  const [selectedAgent, setSelectedAgent] = useState<AgentInfo | null>(null);

  const scrollToSimulator = () => {
    const el = document.getElementById('simulator');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div>
      <Hero 
        onOpenDemo={openDemo}
        onOpenWaitlist={openWaitlist}
        onScrollToSimulator={scrollToSimulator}
      />
      <ProblemSolution />
      <PipelineSimulator />
      <AgentRoster onSelectAgent={setSelectedAgent} />
      <DataProvenance />
      <TechStack />
      <DemoVideoSection />
      <OpenSourceSection />
      <TeamSection />
      <AgentDetailModal agent={selectedAgent} onClose={() => setSelectedAgent(null)} />
    </div>
  );
};

export default HomePage;
