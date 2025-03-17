
import { supabase } from '@/lib/supabase';
import { Ticket, TicketFormData, TicketWithDetails, TicketStatus } from '@/lib/types';
import { addSeconds } from 'date-fns';

// Helper to parse ISO 8601 duration to seconds
const parseIsoDuration = (isoDuration: string): number => {
  const secondMatch = isoDuration.match(/PT(\d+)S/);
  const minuteMatch = isoDuration.match(/PT(\d+)M/);
  const hourMatch = isoDuration.match(/PT(\d+)H/);
  const dayMatch = isoDuration.match(/P(\d+)D/);
  
  if (secondMatch) return parseInt(secondMatch[1]);
  if (minuteMatch) return parseInt(minuteMatch[1]) * 60;
  if (hourMatch) return parseInt(hourMatch[1]) * 3600;
  if (dayMatch) return parseInt(dayMatch[1]) * 86400;
  
  return 3600; // Default 1 hour
};

// Calculate the percentage remaining for a ticket
const calculatePercentageRemaining = (ticket: any): number => {
  const now = new Date();
  const created = new Date(ticket.data_criacao);
  const deadline = new Date(ticket.prazo);
  
  // If the deadline has passed
  if (now > deadline) {
    return 0;
  }
  
  // If it's completed
  if (ticket.status === 'Concluído') {
    return 100;
  }
  
  const totalDuration = deadline.getTime() - created.getTime();
  const elapsedDuration = now.getTime() - created.getTime();
  const remainingPercentage = 100 - Math.floor((elapsedDuration / totalDuration) * 100);
  
  return Math.max(0, Math.min(100, remainingPercentage));
};

export const getTickets = async (userId: number, isAdmin: boolean): Promise<TicketWithDetails[]> => {
  // If admin, get all tickets, otherwise only user's tickets
  const query = supabase
    .from('chamados')
    .select(`
      *,
      setores: setor_id(id, nome),
      solicitante: solicitante_id(id, nome, email, setor_id, role),
      responsavel: responsavel_id(id, nome, email, setor_id, role)
    `);
  
  // Apply filter if not admin
  const { data, error } = isAdmin 
    ? await query
    : await query.eq('solicitante_id', userId);

  if (error) {
    console.error('Error fetching tickets:', error);
    throw error;
  }

  return data.map(ticket => {
    return {
      id: ticket.id,
      title: ticket.titulo,
      description: ticket.descricao,
      sectorId: ticket.setor_id,
      requesterId: ticket.solicitante_id,
      responsibleId: ticket.responsavel_id,
      status: ticket.status as TicketStatus,
      createdAt: ticket.data_criacao,
      deadline: ticket.prazo,
      sector: {
        id: ticket.setores.id,
        name: ticket.setores.nome
      },
      requester: {
        id: ticket.solicitante.id,
        name: ticket.solicitante.nome,
        email: ticket.solicitante.email,
        sectorId: ticket.solicitante.setor_id,
        role: ticket.solicitante.role
      },
      responsible: ticket.responsavel ? {
        id: ticket.responsavel.id,
        name: ticket.responsavel.nome,
        email: ticket.responsavel.email,
        sectorId: ticket.responsavel.setor_id,
        role: ticket.responsavel.role
      } : null,
      percentageRemaining: calculatePercentageRemaining(ticket)
    };
  });
};

