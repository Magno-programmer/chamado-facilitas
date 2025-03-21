
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { createSecureHash } from '@/lib/passwordUtils';
import { useAuth } from "@/hooks/useAuth";

interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: string;
  setor: {
    id: number;
    nome: string;
  };
}

export const useEditCreateUsuario = (
  usuarios: Usuario[],
  setUsuarios: (usuarios: Usuario[]) => void,
  setores: {id: number, nome: string}[],
  setLoading: (loading: boolean) => void
) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [isGeralSector, setIsGeralSector] = useState(false);
  const { user: currentUser } = useAuth();

  // Check if current user is from "Geral" sector
  useEffect(() => {
    const checkSector = async () => {
      if (!currentUser) return;
      
      try {
        const { data, error } = await supabase
          .from('setores')
          .select('nome')
          .eq('id', currentUser.sectorId)
          .single();
        
        if (error) throw error;
        setIsGeralSector(data?.nome === 'Geral');
      } catch (error) {
        console.error('Error checking sector:', error);
        setIsGeralSector(false);
      }
    };
    
    checkSector();
  }, [currentUser]);

  const handleOpenEdit = (usuario: Usuario) => {
    // Don't allow editing your own profile unless you're from Geral sector
    if (usuario.id === currentUser?.id && !isGeralSector) {
      toast({
        title: "Acesso negado",
        description: "Você não pode editar seu próprio perfil. Solicite a um administrador do setor Geral.",
        variant: "destructive",
      });
      return;
    }
    
    // Only allow editing users from same sector unless user is from Geral sector
    if (!isGeralSector && usuario.setor?.id !== currentUser?.sectorId) {
      toast({
        title: "Acesso negado",
        description: "Você só pode editar usuários do seu próprio setor.",
        variant: "destructive",
      });
      return;
    }
    
    setEditingUsuario(usuario);
    setIsDialogOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingUsuario(null);
    setIsDialogOpen(true);
  };

  const handleSaveUsuario = async (values: any, isEditing: boolean) => {
    try {
      setLoading(true);
      
      // Check if user is trying to edit their own profile and they're not from Geral sector
      if (isEditing && editingUsuario && currentUser && editingUsuario.id === currentUser.id && !isGeralSector) {
        toast({
          title: "Operação não permitida",
          description: "Você não pode editar seu próprio perfil. Solicite a um administrador do setor Geral.",
          variant: "destructive",
        });
        return;
      }
      
      // If not from Geral sector, prevent creating/editing users from other sectors
      if (!isGeralSector) {
        if (parseInt(values.setorId) !== currentUser?.sectorId) {
          toast({
            title: "Operação não permitida",
            description: "Você só pode gerenciar usuários do seu próprio setor.",
            variant: "destructive",
          });
          return;
        }
      }
      
      const userData = {
        nome: values.nome,
        email: values.email,
        setor_id: parseInt(values.setorId),
        role: values.role
      };
      
      if (isEditing && editingUsuario) {
        // If editing user from another sector and user is not from Geral, block
        if (!isGeralSector && editingUsuario.setor?.id !== currentUser?.sectorId) {
          toast({
            title: "Acesso negado",
            description: "Você só pode editar usuários do seu próprio setor.",
            variant: "destructive",
          });
          return;
        }
        
        const updateData: any = { ...userData };
        if (values.senha) {
          // Use the secure hash function for password updates
          updateData.senha_hash = await createSecureHash(values.senha);
        }
        
        const { error } = await supabase
          .from('usuarios')
          .update(updateData)
          .eq('id', editingUsuario.id);
        
        if (error) throw error;
        
        setUsuarios(usuarios.map(u => {
          if (u.id === editingUsuario.id) {
            return {
              ...u,
              nome: values.nome,
              email: values.email,
              role: values.role,
              setor: {
                id: parseInt(values.setorId),
                nome: setores.find(s => s.id === parseInt(values.setorId))?.nome || ''
              }
            };
          }
          return u;
        }));
        
        toast({
          title: "Usuário atualizado",
          description: `O usuário "${values.nome}" foi atualizado com sucesso.`,
        });
      } else {
        // Generate a secure hash for the new user's password
        const secureHash = await createSecureHash(values.senha);
        
        const newUserData = {
          ...userData,
          senha_hash: secureHash,
          id: crypto.randomUUID()
        };
        
        const { data, error } = await supabase
          .from('usuarios')
          .insert([newUserData])
          .select(`
            *,
            setor:setores(id, nome)
          `);
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setUsuarios([...usuarios, data[0]]);
          toast({
            title: "Usuário criado",
            description: `O usuário "${values.nome}" foi criado com sucesso.`,
          });
        }
      }
      
      setIsDialogOpen(false);
      setEditingUsuario(null);
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      toast({
        title: "Erro ao salvar usuário",
        description: error instanceof Error ? error.message : "Não foi possível salvar o usuário.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    isDialogOpen,
    setIsDialogOpen,
    editingUsuario,
    setEditingUsuario,
    handleOpenEdit,
    handleOpenCreate,
    handleSaveUsuario,
    currentUser,
    isGeralSector
  };
};
