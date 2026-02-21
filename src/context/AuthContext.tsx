import React, { createContext, useContext, useState, useEffect } from 'react';

interface Permission {
  id: number;
  module: string;
  action: string;
  description: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  phone: string;
  full_name: string;
  role: string;
  permissions: Permission[];
}

interface AuthContextType {
  auth: {
    token: string | null;
    user: User | null;
  };
  setAuth: React.Dispatch<React.SetStateAction<{ token: string | null; user: User | null }>>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<{ token: string | null; user: User | null }>(() => {
    const savedAuth = localStorage.getItem('auth');
    return savedAuth ? JSON.parse(savedAuth) : { token: null, user: null };
  });

  useEffect(() => {
    if (auth.token) {
      localStorage.setItem('auth', JSON.stringify(auth));
    } else {
      localStorage.removeItem('auth');
    }
  }, [auth]);

  const logout = () => {
    setAuth({ token: null, user: null });
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
