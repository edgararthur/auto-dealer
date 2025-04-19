import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const { resetPassword } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    try {
      setError('');
      setSuccessMessage('');
      setIsLoading(true);
      
      const result = await resetPassword(email);
      
      if (result.success) {
        setSuccessMessage(result.message || 'Password reset instructions sent to your email');
        setEmail('');
      } else {
        setError(result.error || 'Failed to send reset instructions');
      }
    } catch (err) {
      setError('Failed to send reset instructions. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-neutral-900">Reset your password</h2>
        <p className="mt-2 text-sm text-neutral-600">
          Enter your email address and we'll send you instructions to reset your password.
        </p>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-error-50 text-error-700 rounded-md border border-error-200">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="mb-4 p-3 bg-success-50 text-success-700 rounded-md border border-success-200">
          {successMessage}
        </div>
      )}
      
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="you@example.com"
          />
        </div>
        
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 ${
              isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
            }`}
          >
            {isLoading ? 'Sending...' : 'Send Reset Instructions'}
          </button>
        </div>
      </form>
      
      <div className="mt-6 text-center">
        <Link to="/auth/login" className="text-sm font-medium text-primary-600 hover:text-primary-500">
          Return to sign in
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
