import React, { useState } from 'react';
import { RUST_ITEMS, getItemIconUrl, getItemDisplayName } from '../types/config';
import { Search, Package } from 'lucide-react';

interface ItemSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  className?: string;
}

// Componente para manejar las imágenes con fallback
const ItemIcon: React.FC<{ 
  itemShortname: string; 
  className?: string; 
  size?: string;
}> = ({ itemShortname, className = "", size = "w-6 h-6" }) => {
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
        <Package className="w-3 h-3 text-brand-green/60" />
      </div>
    );
  }

  return (
    <div className={`${size} ${className} relative`}>
      {isLoading && (
        <div className={`${size} bg-brand-charcoal border border-brand-green/30 rounded animate-pulse`} />
      )}
      <img
        src={getItemIconUrl(itemShortname)}
        alt={getItemDisplayName(itemShortname)}
        className={`${size} rounded object-cover ${isLoading ? 'absolute opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading="lazy"
      />
    </div>
  );
};

export const ItemSelector: React.FC<ItemSelectorProps> = ({ 
  value, 
  onChange, 
  label, 
  className = "" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = RUST_ITEMS.filter(item =>
    item.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getItemDisplayName(item).toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 100); // Limitar a 100 resultados para mejor rendimiento

  const handleSelect = (item: string) => {
    onChange(item);
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
        <ItemIcon 
          itemShortname={value} 
          className="mr-2" 
          size="w-6 h-6"
        />
        <span className="flex-1 text-left truncate">{getItemDisplayName(value)}</span>
        <span className="text-xs text-brand-grey ml-2 font-mono">{value}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-brand-charcoal border border-brand-green rounded-lg shadow-xl max-h-64 overflow-hidden">
          <div className="p-2 border-b border-brand-green/30">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-brand-green" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1 bg-brand-charcoal border border-brand-green/50 rounded text-brand-cream text-sm focus:outline-none focus:border-brand-green"
                autoFocus
              />
            </div>
          </div>
          
          <div className="max-h-48 overflow-y-auto">
            {filteredItems.map(item => (
              <button
                key={item}
                type="button"
                onClick={() => handleSelect(item)}
                className="w-full flex items-center px-3 py-2 hover:bg-brand-charcoal/60 transition-colors text-left"
              >
                <ItemIcon 
                  itemShortname={item} 
                  className="mr-3" 
                  size="w-8 h-8"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-brand-cream text-sm font-medium truncate">
                    {getItemDisplayName(item)}
                  </div>
                  <div className="text-brand-grey text-xs truncate font-mono">
                    {item}
                  </div>
                </div>
              </button>
            ))}
            
            {filteredItems.length === 0 && (
              <div className="px-3 py-4 text-center text-brand-grey text-sm">
                No items found matching "{searchTerm}"
              </div>
            )}

            {searchTerm && RUST_ITEMS.filter(item =>
              item.toLowerCase().includes(searchTerm.toLowerCase()) ||
              getItemDisplayName(item).toLowerCase().includes(searchTerm.toLowerCase())
            ).length > 100 && (
              <div className="px-3 py-2 text-center text-brand-grey text-xs border-t border-brand-green/30">
                Showing first 100 results. Refine your search for more specific results.
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