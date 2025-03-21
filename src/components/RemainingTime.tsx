
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
      
      console.log('RemainingTime Debug:', {
        now: now.toISOString(),
        deadline: deadline,
        deadlineDate: deadlineDate.toISOString(),
        createdAt: createdAt || 'Not provided'
      });
      
      // If past the deadline, show expired
      if (now > deadlineDate) {
        console.log('RemainingTime Debug: Deadline expired');
        return 'Expirado';
      }
      
      // Calculate total duration between creation and deadline
      const startDate = createdAt ? new Date(createdAt) : now;
      
      // Calculate remaining time directly
      const remainingTime = deadlineDate.getTime() - now.getTime();
      const totalRemainingSeconds = Math.max(0, Math.floor(remainingTime / 1000));
      
      console.log('RemainingTime Debug: Calculation details', {
        startDate: startDate.toISOString(),
        deadlineDate: deadlineDate.toISOString(),
        nowDate: now.toISOString(),
        remainingTime: remainingTime,
        remainingTimeInMinutes: remainingTime / (60 * 1000),
        totalRemainingSeconds: totalRemainingSeconds
      });
      
      // Calculate components
      const days = Math.floor(totalRemainingSeconds / (24 * 60 * 60));
      const hours = Math.floor((totalRemainingSeconds % (24 * 60 * 60)) / (60 * 60));
      const minutes = Math.floor((totalRemainingSeconds % (60 * 60)) / 60);
      const seconds = totalRemainingSeconds % 60;
      
      console.log('RemainingTime Debug: Time components', {
        days, hours, minutes, seconds
      });
      
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
