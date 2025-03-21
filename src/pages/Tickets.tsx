
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTicketsData } from './tickets/hooks/useTicketsData';
import TicketsHeader from './tickets/components/TicketsHeader';
import TicketsFilter from './tickets/components/TicketsFilter';
import TicketsGrid from './tickets/components/TicketsGrid';
import EmptyTickets from './tickets/components/EmptyTickets';
import TicketsLoading from './tickets/components/TicketsLoading';

const Tickets = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    filteredTickets,
    isLoading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    sectorFilter,
    setSectorFilter,
    sectors,
    resetFilters,
    isAdmin
  } = useTicketsData();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  if (isLoading || authLoading) {
    return <TicketsLoading />;
  }

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 pt-20 animate-slide-up">
      <TicketsHeader isAdmin={isAdmin} />

      <TicketsFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        sectorFilter={sectorFilter}
        setSectorFilter={setSectorFilter}
        sectors={sectors}
      />

      {filteredTickets.length > 0 ? (
        <TicketsGrid tickets={filteredTickets} />
      ) : (
        <EmptyTickets onResetFilters={resetFilters} />
      )}
    </div>
  );
};

export default Tickets;
