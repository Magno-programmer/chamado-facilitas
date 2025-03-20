
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Mock data for sectors
const sectorsMockData = [
  { id: 1, name: "Financeiro", description: "Gerencia finanças e orçamentos" },
  { id: 2, name: "Recursos Humanos", description: "Gerencia pessoal e recrutamento" },
  { id: 3, name: "TI", description: "Suporte técnico e infraestrutura" },
  { id: 4, name: "Marketing", description: "Comunicação e divulgação" },
  { id: 5, name: "Operações", description: "Operações diárias e logística" },
];

const Setores = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Setores</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Lista de Setores</CardTitle>
          <CardDescription>
            Visualize todos os setores da organização
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sectorsMockData.map((sector) => (
                <TableRow key={sector.id}>
                  <TableCell>{sector.id}</TableCell>
                  <TableCell className="font-medium">{sector.name}</TableCell>
                  <TableCell>{sector.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Setores;
