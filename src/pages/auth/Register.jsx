import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiEye, FiEyeOff, FiGithub, FiTwitter } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import ReCAPTCHA from 'react-google-recaptcha';
import PasswordStrengthIndicator from '../../components/common/PasswordStrengthIndicator';

const Register = () => {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    agreeTerms: false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recaptchaValue, setRecaptchaValue] = useState(null);
  
  const { register, signInWithGoogle, signInWithGithub, signInWithTwitter } = useAuth();
  
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSocialAuth = async (provider) => {
    try {
      setIsLoading(true);
      setError('');
      
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
        navigate('/products');
      } else {
        setError(result.error || `${provider} authentication failed`);
      }
    } catch (err) {
      setError(`Failed to authenticate with ${provider}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset messages
    setError('');
    setSuccessMessage('');
    
    // Basic validation
    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }
    
    if (!formData.email.trim()) {
      setError("Email is required");
      return;
    }
    
    // Email validation using regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }
    
    // Password validation
    if (!formData.password) {
      setError("Password is required");
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    
    if (!formData.agreeTerms) {
      setError("You must agree to the terms and conditions");
      return;
    }

    if (!recaptchaValue) {
      setError("Please complete the reCAPTCHA verification");
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Register the user as a buyer
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        recaptchaToken: recaptchaValue
      });
      
      if (result.success) {
        setSuccessMessage(result.message || 'Registration successful! You can now log in.');
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          phone: '',
          agreeTerms: false
        });
        setRecaptchaValue(null);
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/auth/login');
        }, 2000);
      } else {
        setError(result.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('Registration failed. Please try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-neutral-900">Create your account</h2>
        <p className="mt-2 text-sm text-neutral-600">
          Already have an account?{' '}
          <Link to="/auth/login" className="font-medium text-primary-600 hover:text-primary-500">
            Sign in instead
          </Link>
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

      <div className="grid grid-cols-1 gap-3 mb-6">
        <button
          type="button"
          onClick={() => handleSocialAuth('google')}
          className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
        >
          <FcGoogle className="h-5 w-5 mr-2" />
          Continue with Google
        </button>
        
        <button
          type="button"
          onClick={() => handleSocialAuth('github')}
          className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
        >
          <FiGithub className="h-5 w-5 mr-2" />
          Continue with GitHub
        </button>
        
        <button
          type="button"
          onClick={() => handleSocialAuth('twitter')}
          className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
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
          <span className="px-2 bg-white text-gray-500">Or register with email</span>
        </div>
      </div>
      
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-neutral-700">
            Full Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="John Smith"
          />
        </div>
        
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
            value={formData.email}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="you@example.com"
          />
        </div>
        
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-neutral-700">
            Phone Number (optional)
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={formData.phone}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="+233 XX XXX XXXX"
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
              autoComplete="new-password"
              required
              value={formData.password}
              onChange={handleChange}
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
          <PasswordStrengthIndicator password={formData.password} />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700">
            Confirm Password
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="••••••••"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-neutral-400 hover:text-neutral-500 focus:outline-none"
              >
                {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <input
            id="agreeTerms"
            name="agreeTerms"
            type="checkbox"
            checked={formData.agreeTerms}
            onChange={handleChange}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
          />
          <label htmlFor="agreeTerms" className="ml-2 block text-sm text-neutral-700">
            I agree to the{' '}
            <Link to="/terms" className="font-medium text-primary-600 hover:text-primary-500">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="font-medium text-primary-600 hover:text-primary-500">
              Privacy Policy
            </Link>
          </label>
        </div>

        <div className="flex justify-center">
          <ReCAPTCHA
            sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'}
            onChange={setRecaptchaValue}
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
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating account...
              </span>
            ) : 'Create Account'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Register;
