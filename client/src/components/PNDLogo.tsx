import { useState, useEffect } from "react";

interface PNDLogoProps {
  size?: number;
  className?: string;
}

export default function PNDLogo({ size = 60, className = "" }: PNDLogoProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    // Check if custom logo is stored in localStorage
    const customLogo = localStorage.getItem('company-logo');
    if (customLogo) {
      setLogoUrl(customLogo);
    }

    // Listen for logo updates
    const handleLogoUpdate = () => {
      const updatedLogo = localStorage.getItem('company-logo');
      setLogoUrl(updatedLogo);
    };

    window.addEventListener('logo-updated', handleLogoUpdate);
    return () => window.removeEventListener('logo-updated', handleLogoUpdate);
  }, []);

  // If custom logo exists, use it
  if (logoUrl) {
    return (
      <div 
        className={`flex items-center justify-center ${className}`}
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        <img 
          src={logoUrl} 
          alt="Company Logo" 
          className="object-contain"
          style={{ 
            width: `${size}px`, 
            height: `${size}px`,
            maxWidth: `${size}px`, 
            maxHeight: `${size}px` 
          }}
        />
      </div>
    );
  }

  // Default PND logo
  return (
    <div 
      className={`flex items-center justify-center rounded-full ${className}`}
      style={{ 
        width: `${size}px`, 
        height: `${size}px`,
        backgroundColor: '#3B82F6',
        minWidth: `${size}px`,
        minHeight: `${size}px`,
        flexShrink: 0
      }}
    >
      <span 
        className="font-bold select-none text-black"
        style={{ 
          fontSize: `${size * 0.3}px`, // Responsive font size based on logo size
          lineHeight: '1'
        }}
      >
        PND
      </span>
    </div>
  );
}