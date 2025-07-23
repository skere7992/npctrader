import React, { useState } from 'react';
import { AVAILABLE_ICONS } from '../types/config';
import { Search, Star, Package } from 'lucide-react';

interface IconSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  className?: string;
}

// Componente para mostrar iconos reales (con PNG)
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

  // Si hay error, mostrar placeholder
  if (hasError) {
    return (
      <div className={`${size} ${className} bg-brand-charcoal border border-brand-green/50 rounded flex items-center justify-center`}>
        <Star className="w-3 h-3 text-brand-green" />
      </div>
    );
  }

  return (
    <div className={`${size} ${className} relative`}>
      {isLoading && (
        <div className={`${size} bg-brand-charcoal border border-brand-green/30 rounded animate-pulse`} />
      )}
      <img
        src={`./icons/${iconName}.png`} // Usar ruta relativa a los PNGs
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
  ); // Quitar el límite .slice(0, 50)

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
        <span className="flex-1 text-left font-mono text-brand-green">{value}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-brand-charcoal border border-brand-green rounded-lg shadow-xl max-h-96 overflow-hidden"> {/* Aumentar de 64 a 96 */}
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
          
          <div className="max-h-80 overflow-y-auto"> {/* Aumentar altura de 48 a 80 */}
            <div className="grid grid-cols-3 gap-2 p-2"> {/* Cambiar a grid de 3 columnas */}
              {filteredIcons.map(icon => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => handleSelect(icon)}
                  className="flex flex-col items-center p-2 hover:bg-brand-charcoal/60 rounded transition-colors"
                  title={`Icon: ${icon}`}
                >
                  <IconDisplay 
                    iconName={icon} 
                    className="mb-2" 
                    size="w-8 h-8"
                  />
                  <span className="text-xs text-brand-cream font-mono text-center truncate w-full">
                    {icon.length > 10 ? `${icon.substring(0, 10)}...` : icon}
                  </span>
                </button>
              ))}
            </div>
            
            {filteredIcons.length === 0 && (
              <div className="px-3 py-4 text-center text-brand-grey text-sm">
                No icons found matching "{searchTerm}"
              </div>
            )}
          </div>
          
          <div className="px-3 py-2 bg-brand-charcoal/50 border-t border-brand-green/30">
            <p className="text-xs text-brand-grey">
              These are Rust internal icons. Select one to use in your trade offers.
            </p>
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
