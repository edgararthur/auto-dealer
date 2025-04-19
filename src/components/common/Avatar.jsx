import React from 'react';

const Avatar = ({ name, src, size = 'medium' }) => {
  const sizeClasses = {
    small: 'h-8 w-8 text-xs',
    medium: 'h-10 w-10 text-sm',
    large: 'h-14 w-14 text-base',
  };
  
  // Function to generate background color based on name
  const generateColor = (name) => {
    const colors = [
      'bg-primary-500',
      'bg-secondary-500',
      'bg-accent-500',
      'bg-success-500',
      'bg-error-500',
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const index = Math.abs(hash % colors.length);
    return colors[index];
  };
  
  // Function to get initials from name
  const getInitials = (name) => {
    if (!name) return '?';
    
    const parts = name.split(' ');
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };
  
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeClasses[size]} rounded-full object-cover`}
      />
    );
  }
  
  return (
    <div
      className={`${sizeClasses[size]} ${generateColor(name)} rounded-full flex items-center justify-center text-white font-medium`}
    >
      {getInitials(name)}
    </div>
  );
};

export default Avatar;
