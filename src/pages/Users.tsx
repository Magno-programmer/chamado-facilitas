
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole, User } from '@/lib/types';
import { Plus, RefreshCw, Search, Edit, Trash, FilePenLine, Users as UsersIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import UserForm from '@/components/UserForm';
import { mockSectors } from '@/lib/mockData';

const UsersPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Get current user role from localStorage
  const currentUserRole = JSON.parse(localStorage.getItem('user') || '{}')?.role;
  const isAdmin = currentUserRole === 'ADMIN';

  useEffect(() => {
    if (localStorage.getItem('isLoggedIn') !== 'true') {
      navigate('/login');
      return;
    }

    // Mock loading data
    const timer = setTimeout(() => {
      // Mock users data
      const mockUsers: User[] = [
        { id: 1, name: 'Admin User', email: 'admin@example.com', sectorId: 1, role: 'ADMIN' },
        { id: 2, name: 'TI Support', email: 'ti@example.com', sectorId: 1, role: 'ADMIN' },
        { id: 3, name: 'Client User', email: 'client@example.com', sectorId: 2, role: 'CLIENT' },
        { id: 4, name: 'HR Manager', email: 'hr@example.com', sectorId: 3, role: 'CLIENT' },
        { id: 5, name: 'Sales Rep', email: 'sales@example.com', sectorId: 4, role: 'CLIENT' },
      ];
      
      setUsers(mockUsers);
      setFilteredUsers(mockUsers);
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [navigate]);

  // Apply search filter when searchTerm changes
  useEffect(() => {
    if (users.length === 0) return;

    if (searchTerm) {
      const filtered = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const handleAddUser = () => {
    setCurrentUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setCurrentUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = (userId: number) => {
    // In a real application, this would be an API call
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      const updatedUsers = users.filter(user => user.id !== userId);
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      ));
      
      toast({
        title: 'Usuário excluído',
        description: 'O usuário foi removido com sucesso.',
      });
    }
  };

  const handleSaveUser = (userData: User) => {
    let updatedUsers;
    
    if (currentUser) {
      // Edit existing user
      updatedUsers = users.map(user => 
        user.id === currentUser.id ? { ...userData, id: user.id } : user
      );
      toast({
        title: 'Usuário atualizado',
        description: 'As informações do usuário foram atualizadas com sucesso.',
      });
    } else {
      // Add new user
      const newUser = {
        ...userData,
        id: Math.max(0, ...users.map(u => u.id)) + 1,
      };
      updatedUsers = [...users, newUser];
      toast({
        title: 'Usuário adicionado',
        description: 'O novo usuário foi adicionado com sucesso.',
      });
    }
    
    setUsers(updatedUsers);
    setFilteredUsers(updatedUsers.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    ));
    setIsModalOpen(false);
  };

  const getSectorName = (sectorId: number) => {
    const sector = mockSectors.find(s => s.id === sectorId);
    return sector ? sector.name : 'Setor não encontrado';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col p-4 md:p-8 pt-20">
        <div className="flex items-center justify-center h-full">
          <RefreshCw className="h-12 w-12 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 pt-20 animate-slide-up">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Usuários</h1>
          <p className="text-muted-foreground">{isAdmin ? 'Gerencie os usuários do sistema' : 'Visualize os usuários do sistema'}</p>
        </div>
        {isAdmin && (
          <Button onClick={handleAddUser}>
            <Plus className="h-5 w-5 mr-2" />
            Novo Usuário
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border shadow-sm p-4 mb-6">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <Input
              type="text"
              placeholder="Buscar usuários..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Setor</TableHead>
              <TableHead>Função</TableHead>
              {isAdmin && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.id}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getSectorName(user.sectorId)}</TableCell>
                  <TableCell>
                    {user.role === 'ADMIN' ? 'Administrador' : 'Cliente'}
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDeleteUser(user.id)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={isAdmin ? 6 : 5} className="text-center py-10">
                  <div className="flex flex-col items-center justify-center">
                    <div className="bg-secondary rounded-full p-4 mb-4">
                      <UsersIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Nenhum usuário encontrado</h3>
                    <p className="text-muted-foreground text-center max-w-md mb-6">
                      Não encontramos usuários com os critérios de busca atuais.
                    </p>
                    {searchTerm && (
                      <Button variant="outline" onClick={() => setSearchTerm('')}>
                        Limpar Filtros
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* User Form Modal */}
      {isModalOpen && (
        <UserForm
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveUser}
          user={currentUser}
        />
      )}
    </div>
  );
};

export default UsersPage;
