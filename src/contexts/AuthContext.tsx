import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/roast';
import { storageService, INITIAL_USERS } from '../services/storageService';

interface AuthContextType {
  currentUser: User;
  users: User[];
  loginAs: (userId: string, password?: string) => boolean;
  logout: () => void;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => storageService.getCurrentUser());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    storageService.saveCurrentUser(currentUser);
  }, [currentUser]);

  useEffect(() => {
    storageService.saveIsLoggedIn(isAuthenticated);
  }, [isAuthenticated]);

  const loginAs = (userIdentifier: string, password?: string): boolean => {
    const cleanInput = userIdentifier.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (!cleanInput) return false;

    const found = INITIAL_USERS.find(u => {
      const cleanName = u.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const cleanId = u.id.toLowerCase();
      
      if (cleanInput === 'fabio' || cleanInput === 'admin' || cleanInput === 'fabio adm' || cleanInput === 'admin-1') {
        return u.role === 'admin';
      }
      return u.id === userIdentifier || cleanId === cleanInput || cleanName.includes(cleanInput);
    });

    if (!found) return false;

    // Admin login requires password '123'
    if (found.role === 'admin') {
      if (password !== '123') {
        return false;
      }
    }

    setCurrentUser(found);
    setIsAuthenticated(true);
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const isAdmin = currentUser.role === 'admin';

  return (
    <AuthContext.Provider value={{ currentUser, users: INITIAL_USERS, loginAs, logout, isAdmin, isAuthenticated }}>
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
