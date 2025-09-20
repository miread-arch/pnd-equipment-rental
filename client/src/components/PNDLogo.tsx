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
        style={{ width: size, height: size }}
      >
        <img 
          src={logoUrl} 
          alt="Company Logo" 
          className="w-full h-full object-contain"
          style={{ maxWidth: size, maxHeight: size }}
        />
      </div>
    );
  }

  // Default PND logo
  return (
    <div 
      className={`flex items-center justify-center rounded-full ${className}`}
      style={{ 
        width: size, 
        height: size,
        backgroundColor: '#3B82F6'
      }}
    >
      <span 
        className="font-bold select-none"
        style={{ 
          color: '#000000',
          fontSize: size * 0.3 // Responsive font size based on logo size
        }}
      >
        PND
      </span>
    </div>
  );
}