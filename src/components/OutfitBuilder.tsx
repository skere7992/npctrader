import React, { useState } from 'react';
import { getItemIconUrl, getItemDisplayName } from '../types/config';
import { Search, User, Shirt, Shield, Eye, RotateCcw } from 'lucide-react';

interface OutfitBuilderProps {
  customItems: Record<string, number>;
  onChange: (customItems: Record<string, number>) => void;
  className?: string;
}

// Definir slots de outfit típicos para Rust
const OUTFIT_SLOTS = [
  { 
    id: 'helmet', 
    name: 'Helmet', 
    icon: Shield,
    items: [
      'metal.facemask', 'riot.helmet', 'coffee.can.helmet', 'bucket.helmet',
      'hat.miner', 'hat.boonie', 'hat.cap', 'deer.skull.mask', 'hat.beenie',
      'burlap.headwrap', 'mask.balaclava', 'mask.bandana'
    ]
  },
  { 
    id: 'chest', 
    name: 'Chest', 
    icon: Shirt,
    items: [
      'metal.plate.torso', 'roadsign.jacket', 'hoodie', 'jacket', 'jacket.snow',
      'shirt.collared', 'tshirt', 'tshirt.long', 'shirt.tanktop', 'burlap.shirt',
      'attire.hide.vest', 'attire.hide.poncho', 'attire.hide.helterneck'
    ]
  },
  { 
    id: 'legs', 
    name: 'Legs', 
    icon: User,
    items: [
      'roadsign.kilt', 'pants', 'pants.shorts', 'burlap.trousers',
      'attire.hide.pants', 'attire.hide.skirt', 'heavy.plate.pants'
    ]
  },
  { 
    id: 'feet', 
    name: 'Feet', 
    icon: User,
    items: [
      'shoes.boots', 'burlap.shoes', 'attire.hide.boots', 'boots.frog'
    ]
  },
  { 
    id: 'hands', 
    name: 'Hands', 
    icon: User,
    items: [
      'roadsign.gloves', 'burlap.gloves', 'tactical.gloves'
    ]
  },
  { 
    id: 'weapon', 
    name: 'Weapon', 
    icon: Shield,
    items: [
      'rifle.ak', 'rifle.bolt', 'rifle.lr300', 'rifle.m39', 'rifle.semiauto',
      'smg.thompson', 'smg.mp5', 'smg.2', 'shotgun.pump', 'shotgun.spas12',
      'pistol.python', 'pistol.revolver', 'pistol.semiauto', 'crossbow'
    ]
  }
];

