
import { supabase } from '@/integrations/supabase/client';

// Statistics for dashboard
export const getTicketStats = async () => {
  // Get all tickets
  const { data: tickets, error } = await supabase
    .from('chamados')
    .select(`
      *,
      setor:setores(*)
    `);
  
  if (error) throw error;
  
  // Get all sectors
  const { data: sectors } = await supabase
    .from('setores')
    .select('*');
  
  if (!tickets || !sectors) {
    return {
      totalTickets: 0,
      openTickets: 0,
      inProgressTickets: 0,
      completedTickets: 0,
      lateTickets: 0,
      ticketsBySector: []
    }
  }
  
  // Calculate statistics
  const stats = {
    totalTickets: tickets.length,
    openTickets: tickets.filter(t => t.status === 'Aberto').length,
    inProgressTickets: tickets.filter(t => t.status === 'Em Andamento').length,
    completedTickets: tickets.filter(t => t.status === 'Concluído').length,
    lateTickets: tickets.filter(t => t.status === 'Atrasado').length,
    ticketsBySector: sectors.map(sector => ({
      sectorId: sector.id,
      sectorName: sector.nome,
      count: tickets.filter(t => t.setor_id === sector.id).length
    }))
  }
  
  return stats;
}
