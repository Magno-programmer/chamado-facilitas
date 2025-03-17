
import React from 'react';
import { RefreshCw } from 'lucide-react';

const TicketsLoading: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 pt-20">
      <div className="flex items-center justify-center h-full">
        <RefreshCw className="h-12 w-12 text-primary animate-spin" />
      </div>
    </div>
  );
};

export default TicketsLoading;
