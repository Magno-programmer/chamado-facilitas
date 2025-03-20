
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock data for users
const usersMockData = [
  { id: 1, name: "João Silva", email: "joao.silva@exemplo.com", role: "Administrador", sector: "TI" },
  { id: 2, name: "Maria Santos", email: "maria.santos@exemplo.com", role: "Gerente", sector: "Financeiro" },
  { id: 3, name: "Pedro Oliveira", email: "pedro.oliveira@exemplo.com", role: "Operador", sector: "Operações" },
  { id: 4, name: "Ana Costa", email: "ana.costa@exemplo.com", role: "Analista", sector: "Recursos Humanos" },
  { id: 5, name: "Carlos Souza", email: "carlos.souza@exemplo.com", role: "Técnico", sector: "TI" },
];

const Usuarios = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Usuários</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
          <CardDescription>
            Visualize todos os usuários do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Setor</TableHead>
                <TableHead>Função</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersMockData.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.sector}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === "Administrador" ? "destructive" : 
                                    user.role === "Gerente" ? "default" : "secondary"}>
                      {user.role}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Usuarios;
