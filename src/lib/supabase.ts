
// Export indicator that we're using mock data
export const isUsingMockData = true;

// Mock authentication functions
export const signIn = async (email: string, password: string) => {
  console.log('📝 [mockAuth] Tentando login com:', { email, password: '••••••••' });
  
  // Mock credentials for demo - atualizado para corresponder às credenciais da interface de login
  if ((email === 'admin@example.com' && password === 'senha123') || 
      (email === 'cliente@example.com' && password === 'cliente123')) {
    
    const isAdmin = email === 'admin@example.com';
    const user = {
      id: isAdmin ? 1 : 2,
      name: isAdmin ? 'Admin User' : 'Cliente User',
      email,
      sectorId: isAdmin ? 1 : 2,
      role: isAdmin ? 'ADMIN' : 'CLIENT'
    };
    
    console.log('📝 [mockAuth] Login bem-sucedido para:', email);
    
    // Store in localStorage for persistence
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('isLoggedIn', 'true');
    
    return {
      data: {
        session: {
          user: {
            id: String(user.id),
            email: user.email,
          }
        }
      },
      error: null
    };
  }
  
  console.log('📝 [mockAuth] Credenciais inválidas para:', email);
  return {
    data: { session: null },
    error: new Error('Credenciais inválidas')
  };
};

export const signOut = async () => {
  console.log('📝 [mockAuth] Realizando logout');
  
  // Clear local storage
  localStorage.removeItem('user');
  localStorage.removeItem('isLoggedIn');
  
  return { error: null };
};

export const getCurrentUser = async () => {
  console.log('📝 [mockAuth] Verificando usuário atual');
  
  // Check if user is stored in local storage
  const storedUser = localStorage.getItem('user');
  
  if (!storedUser) {
    console.log('📝 [mockAuth] Nenhum usuário encontrado no localStorage');
    return { user: null, error: null };
  }
  
  const userData = JSON.parse(storedUser);
  console.log('📝 [mockAuth] Usuário encontrado:', userData);
  
  return { 
    user: {
      id: String(userData.id),
      email: userData.email,
    }, 
    error: null 
  };
};

// Export a null supabase client for compatibility
export const supabase = null;
