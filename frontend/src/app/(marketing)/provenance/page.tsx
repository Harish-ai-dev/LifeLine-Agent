import React from 'react';
import { DataProvenance } from '@/components/marketing/DataProvenance';

const ProvenancePage: React.FC = () => {
  return (
    <div className="w-full pt-20 pb-20 bg-slate-50 dark:bg-[#0B1120]">
      <DataProvenance />
    </div>
  );
};

export default ProvenancePage;
