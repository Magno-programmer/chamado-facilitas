
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDeadlines } from '@/lib/supabase';
import { Clock } from 'lucide-react';
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Deadlines = () => {
  const { data: deadlines, isLoading, error } = useQuery({
    queryKey: ['deadlines'],
    queryFn: getDeadlines,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Prazos
            </CardTitle>
            <CardDescription>Gerenciamento de prazos para os setores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center items-center h-40">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-6 w-24 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-500">Erro ao carregar prazos</CardTitle>
            <CardDescription>
              Ocorreu um erro ao tentar carregar os prazos. Por favor, tente novamente mais tarde.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Function to format the prazo time string to a more readable format
  const formatDeadlineTime = (prazoString: string) => {
    // The prazo string comes in a time format, likely HH:MM:SS
    // Format it to display in a more user-friendly way
    return prazoString;
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Prazos
          </CardTitle>
          <CardDescription>Gerenciamento de prazos para os setores</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>Lista de prazos para os setores</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Setor</TableHead>
                <TableHead>Prazo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deadlines?.map((deadline) => (
                <TableRow key={deadline.id}>
                  <TableCell className="font-medium">{deadline.titulo}</TableCell>
                  <TableCell>
                    {deadline.setor ? (
                      <Badge variant="secondary">{deadline.setor.nome}</Badge>
                    ) : (
                      <Badge variant="outline">Todos os setores</Badge>
                    )}
                  </TableCell>
                  <TableCell>{formatDeadlineTime(deadline.prazo)}</TableCell>
                </TableRow>
              ))}
              {deadlines?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                    Nenhum prazo cadastrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Deadlines;
