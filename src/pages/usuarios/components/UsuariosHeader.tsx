
import React from 'react';
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UsuariosHeaderProps {
  onCreateClick: () => void;
  isAdmin: boolean;
}

const UsuariosHeader = ({ onCreateClick, isAdmin }: UsuariosHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold">Usuários</h1>
      {isAdmin && (
        <Button onClick={onCreateClick}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Usuário
        </Button>
      )}
    </div>
  );
};

export default UsuariosHeader;
