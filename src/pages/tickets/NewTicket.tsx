
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { createTicket } from '@/lib/services/ticketService';
import { getSectors } from '@/lib/supabase';

const NewTicket = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sectorId, setSectorId] = useState<number | null>(null);
  const [sectors, setSectors] = useState<{id: number, nome: string}[]>([]);
  const [deadline, setDeadline] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadSectors = async () => {
      try {
        const sectorsData = await getSectors();
        setSectors(sectorsData);
        if (sectorsData.length > 0) {
          setSectorId(sectorsData[0].id);
        }
      } catch (error) {
        console.error('Error loading sectors:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os setores.',
          variant: 'destructive',
        });
      }
    };

    loadSectors();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !sectorId || !deadline) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Erro de autenticação',
        description: 'Você precisa estar logado para criar um chamado.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const newTicket = {
        titulo: title,
        descricao: description,
        setor_id: sectorId,
        solicitante_id: user.id,
        status: 'Aberto',
        data_criacao: new Date().toISOString(),
        prazo: new Date(deadline).toISOString(),
      };

      await createTicket(newTicket);
      
      toast({
        title: 'Chamado criado',
        description: 'Seu chamado foi criado com sucesso!',
      });
      
      navigate('/tickets');
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o chamado. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/tickets');
  };

  // Calculate minimum date (today) for the deadline picker
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 pt-20 animate-slide-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Novo Chamado</h1>
        <p className="text-muted-foreground">Crie um novo chamado no sistema</p>
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Título <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Digite o título do chamado"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Descrição
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-h-32"
              placeholder="Descreva detalhadamente o problema ou solicitação"
            />
          </div>

          <div>
            <label htmlFor="sector" className="block text-sm font-medium mb-1">
              Setor <span className="text-red-500">*</span>
            </label>
            <select
              id="sector"
              value={sectorId || ''}
              onChange={(e) => setSectorId(Number(e.target.value))}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              {sectors.length === 0 ? (
                <option value="">Carregando setores...</option>
              ) : (
                sectors.map((sector) => (
                  <option key={sector.id} value={sector.id}>
                    {sector.nome}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label htmlFor="deadline" className="block text-sm font-medium mb-1">
              Prazo <span className="text-red-500">*</span>
            </label>
            <input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              min={today}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors flex items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Criando...
                </>
              ) : (
                'Criar Chamado'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewTicket;
