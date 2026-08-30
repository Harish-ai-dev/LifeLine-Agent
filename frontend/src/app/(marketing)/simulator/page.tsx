import React from 'react';
import { PipelineSimulator } from '@/components/marketing/PipelineSimulator';

const SimulatorPage: React.FC = () => {
  return (
    <div className="w-full pt-20 pb-20 bg-slate-50 dark:bg-[#0B1120]">
      <PipelineSimulator />
    </div>
  );
};

export default SimulatorPage;
