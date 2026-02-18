import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark';
}

const Logo: React.FC<LogoProps> = ({ className = "h-12", variant = 'dark' }) => {
  return (
    <img 
      src="https://res.cloudinary.com/clsllc/image/upload/v1765007709/unnamed_2_gvp0eo.jpg" 
      alt="Creative Landscaping Solutions" 
      className={`${className} w-auto object-contain max-w-full`}
    />
  );
};

export default Logo;