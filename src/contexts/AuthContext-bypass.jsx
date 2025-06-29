import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user] = useState({
    id: 'test-user-123',
    email: 'test@example.com',
    profile: {
      id: 'test-user-123',
      full_name: 'Test User',
      email: 'test@example.com',
      role: 'customer',
      created_at: new Date(),
      is_active: true
    }
  });
  
  const [session] = useState({
    user: {
      id: 'test-user-123',
      email: 'test@example.com'
    }
  });
  
  const [loading] = useState(false);
  const [error] = useState(null);

  const mockFunction = async () => ({ success: true, message: 'Mock function' });

  const value = {
    user,
    session,
    loading,
    error,
    register: mockFunction,
    login: mockFunction,
    logout: mockFunction,
    resetPassword: mockFunction,
    updateProfile: mockFunction,
    updateEmail: mockFunction,
    updatePassword: mockFunction,
    ensureBuyerProfile: mockFunction
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
