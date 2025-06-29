import React from 'react';
import PropTypes from 'prop-types';

const PasswordStrengthIndicator = ({ password }) => {
  const calculateStrength = (pwd) => {
    let strength = 0;
    
    // Length check
    if (pwd.length >= 8) strength += 1;
    
    // Contains number
    if (/\d/.test(pwd)) strength += 1;
    
    // Contains lowercase
    if (/[a-z]/.test(pwd)) strength += 1;
    
    // Contains uppercase
    if (/[A-Z]/.test(pwd)) strength += 1;
    
    // Contains special char
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) strength += 1;
    
    return strength;
  };
  
  const getStrengthText = (strength) => {
    switch (strength) {
      case 0:
      case 1:
        return { text: 'Weak', color: 'bg-red-500' };
      case 2:
      case 3:
        return { text: 'Medium', color: 'bg-yellow-500' };
      case 4:
      case 5:
        return { text: 'Strong', color: 'bg-green-500' };
      default:
        return { text: '', color: 'bg-gray-200' };
    }
  };
  
  const strength = calculateStrength(password);
  const { text, color } = getStrengthText(strength);
  
  return (
    <div className="mt-1">
      <div className="flex items-center space-x-2">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${color} transition-all duration-300`} 
            style={{ width: `${(strength / 5) * 100}%` }}
          />
        </div>
        <span className="text-xs text-gray-600">{text}</span>
      </div>
      <ul className="mt-2 text-xs text-gray-500 space-y-1">
        <li className={password.length >= 8 ? 'text-green-600' : ''}>
          • At least 8 characters
        </li>
        <li className={/\d/.test(password) ? 'text-green-600' : ''}>
          • Contains a number
        </li>
        <li className={/[a-z]/.test(password) ? 'text-green-600' : ''}>
          • Contains a lowercase letter
        </li>
        <li className={/[A-Z]/.test(password) ? 'text-green-600' : ''}>
          • Contains an uppercase letter
        </li>
        <li className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-600' : ''}>
          • Contains a special character
        </li>
      </ul>
    </div>
  );
};

PasswordStrengthIndicator.propTypes = {
  password: PropTypes.string.isRequired
};

export default PasswordStrengthIndicator;