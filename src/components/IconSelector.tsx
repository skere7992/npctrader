import React, { useState } from 'react';
import { AVAILABLE_ICONS, getItemIconUrl } from '../types/config';
import { Search, Star, Package } from 'lucide-react';

interface IconSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  className?: string;
}

// Componente para manejar iconos con fallback
const IconDisplay: React.FC<{ 
  iconName: string; 
  className?: string; 
  size?: string;
}> = ({ iconName, className = "", size = "w-6 h-6" }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (hasError) {
    return (
      <div className={`${size} ${className} bg-brand-charcoal border border-brand-green/30 rounded flex items-center justify-center`}>
        <Star className="w-3 h-3 text-brand-green/60" />
      </div>
    );
  }

  return (
    <div className={`${size} ${className} relative`}>
      {isLoading && (
        <div className={`${size} bg-brand-charcoal border border-brand-green/30 rounded animate-pulse`} />
      )}
      <img
        src={getItemIconUrl(iconName)}
        alt={iconName}
        className={`${size} rounded object-cover ${isLoading ? 'absolute opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading="lazy"
      />
    </div>
  );
};

export const IconSelector: React.FC<IconSelectorProps> = ({ 
  value, 
  onChange, 
  label, 
  className = "" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredIcons = AVAILABLE_ICONS.filter(icon =>
    icon.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 50); // Limitar a 50 para mejor rendimiento

  const handleSelect = (icon: string) => {
    onChange(icon);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-xs text-brand-grey mb-1">{label}</label>
      )}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center px-2 py-1 bg-brand-charcoal border border-brand-green rounded text-brand-cream text-sm hover:bg-brand-charcoal/80 transition-colors"
      >
        <IconDisplay 
          iconName={value} 
          className="mr-2" 
          size="w-6 h-6"
        />
        <span className="flex-1 text-left font-mono">{value}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-brand-charcoal border border-brand-green rounded-lg shadow-xl max-h-64 overflow-hidden">
          <div className="p-2 border-b border-brand-green/30">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-brand-green" />
              <input
                type="text"
                placeholder="Search icons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1 bg-brand-charcoal border border-brand-green/50 rounded text-brand-cream text-sm focus:outline-none focus:border-brand-green"
                autoFocus
              />
            </div>
          </div>
          
          <div className="max-h-48 overflow-y-auto">
            <div className="grid grid-cols-4 gap-1 p-2">
              {filteredIcons.map(icon => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => handleSelect(icon)}
                  className="flex flex-col items-center p-2 hover:bg-brand-charcoal/60 rounded transition-colors"
                  title={icon}
                >
                  <IconDisplay 
                    iconName={icon} 
                    className="mb-1" 
                    size="w-8 h-8"
                  />
                  <span className="text-xs text-brand-grey truncate w-full text-center font-mono">
                    {icon.length > 8 ? `${icon.substring(0, 8)}...` : icon}
                  </span>
                </button>
              ))}
            </div>
            
            {filteredIcons.length === 0 && (
              <div className="px-3 py-4 text-center text-brand-grey text-sm">
                No icons found matching "{searchTerm}"
              </div>
            )}

            {searchTerm && AVAILABLE_ICONS.filter(icon =>
              icon.toLowerCase().includes(searchTerm.toLowerCase())
            ).length > 50 && (
              <div className="px-3 py-2 text-center text-brand-grey text-xs border-t border-brand-green/30">
                Showing first 50 results. Refine your search for more specific results.
              </div>
            )}
          </div>
        </div>
      )}
      
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};