export const getTicketById = async (id: number): Promise<TicketWithDetails | null> => {
  const { data, error } = await supabase
    .from('chamados')
    .select(`
      *,
      setores: setor_id(id, nome),
      solicitante: solicitante_id(id, nome, email, setor_id, role),
      responsavel: responsavel_id(id, nome, email, setor_id, role)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching ticket ${id}:`, error);
    return null;
  }

  return {
    id: data.id,
    title: data.titulo,
    description: data.descricao,
    sectorId: data.setor_id,
    requesterId: data.solicitante_id,
    responsibleId: data.responsavel_id,
    status: data.status as TicketStatus,
    createdAt: data.data_criacao,
    deadline: data.prazo,
    sector: {
      id: data.setores.id,
      name: data.setores.nome
    },
    requester: {
      id: data.solicitante.id,
      name: data.solicitante.nome,
      email: data.solicitante.email,
      sectorId: data.solicitante.setor_id,
      role: data.solicitante.role
    },
    responsible: data.responsavel ? {
      id: data.responsavel.id,
      name: data.responsavel.nome,
      email: data.responsavel.email,
      sectorId: data.responsavel.setor_id,
      role: data.responsavel.role
    } : null,
    percentageRemaining: calculatePercentageRemaining(data)
  };
};

export const createTicket = async (ticketData: TicketFormData, userId: number): Promise<Ticket | null> => {
  // Get deadline details to calculate end time
  const { data: deadlineData, error: deadlineError } = await supabase
    .from('prazos')
    .select('prazo')
    .eq('id', ticketData.deadlineId)
    .single();

  if (deadlineError) {
    console.error('Error fetching deadline for ticket creation:', deadlineError);
    throw deadlineError;
  }

  const now = new Date();
  const durationInSeconds = parseIsoDuration(deadlineData.prazo);
  const deadlineDate = addSeconds(now, durationInSeconds);

  const { data, error } = await supabase
    .from('chamados')
    .insert({
      titulo: ticketData.title,
      descricao: ticketData.description,
      setor_id: ticketData.sectorId,
      solicitante_id: userId,
      responsavel_id: null, // Initially no responsible person
      status: 'Aberto', // Initial status
      data_criacao: now.toISOString(),
      prazo: deadlineDate.toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating ticket:', error);
    throw error;
  }

  return {
    id: data.id,
    title: data.titulo,
    description: data.descricao,
    sectorId: data.setor_id,
    requesterId: data.solicitante_id,
    responsibleId: data.responsavel_id,
    status: data.status as TicketStatus,
    createdAt: data.data_criacao,
    deadline: data.prazo,
  };
};

export const updateTicketStatus = async (id: number, status: TicketStatus, responsibleId?: number): Promise<Ticket | null> => {
  const updateData: any = { status };
  
  if (responsibleId) {
    updateData.responsavel_id = responsibleId;
  }

  const { data, error } = await supabase
    .from('chamados')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating ticket ${id} status:`, error);
    throw error;
  }

  return {
    id: data.id,
    title: data.titulo,
    description: data.descricao,
    sectorId: data.setor_id,
    requesterId: data.solicitante_id,
    responsibleId: data.responsavel_id,
    status: data.status as TicketStatus,
    createdAt: data.data_criacao,
    deadline: data.prazo,
  };
};

export const getDashboardStats = async (): Promise<any> => {
  // Get all tickets to compute statistics
  const { data, error } = await supabase
    .from('chamados')
    .select(`
      *,
      setores: setor_id(id, nome)
    `);

  if (error) {
    console.error('Error fetching tickets for dashboard:', error);
    throw error;
  }

  // Calculate statistics
  const totalTickets = data.length;
  const openTickets = data.filter(t => t.status === 'Aberto').length;
  const inProgressTickets = data.filter(t => t.status === 'Em Andamento').length;
  const completedTickets = data.filter(t => t.status === 'Concluído').length;
  const lateTickets = data.filter(t => t.status === 'Atrasado').length;

  // Group tickets by sector
  const sectorMap = new Map();
  data.forEach(ticket => {
    const sectorId = ticket.setor_id;
    const sectorName = ticket.setores.nome;
    
    if (!sectorMap.has(sectorId)) {
      sectorMap.set(sectorId, { sectorId, sectorName, count: 0 });
    }
    
    sectorMap.get(sectorId).count++;
  });

  return {
    totalTickets,
    openTickets,
    inProgressTickets,
    completedTickets,
    lateTickets,
    ticketsBySector: Array.from(sectorMap.values()),
  };
};
