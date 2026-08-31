import React from 'react';

interface LogoProps {
  className?: string;
}

export function Logo({ className = '' }: LogoProps) {
  return (
    <div className={`w-10 h-10 shrink-0 flex items-center justify-center ${className}`}>
      <img
        src="/logo.png"
        alt="LifeLine Agent Logo"
        className="w-full h-full object-contain  shadow-md"
      />
    </div>
  );
}
