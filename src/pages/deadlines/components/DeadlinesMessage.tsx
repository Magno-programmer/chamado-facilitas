
import React from 'react';
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface DeadlinesMessageProps {
  title: string;
  description: string;
}

const DeadlinesMessage = ({ title, description }: DeadlinesMessageProps) => {
  return (
    <Alert className="mb-6">
      <AlertCircle className="h-5 w-5" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        {description}
      </AlertDescription>
    </Alert>
  );
};

export default DeadlinesMessage;
