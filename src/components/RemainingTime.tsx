
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
      
      // Converte a deadline para UTC
      const deadlineDate = new Date(deadline + 'Z'); // Adicionando "Z" para indicar que é em UTC
      
      // If past the deadline, show expired
      if (now > deadlineDate) {
        return 'Expirado';
      }
      
      // Calculate remaining time directly
      const remainingTimeMs = deadlineDate.getTime() - now.getTime();
      const remainingTimeMinutes = Math.max(0, Math.floor(remainingTimeMs / 100000)); // Adjusted division value
      
      // Calculate components directly from minutes
      const days = Math.floor(remainingTimeMinutes / 1440); // 1440 minutes in a day (24 * 60)
      const hours = Math.floor((remainingTimeMinutes % 1440) / 60); // 60 minutes in an hour
      const minutes = remainingTimeMinutes % 60; // Remaining minutes
      
      // Format with leading zeros and handle day count
      if (days > 0) {
        return `${days}d ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      } else if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      } else {
        return `${minutes}m`;
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
