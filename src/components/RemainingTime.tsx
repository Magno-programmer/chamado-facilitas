
import React, { useState, useEffect } from 'react';

interface RemainingTimeProps {
  deadline: string;
  createdAt?: string;
}

const RemainingTime: React.FC<RemainingTimeProps> = ({ deadline, createdAt }) => {
  const [remainingTime, setRemainingTime] = useState<string>('');
  
  useEffect(() => {
    const calculateRemainingTime = () => {
      const now = new Date();
      const deadlineDate = new Date(deadline);
      
      // If past the deadline, show expired
      if (now > deadlineDate) {
        return 'Expirado';
      }
      
      // Calculate total duration between creation and deadline
      const startDate = createdAt ? new Date(createdAt) : now;
      const totalDuration = deadlineDate.getTime() - startDate.getTime();
      
      // Calculate elapsed time since creation
      const elapsedTime = now.getTime() - startDate.getTime();
      
      // Calculate remaining time in seconds
      const totalRemainingSeconds = Math.floor((totalDuration - elapsedTime) / 1000);
      
      // Calculate components
      const days = Math.floor(totalRemainingSeconds / (24 * 60 * 60));
      const hours = Math.floor((totalRemainingSeconds % (24 * 60 * 60)) / (60 * 60));
      const minutes = Math.floor((totalRemainingSeconds % (60 * 60)) / 60);
      const seconds = totalRemainingSeconds % 60;
      
      // Format with leading zeros and handle day count
      if (days > 0) {
        return `${days}d ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      } else if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      } else if (minutes > 0) {
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      } else {
        return `${seconds}s`;
      }
    };
    
    setRemainingTime(calculateRemainingTime());
    
    const timer = setInterval(() => {
      setRemainingTime(calculateRemainingTime());
    }, 1000);
    
    return () => clearInterval(timer);
  }, [deadline, createdAt]);
  
  return <span>{remainingTime}</span>;
};

export default RemainingTime;
