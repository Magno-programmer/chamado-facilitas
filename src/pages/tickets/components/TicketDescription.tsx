
import React from 'react';

interface TicketDescriptionProps {
  description: string;
  setDescription: (value: string) => void;
}

const TicketDescription: React.FC<TicketDescriptionProps> = ({
  description,
  setDescription
}) => {
  return (
    <div>
      <label htmlFor="description" className="block text-sm font-medium mb-1">
        Descrição <span className="text-red-500">*</span>
      </label>
      <textarea
        id="description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-h-32"
        placeholder="Descreva detalhadamente o problema ou solicitação"
        required
      />
    </div>
  );
};

export default TicketDescription;
