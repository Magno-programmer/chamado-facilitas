
import React from 'react';
import { Deadline } from '@/lib/types/sector.types';
import { 
  Select,
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface DeadlineSelectorProps {
  deadlines: Deadline[];
  selectedDeadlineId: number | null;
  onDeadlineChange: (deadlineId: string) => void;
  isLoading: boolean;
}

const DeadlineSelector: React.FC<DeadlineSelectorProps> = ({
  deadlines,
  selectedDeadlineId,
  onDeadlineChange,
  isLoading
}) => {
  return (
    <div>
      <label htmlFor="deadline-title" className="block text-sm font-medium mb-1">
        Selecione um Prazo <span className="text-red-500">*</span>
      </label>
      {isLoading ? (
        <div className="w-full p-2 border rounded-lg bg-gray-50">Carregando prazos...</div>
      ) : deadlines.length === 0 ? (
        <div className="w-full p-2 border rounded-lg bg-red-50 text-red-500">
          Nenhum prazo cadastrado. Você precisa cadastrar prazos primeiro.
        </div>
      ) : (
        <Select
          value={selectedDeadlineId?.toString() || ''}
          onValueChange={onDeadlineChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione um prazo" />
          </SelectTrigger>
          <SelectContent>
            {deadlines.map((deadline) => (
              <SelectItem key={deadline.id} value={deadline.id.toString()}>
                {deadline.titulo} {deadline.setor?.nome ? `(${deadline.setor.nome})` : ''} - {deadline.prazo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};

export default DeadlineSelector;
