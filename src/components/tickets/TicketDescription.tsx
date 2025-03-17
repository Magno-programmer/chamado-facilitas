
import React from 'react';

interface TicketDescriptionProps {
  description: string;
}

const TicketDescription: React.FC<TicketDescriptionProps> = ({ description }) => {
  return (
    <div className="bg-white rounded-xl border shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">Descrição</h2>
      <p className="text-foreground whitespace-pre-line">{description}</p>
    </div>
  );
};

export default TicketDescription;
