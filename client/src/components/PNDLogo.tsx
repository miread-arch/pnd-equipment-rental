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

  // If custom logo exists, use it with high-quality rendering
  if (logoUrl) {
    const isSvg = logoUrl.includes('data:image/svg') || logoUrl.includes('.svg');
    
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
            maxHeight: `${size}px`,
            imageRendering: 'auto',
            filter: 'contrast(1.02) saturate(1.02)',
            backgroundColor: 'transparent'
          }}
          loading="eager"
          decoding="sync"
        />
      </div>
    );
  }

  // Default PND logo with enhanced quality
  return (
    <div 
      className={`flex items-center justify-center rounded-full ${className}`}
      style={{ 
        width: `${size}px`, 
        height: `${size}px`,
        backgroundColor: '#3B82F6',
        minWidth: `${size}px`,
        minHeight: `${size}px`,
        flexShrink: 0,
        filter: 'contrast(1.05) saturate(1.1)',
        boxShadow: size > 60 ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
      }}
    >
      <span 
        className="font-bold select-none text-white antialiased"
        style={{ 
          fontSize: `${size * 0.3}px`,
          lineHeight: '1',
          textRendering: 'optimizeLegibility',
          WebkitFontSmoothing: 'antialiased'
        }}
      >
        PND
      </span>
    </div>
  );
}