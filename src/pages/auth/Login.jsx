import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiEye, FiEyeOff, FiAlertCircle, FiGithub, FiTwitter } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import ReCAPTCHA from 'react-google-recaptcha';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);
  const [recaptchaValue, setRecaptchaValue] = useState(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  
  const { login, signInWithGoogle, signInWithGithub, signInWithTwitter, error: authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the return URL from query params, default to products page for buyers
  const searchParams = new URLSearchParams(location.search);
  const returnTo = searchParams.get('returnTo') || '/products';

  // Show any global auth errors
  useEffect(() => {
    if (authError) {
      setError(`Authentication error: ${authError}`);
    }
  }, [authError]);

  // Load saved email if available
  useEffect(() => {
    const savedEmail = localStorage.getItem('lastUsedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  const handleSocialAuth = async (provider) => {
    try {
      setIsLoading(true);
      setError('');
      setStatusMessage(`Connecting to ${provider}...`);
      
      let result;
      switch (provider) {
        case 'google':
          result = await signInWithGoogle();
          break;
        case 'github':
          result = await signInWithGithub();
          break;
        case 'twitter':
          result = await signInWithTwitter();
          break;
        default:
          throw new Error('Invalid provider');
      }
      
      if (result.success) {
        if (rememberDevice) {
          localStorage.setItem('lastUsedEmail', result.email);
        }
        navigate(returnTo);
      } else {
        setError(result.error || `${provider} authentication failed`);
        setFailedAttempts(prev => prev + 1);
      }
    } catch (err) {
      setError(`Failed to authenticate with ${provider}`);
      console.error(err);
      setFailedAttempts(prev => prev + 1);
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    // Require reCAPTCHA after 3 failed attempts
    if (failedAttempts >= 3 && !recaptchaValue) {
      setError('Please complete the reCAPTCHA verification');
      return;
    }
    
    try {
      setError('');
      setStatusMessage('Connecting to authentication service...');
      setIsLoading(true);
      
      const result = await login(email, password, recaptchaValue);
      
      if (result.success) {
        setStatusMessage('Login successful! Redirecting...');
        
        // Save email if remember device is checked
        if (rememberDevice) {
          localStorage.setItem('lastUsedEmail', email);
        } else {
          localStorage.removeItem('lastUsedEmail');
        }
        
        // Navigate to the returnTo URL or default to the shop page
        navigate(returnTo);
      } else {
        setError(result.error || 'Invalid email or password');
        setStatusMessage('');
        setFailedAttempts(prev => prev + 1);
        
        // Clear reCAPTCHA on failure
        if (recaptchaValue) {
          setRecaptchaValue(null);
        }
      }
    } catch (err) {
      console.error('Login: Exception occurred', err);
      setError('Failed to log in. Please try again.');
      setStatusMessage('');
      setFailedAttempts(prev => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-neutral-900">Sign in to your account</h2>
        <p className="mt-2 text-sm text-neutral-600">
          Or{' '}
          <Link to="/auth/register" className="font-medium text-primary-600 hover:text-primary-500">
            create a new account
          </Link>
        </p>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-error-50 text-error-700 rounded-md border border-error-200 flex items-start">
          <FiAlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {statusMessage && (
        <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-md border border-blue-200">
          {statusMessage}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 mb-6">
        <button
          type="button"
          onClick={() => handleSocialAuth('google')}
          disabled={isLoading}
          className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FcGoogle className="h-5 w-5 mr-2" />
          Continue with Google
        </button>
        
        <button
          type="button"
          onClick={() => handleSocialAuth('github')}
          disabled={isLoading}
          className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiGithub className="h-5 w-5 mr-2" />
          Continue with GitHub
        </button>
        
        <button
          type="button"
          onClick={() => handleSocialAuth('twitter')}
          disabled={isLoading}
          className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiTwitter className="h-5 w-5 mr-2" />
          Continue with Twitter
        </button>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with email</span>
        </div>
      </div>
      
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
          <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
            Password
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="••••••••"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-neutral-400 hover:text-neutral-500 focus:outline-none"
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember_device"
              name="remember_device"
              type="checkbox"
              checked={rememberDevice}
              onChange={(e) => setRememberDevice(e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
            />
            <label htmlFor="remember_device" className="ml-2 block text-sm text-neutral-700">
              Remember this device
            </label>
          </div>

          <div className="text-sm">
            <Link to="/auth/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
              Forgot your password?
            </Link>
          </div>
        </div>

        {failedAttempts >= 3 && (
          <div className="flex justify-center">
            <ReCAPTCHA
              sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'}
              onChange={setRecaptchaValue}
            />
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 ${
              isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            ) : 'Sign in'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
