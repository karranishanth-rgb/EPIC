
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white p-6 sm:p-8 rounded-lg shadow-md border border-slate-200 ${className}`}>
      {children}
    </div>
  );
};
