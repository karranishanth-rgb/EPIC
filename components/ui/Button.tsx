
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ children, className = '', variant = 'primary', ...props }) => {
  const baseClasses = 'inline-flex items-center justify-center px-6 py-2 border rounded-md font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:ring-blue-500',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
