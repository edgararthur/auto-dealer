import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { session } = useAuth();

  useEffect(() => {
    // If we have a session, redirect to the products page
    if (session) {
      navigate('/products');
    } else {
      // If no session, redirect back to login
      navigate('/auth/login');
    }
  }, [session, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-neutral-600">Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
