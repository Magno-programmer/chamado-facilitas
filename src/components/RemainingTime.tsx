
import React, { useState, useEffect } from 'react';

interface RemainingTimeProps {
  deadline: string;
  createdAt?: string;
  onExpired?: () => void;
}

const RemainingTime: React.FC<RemainingTimeProps> = ({ deadline, createdAt, onExpired }) => {
  const [remainingTime, setRemainingTime] = useState<string>('');
  const [isExpired, setIsExpired] = useState<boolean>(false);
  
  useEffect(() => {
    const calculateRemainingTime = () => {
      const now = new Date();
      const deadlineDate = new Date(deadline);
      
      if (now > deadlineDate) {
        if (!isExpired) {
          setIsExpired(true);
          onExpired?.();
        }
        return 'Expirado';
      }
      
      // Reset expired state if deadline is updated and is now in the future
      if (isExpired) {
        setIsExpired(false);
      }
      
      // Calculate total seconds of difference
      const totalDiffInSeconds = Math.floor((deadlineDate.getTime() - now.getTime()) / 1000);
      
      // Calculate components
      const days = Math.floor(totalDiffInSeconds / (24 * 60 * 60));
      const hours = Math.floor((totalDiffInSeconds % (24 * 60 * 60)) / (60 * 60));
      const minutes = Math.floor((totalDiffInSeconds % (60 * 60)) / 60);
      const seconds = totalDiffInSeconds % 60;
      
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
  }, [deadline, isExpired, onExpired]);
  
  return <span>{remainingTime}</span>;
};

export default RemainingTime;
