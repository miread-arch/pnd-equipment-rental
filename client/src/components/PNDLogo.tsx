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
        style={{ 
          width: `${size}px`, 
          height: `${size}px`,
          minWidth: `${size}px`,
          minHeight: `${size}px`
        }}
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
            imageRendering: 'crisp-edges',
            filter: 'contrast(1.1) saturate(1.1) brightness(1.05)',
            backgroundColor: 'transparent'
          }}
          loading="eager"
          decoding="sync"
        />
      </div>
    );
  }

  // Default PND logo with enhanced quality
  const logoClass = size === 40 ? 'force-logo-40' : size === 32 ? 'force-logo-32' : '';
  const textClass = size === 40 ? 'force-logo-text-40' : size === 32 ? 'force-logo-text-32' : '';
  
  return (
    <div 
      className={`flex items-center justify-center rounded-full ${logoClass} ${className}`}
      style={{ 
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        maxWidth: size,
        maxHeight: size,
        backgroundColor: '#2563EB',
        flexShrink: 0,
        filter: 'contrast(1.1) saturate(1.2) brightness(1.05)',
        boxShadow: size > 60 ? '0 4px 12px rgba(37, 99, 235, 0.3)' : '0 2px 6px rgba(37, 99, 235, 0.2)',
        border: size <= 40 ? 'none' : '2px solid rgba(255, 255, 255, 0.2)',
        boxSizing: 'border-box'
      }}
    >
      <span 
        className={`font-bold select-none text-white antialiased ${textClass}`}
        style={{ 
          textRendering: 'optimizeLegibility',
          WebkitFontSmoothing: 'antialiased',
          letterSpacing: '-1px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%'
        }}
      >
        PND
      </span>
    </div>
  );
}