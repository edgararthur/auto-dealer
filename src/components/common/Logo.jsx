import React from 'react';

const Logo = ({ size = 'medium', variant = 'default' }) => {
  const sizes = {
    small: 'h-6',
    medium: 'h-8',
    large: 'h-10'
  };

  const textColor = variant === 'light' ? 'text-white' : 'text-neutral-900';
  const accentColor = 'text-primary-600';

  return (
    <div className="flex items-center">
      <svg 
        className={`${sizes[size]} w-auto`} 
        viewBox="0 0 40 40" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M20 38C29.9411 38 38 29.9411 38 20C38 10.0589 29.9411 2 20 2C10.0589 2 2 10.0589 2 20C2 29.9411 10.0589 38 20 38Z" 
          fill="currentColor" 
          className={accentColor}
        />
        <path 
          d="M14 15H26M14 20H26M14 25H22" 
          stroke="white" 
          strokeWidth="2.5" 
          strokeLinecap="round"
        />
        <path 
          d="M12 10L14.5 30L20 25L25.5 30L28 10" 
          stroke="white" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
      <span className={`ml-2 font-bold text-xl ${textColor}`}>
        Auto<span className={accentColor}>Plus</span>
      </span>
    </div>
  );
};

export default Logo;
