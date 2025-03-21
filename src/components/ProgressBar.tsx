
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  percentage: number;
  className?: string;
  animate?: boolean;
  deadline?: string;
  createdAt?: string;
  autoUpdate?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  percentage: initialPercentage, 
  className,
  animate = true,
  deadline,
  createdAt,
  autoUpdate = false
}) => {
  const [width, setWidth] = useState(0);
  const [currentPercentage, setCurrentPercentage] = useState(initialPercentage);
  
  // Function to calculate current percentage based on time
  const calculateCurrentPercentage = () => {
    if (!deadline || !createdAt) return initialPercentage;
    
    const now = new Date();
    const start = new Date(createdAt);
    const end = new Date(deadline + 'Z'); // Adding 'Z' to ensure UTC interpretation
    
    // If past the deadline, return 0
    if (now > end) return 0;
    
    const totalTime = end.getTime() - start.getTime();
    const elapsedTime = now.getTime() - start.getTime();
    
    const remainingPercentage = 100 - (elapsedTime / totalTime) * 100;
    return Math.max(0, Math.min(100, remainingPercentage));
  };

  // Update percentage initially and when props change
  useEffect(() => {
    if (deadline && createdAt) {
      setCurrentPercentage(calculateCurrentPercentage());
    } else {
      setCurrentPercentage(initialPercentage);
    }
  }, [deadline, createdAt, initialPercentage]);

  // Set up the interval for auto-updating
  useEffect(() => {
    if (!autoUpdate || (!deadline && !createdAt)) return;
    
    const timer = setInterval(() => {
      const newPercentage = calculateCurrentPercentage();
      setCurrentPercentage(newPercentage);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [autoUpdate, deadline, createdAt]);

  // Animation effect for the progress bar width
  useEffect(() => {
    if (animate) {
      // Animate the progress bar
      const timer = setTimeout(() => {
        setWidth(currentPercentage);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setWidth(currentPercentage);
    }
  }, [currentPercentage, animate]);

  const getColorClass = () => {
    if (currentPercentage > 50) return 'bg-green-500';
    if (currentPercentage > 20) return 'bg-amber-500';
    if (currentPercentage > 10) return 'bg-orange-600';
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
