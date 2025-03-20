
// Dashboard/Stats types
export interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  completedTickets: number;
  lateTickets: number;
  ticketsBySector: {
    sectorId: number;
    sectorName: string;
    count: number;
  }[];
}
