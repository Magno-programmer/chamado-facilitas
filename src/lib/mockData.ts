
// This file is retained but emptied of mock data
// It will be imported by other files, but we're removing the mock data functionality
// to prioritize real database connections

// Empty mock sectors array for compatibility
export const mockSectors = [
  { id: 1, name: 'TI' },
  { id: 2, name: 'Administração' },
  { id: 3, name: 'RH' },
  { id: 4, name: 'Vendas' },
  { id: 5, name: 'Suporte' }
];

// Empty mock dashboard stats for compatibility
export const mockDashboardStats = {
  totalTickets: 0,
  openTickets: 0,
  inProgressTickets: 0,
  completedTickets: 0,
  lateTickets: 0,
  ticketsBySector: []
};

export const calculatePercentageRemaining = () => {
  // Function retained for compatibility with imports, but now just returns 0
  // This helps prevent errors in files that still import this
  return 0;
};

// Empty function for compatibility
export const getTicketWithDetails = () => null;

// Empty function for compatibility
export const getEnrichedTickets = () => [];