const OutfitPreview: React.FC<{ items: Record<string, { shortname: string; skinId: number }> }> = ({ items }) => {
  return (
    <div className="bg-brand-charcoal/50 rounded-lg p-4 border border-brand-green/30">
      <h4 className="text-sm font-medium text-brand-cream mb-3 flex items-center">
        <Eye className="w-4 h-4 mr-2" />
        Outfit Preview
      </h4>
      <div className="grid grid-cols-3 gap-2">
        {Object.entries(items).map(([slot, item]) => (
          <div key={slot} className="text-center">
            <div className="w-16 h-16 mx-auto mb-2 bg-brand-charcoal border border-brand-green/50 rounded flex items-center justify-center overflow-hidden">
              <img
                src={getItemIconUrl(item.shortname)}
                alt={getItemDisplayName(item.shortname)}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            <div className="text-xs text-brand-grey">
              {OUTFIT_SLOTS.find(s => s.id === slot)?.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const OutfitBuilder: React.FC<OutfitBuilderProps> = ({ 
  customItems, 
  onChange, 
  className = "" 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // Convertir customItems a formato más manejable
  const outfitItems = Object.entries(customItems).reduce((acc, [shortname, skinId]) => {
    // Encontrar el slot al que pertenece este item
    const slot = OUTFIT_SLOTS.find(s => s.items.includes(shortname));
    if (slot) {
      acc[slot.id] = { shortname, skinId };
    }
    return acc;
  }, {} as Record<string, { shortname: string; skinId: number }>);

  const updateOutfitItem = (slotId: string, shortname: string, skinId: number = 0) => {
    const newCustomItems = { ...customItems };
    
    // Remover item anterior del slot si existe
    const existingItem = outfitItems[slotId];
    if (existingItem) {
      delete newCustomItems[existingItem.shortname];
    }
    
    // Agregar nuevo item
    if (shortname) {
      newCustomItems[shortname] = skinId;
    }
    
    onChange(newCustomItems);
    setSelectedSlot(null);
  };

  const removeOutfitItem = (slotId: string) => {
    const newCustomItems = { ...customItems };
    const existingItem = outfitItems[slotId];
    
    if (existingItem) {
      delete newCustomItems[existingItem.shortname];
      onChange(newCustomItems);
    }
  };

  const updateSkinId = (shortname: string, skinId: number) => {
    const newCustomItems = { ...customItems };
    newCustomItems[shortname] = skinId;
    onChange(newCustomItems);
  };

  const clearOutfit = () => {
    onChange({});
  };

  const filteredSlots = OUTFIT_SLOTS.filter(slot =>
    slot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    slot.items.some(item => 
      getItemDisplayName(item).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header con búsqueda */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-brand-cream flex items-center">
          <User className="w-5 h-5 mr-2" />
          Outfit Builder
        </h3>
        <button
          onClick={clearOutfit}
          className="px-3 py-1 bg-brand-rust-red hover:bg-red-700 rounded text-white text-sm transition-colors flex items-center"
        >
          <RotateCcw className="w-3 h-3 mr-1" />
          Clear All
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-brand-green" />
        <input
          type="text"
          placeholder="Search outfit slots or items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-brand-charcoal border border-brand-green rounded text-brand-cream focus:outline-none focus:ring-2 focus:ring-brand-green"
        />
      </div>

      {/* Grid de slots */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSlots.map(slot => {
          const Icon = slot.icon;
          const currentItem = outfitItems[slot.id];
          
          return (
            <div key={slot.id} className="bg-brand-charcoal/50 rounded-lg p-4 border border-brand-green/30">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-brand-cream flex items-center">
                  <Icon className="w-4 h-4 mr-2" />
                  {slot.name}
                </h4>
                {currentItem && (
                  <button
                    onClick={() => removeOutfitItem(slot.id)}
                    className="text-brand-rust-red hover:text-red-400 text-xs"
                  >
                    Remove
                  </button>
                )}
              </div>

              {currentItem ? (
                <div className="space-y-3">
                  {/* Item actual */}
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-brand-charcoal border border-brand-green/50 rounded overflow-hidden">
                      <img
                        src={getItemIconUrl(currentItem.shortname)}
                        alt={getItemDisplayName(currentItem.shortname)}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-brand-cream text-sm font-medium truncate">
                        {getItemDisplayName(currentItem.shortname)}
                      </div>
                      <div className="text-brand-grey text-xs font-mono">
                        {currentItem.shortname}
                      </div>
                    </div>
                  </div>

                  {/* Skin ID */}
                  <div>
                    <label className="block text-xs text-brand-grey mb-1">Skin ID</label>
                    <input
                      type="number"
                      min="0"
                      value={currentItem.skinId}
                      onChange={(e) => updateSkinId(currentItem.shortname, parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1 bg-brand-charcoal border border-brand-green rounded text-brand-cream text-sm focus:outline-none focus:ring-1 focus:ring-brand-green"
                      placeholder="0"
                    />
                  </div>

                  {/* Botón para cambiar item */}
                  <button
                    onClick={() => setSelectedSlot(selectedSlot === slot.id ? null : slot.id)}
                    className="w-full px-2 py-1 bg-brand-orange hover:bg-orange-700 rounded text-white text-sm transition-colors"
                  >
                    Change Item
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setSelectedSlot(selectedSlot === slot.id ? null : slot.id)}
                  className="w-full h-16 border-2 border-dashed border-brand-green/50 rounded text-brand-grey hover:border-brand-green hover:text-brand-cream transition-colors flex items-center justify-center"
                >
                  <Icon className="w-6 h-6 mr-2" />
                  Add {slot.name}
                </button>
              )}

              {/* Selector de items desplegable */}
              {selectedSlot === slot.id && (
                <div className="mt-3 max-h-32 overflow-y-auto border border-brand-green/30 rounded">
                  {slot.items.map(itemShortname => (
                    <button
                      key={itemShortname}
                      onClick={() => updateOutfitItem(slot.id, itemShortname)}
                      className="w-full flex items-center px-2 py-2 hover:bg-brand-charcoal/60 transition-colors text-left"
                    >
                      <div className="w-8 h-8 mr-2 bg-brand-charcoal border border-brand-green/50 rounded overflow-hidden">
                        <img
                          src={getItemIconUrl(itemShortname)}
                          alt={getItemDisplayName(itemShortname)}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-brand-cream text-sm truncate">
                          {getItemDisplayName(itemShortname)}
                        </div>
                        <div className="text-brand-grey text-xs font-mono truncate">
                          {itemShortname}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Preview del outfit */}
      {Object.keys(outfitItems).length > 0 && (
        <OutfitPreview items={outfitItems} />
      )}

      {/* Info de ayuda */}
      <div className="bg-brand-charcoal/30 rounded-lg p-3 border border-brand-green/20">
        <p className="text-brand-grey text-sm">
          💡 <strong>Tip:</strong> Use Skin IDs from Steam Workshop or Rust Item Store. 
          You can find skin IDs at <code className="bg-brand-charcoal px-1 rounded">rustlabs.com</code> or 
          <code className="bg-brand-charcoal px-1 rounded">rustedit.io</code>
        </p>
      </div>
    </div>
  );
};
