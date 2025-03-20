
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Setor {
  id: number;
  nome: string;
}

const Setores = () => {
  const [setores, setSetores] = useState<Setor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSetores = async () => {
      try {
        const { data, error } = await supabase
          .from('setores')
          .select('*')
          .order('nome', { ascending: true });
        
        if (error) {
          throw error;
        }
        
        setSetores(data || []);
      } catch (error) {
        console.error('Erro ao buscar setores:', error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os setores.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSetores();
  }, []);

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
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nome</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {setores.length > 0 ? (
                  setores.map((setor) => (
                    <TableRow key={setor.id}>
                      <TableCell>{setor.id}</TableCell>
                      <TableCell className="font-medium">{setor.nome}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-6">
                      Nenhum setor encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Setores;
