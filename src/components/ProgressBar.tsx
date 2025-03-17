
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  percentage: number;
  className?: string;
  animate?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  percentage, 
  className,
  animate = true
}) => {
  const [width, setWidth] = useState(0);
  
  useEffect(() => {
    if (animate) {
      // Animate the progress bar
      const timer = setTimeout(() => {
        setWidth(percentage);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setWidth(percentage);
    }
  }, [percentage, animate]);

  const getColorClass = () => {
    if (percentage > 50) return 'bg-green-500';
    if (percentage > 20) return 'bg-amber-500';
    if (percentage > 10) return 'bg-orange-600';
    return 'bg-red-600';
  };

  return (
    <div className={cn('h-2 bg-gray-200 rounded-full overflow-hidden', className)}>
      <div 
        className={cn(
          'h-full transition-all duration-1000 ease-out',
          getColorClass()
        )}
        style={{ width: `${width}%` }}
      />
    </div>
  );
};

export default ProgressBar;
