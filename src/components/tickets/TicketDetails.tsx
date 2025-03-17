
import React from 'react';
import { Building, User } from 'lucide-react';
import { Sector, User as UserType } from '@/lib/types';

interface TicketDetailsProps {
  sector: Sector;
  requester: UserType;
  responsible: UserType | null;
}

const TicketDetails: React.FC<TicketDetailsProps> = ({
  sector,
  requester,
  responsible
}) => {
  return (
    <div className="bg-white rounded-xl border shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-4">Detalhes</h2>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Setor</p>
          <div className="flex items-center">
            <Building className="h-4 w-4 mr-2 text-primary" />
            <span>{sector.name}</span>
          </div>
        </div>
        
        <div>
          <p className="text-sm text-muted-foreground mb-1">Solicitante</p>
          <div className="flex items-center">
            <User className="h-4 w-4 mr-2 text-primary" />
            <span>{requester.name}</span>
          </div>
        </div>
        
        <div>
          <p className="text-sm text-muted-foreground mb-1">Responsável</p>
          {responsible ? (
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2 text-primary" />
              <span>{responsible.name}</span>
            </div>
          ) : (
            <span className="text-muted-foreground italic">Não atribuído</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;
