import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/roast';
import { storageService, INITIAL_USERS } from '../services/storageService';

interface AuthContextType {
  currentUser: User;
  users: User[];
  loginAs: (userId: string) => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => storageService.getCurrentUser());

  useEffect(() => {
    storageService.saveCurrentUser(currentUser);
  }, [currentUser]);

  const loginAs = (userId: string) => {
    const found = INITIAL_USERS.find(u => u.id === userId);
    if (found) {
      setCurrentUser(found);
    }
  };

  const isAdmin = currentUser.role === 'admin';

  return (
    <AuthContext.Provider value={{ currentUser, users: INITIAL_USERS, loginAs, isAdmin }}>
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
