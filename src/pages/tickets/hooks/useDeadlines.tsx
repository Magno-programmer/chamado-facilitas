
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getDeadlines } from '@/lib/services/deadlineService';
import { Deadline } from '@/lib/types/sector.types';

export const useDeadlines = () => {
  const { toast } = useToast();
  const [selectedDeadlineId, setSelectedDeadlineId] = useState<number | null>(null);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [isLoadingDeadlines, setIsLoadingDeadlines] = useState(true);

  useEffect(() => {
    const loadDeadlines = async () => {
      try {
        setIsLoadingDeadlines(true);
        const deadlinesData = await getDeadlines();
        setDeadlines(deadlinesData);
        if (deadlinesData.length > 0) {
          setSelectedDeadlineId(deadlinesData[0].id);
        }
      } catch (error) {
        console.error('Error loading deadlines:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os prazos cadastrados.',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingDeadlines(false);
      }
    };

    loadDeadlines();
  }, [toast]);

  const handleDeadlineChange = (deadlineId: string) => {
    const selectedId = Number(deadlineId);
    setSelectedDeadlineId(selectedId);
  };

  return {
    selectedDeadlineId,
    deadlines,
    isLoadingDeadlines,
    handleDeadlineChange
  };
};
