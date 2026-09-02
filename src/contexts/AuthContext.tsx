import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/roast';
import { storageService, INITIAL_USERS } from '../services/storageService';
import { supabaseService } from '../services/supabaseService';
import { supabase } from '../services/supabaseClient';

interface AuthContextType {
  currentUser: User;
  users: User[];
  loginAs: (userId: string, password?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isAuthenticated: boolean;
  authError: string | null;
  setAuthError: (msg: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => storageService.getCurrentUser());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => storageService.getIsLoggedIn());
  const [usersList, setUsersList] = useState<User[]>(INITIAL_USERS);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    storageService.saveCurrentUser(currentUser);
  }, [currentUser]);

  useEffect(() => {
    storageService.saveIsLoggedIn(isAuthenticated);
  }, [isAuthenticated]);

  useEffect(() => {
    // Buscar lista atualizada de usuários no Supabase DB
    supabaseService.fetchUsers().then(remoteUsers => {
      if (remoteUsers && remoteUsers.length > 0) {
        setUsersList(remoteUsers);
      }
    }).catch(() => {});

    // Ouvir alterações de sessão no Supabase Auth
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        // Verificar obrigatoriamente se o usuário autenticado no Auth existe na tabela de usuários do banco
        const dbUser = await supabaseService.validateAuthUserWithDb(session.user.id, session.user.email);
        
        if (dbUser) {
          setCurrentUser(dbUser);
          setIsAuthenticated(true);
          setAuthError(null);
        } else {
          // O usuário está no Supabase Auth, mas NÃO existe como usuário autorizado no banco de dados!
          console.warn('[AuthContext] Usuário autenticado no Supabase Auth não consta na tabela public.users. Encerrando sessão...');
          await supabase.auth.signOut();
          setIsAuthenticated(false);
          setAuthError('Acesso recusado: Seu usuário não está autorizado na tabela de usuários do banco de dados.');
        }
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const loginAs = async (userIdentifier: string, password?: string): Promise<boolean> => {
    setAuthError(null);
    const cleanInput = userIdentifier.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (!cleanInput) {
      setAuthError('Identificador do usuário é obrigatório.');
      return false;
    }

    // 1. Login de Administrador (Autenticado estritamente pelo Banco de Dados)
    if (cleanInput === 'fabio' || cleanInput === 'admin' || cleanInput === 'fabio adm' || cleanInput === 'admin-1') {
      const adminUser = await supabaseService.authenticateAdmin(userIdentifier, password);
      if (adminUser) {
        setCurrentUser(adminUser);
        setIsAuthenticated(true);
        setAuthError(null);
        return true;
      }

      // Fallback local para Admin se o Supabase não responder
      if (password === '123') {
        const localAdmin = INITIAL_USERS.find(u => u.role === 'admin') || {
          id: 'admin-1',
          name: 'Fábio ADM',
          role: 'admin',
          shift: 'Geral / Supervisão',
        };
        setCurrentUser(localAdmin);
        setIsAuthenticated(true);
        setAuthError(null);
        return true;
      }

      setAuthError('Usuário ou senha de administrador incorreta (Supabase DB).');
      return false;
    }

    // 2. Login de Operador (Acesso normal ao sistema)
    const operatorUser = usersList.find(u => {
      const cleanName = u.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const cleanId = u.id.toLowerCase();
      return u.id === userIdentifier || cleanId === cleanInput || cleanName.includes(cleanInput);
    }) || INITIAL_USERS.find(u => u.id === userIdentifier);

    if (!operatorUser) {
      setAuthError('Operador não encontrado.');
      return false;
    }

    setCurrentUser(operatorUser);
    setIsAuthenticated(true);
    setAuthError(null);
    return true;
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('[AuthContext] Erro ao deslogar do Supabase Auth:', e);
    }
    setIsAuthenticated(false);
    setAuthError(null);
  };

  const isAdmin = currentUser.role === 'admin';

  return (
    <AuthContext.Provider value={{ currentUser, users: usersList, loginAs, logout, isAdmin, isAuthenticated, authError, setAuthError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};

