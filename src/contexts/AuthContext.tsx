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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => storageService.getIsLoggedIn());

  useEffect(() => {
    storageService.saveCurrentUser(currentUser);
  }, [currentUser]);

  useEffect(() => {
    storageService.saveIsLoggedIn(isAuthenticated);
  }, [isAuthenticated]);

  const loginAs = (userIdentifier: string, password?: string): boolean => {
    // Standard password required is "123"
    if (password !== undefined && password !== '123') {
      return false;
    }

    const cleanInput = userIdentifier.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (!cleanInput) return false;

    const found = INITIAL_USERS.find(u => {
      const cleanName = u.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const cleanId = u.id.toLowerCase();
      
      if (cleanInput === 'fabio' || cleanInput === 'admin' || cleanInput === 'fabio adm') {
        return u.role === 'admin';
      }
      if (cleanInput === 'joao' || cleanInput === 'joao silva') {
        return u.id === 'op-1';
      }
      return cleanName.includes(cleanInput) || cleanId === cleanInput || u.id === userIdentifier;
    });

    if (found) {
      setCurrentUser(found);
      setIsAuthenticated(true);
      return true;
    }
    return false;
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
