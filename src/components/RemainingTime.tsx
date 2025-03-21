
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
      
      // Calculate remaining time directly
      const remainingTimeMs = deadlineDate.getTime() - now.getTime();
      const totalRemainingSeconds = Math.max(0, Math.floor(remainingTimeMs / 10));
      
      console.log('totalRemainingSeconds:', totalRemainingSeconds);
      
      // Calculate components directly from seconds
      const days = Math.floor(totalRemainingSeconds / 86400); // 86400 seconds in a day
      const hours = Math.floor((totalRemainingSeconds % 86400) / 3600); // 3600 seconds in an hour
      const minutes = Math.floor((totalRemainingSeconds % 3600) / 60); // 60 seconds in a minute
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
