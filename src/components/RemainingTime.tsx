
import React, { useState, useEffect } from 'react';
import { differenceInSeconds, differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';

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
      
      if (now > deadlineDate) {
        return 'Expirado';
      }
      
      const seconds = differenceInSeconds(deadlineDate, now) % 60;
      const minutes = differenceInMinutes(deadlineDate, now) % 60;
      const hours = differenceInHours(deadlineDate, now) % 24;
      const days = differenceInDays(deadlineDate, now);
      
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
  }, [deadline]);
  
  return <span>{remainingTime}</span>;
};

export default RemainingTime;
