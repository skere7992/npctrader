import React, { useState, useEffect } from 'react';
import { Palette } from 'lucide-react';

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange, label }) => {
  const [hex, setHex] = useState('');
  const [alpha, setAlpha] = useState(100);

  useEffect(() => {
    if (value.startsWith('#')) {
      if (value.length === 9) {
        // Has alpha
        setHex(value.substring(0, 7));
        const alphaHex = value.substring(7);
        const alphaValue = parseInt(alphaHex, 16);
        setAlpha(Math.round((alphaValue / 255) * 100));
      } else {
        // No alpha, default to 100
        setHex(value);
        setAlpha(100);
      }
    }
  }, [value]);

  const handleHexChange = (newHex: string) => {
    setHex(newHex);
    updateValue(newHex, alpha);
  };

  const handleAlphaChange = (newAlpha: number) => {
    setAlpha(newAlpha);
    updateValue(hex, newAlpha);
  };

  const updateValue = (hexValue: string, alphaValue: number) => {
    if (alphaValue === 100) {
      onChange(hexValue);
    } else {
      const alphaHex = Math.round((alphaValue / 100) * 255).toString(16).padStart(2, '0').toUpperCase();
      onChange(`${hexValue}${alphaHex}`);
    }
  };

  const previewColor = hex + (alpha === 100 ? '' : Math.round((alpha / 100) * 255).toString(16).padStart(2, '0'));

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-brand-cream">{label}</label>
      <div className="flex items-center space-x-3">
        <div 
          className="w-10 h-10 rounded border-2 border-brand-green flex items-center justify-center"
          style={{ backgroundColor: previewColor }}
        >
          <Palette className="w-4 h-4 text-white opacity-50" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center space-x-2">
            <label className="text-xs text-brand-grey w-12">Color:</label>
            <input
              type="color"
              value={hex}
              onChange={(e) => handleHexChange(e.target.value)}
              className="w-16 h-8 rounded border border-brand-green bg-transparent cursor-pointer"
            />
            <input
              type="text"
              value={hex}
              onChange={(e) => handleHexChange(e.target.value)}
              className="flex-1 px-2 py-1 bg-brand-charcoal border border-brand-green rounded text-brand-cream text-sm font-mono"
              placeholder="#FFFFFF"
            />
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-xs text-brand-grey w-12">Alpha:</label>
            <input
              type="range"
              min="0"
              max="100"
              value={alpha}
              onChange={(e) => handleAlphaChange(parseInt(e.target.value))}
              className="flex-1 h-2 bg-brand-charcoal rounded-lg appearance-none cursor-pointer slider"
            />
            <input
              type="number"
              min="0"
              max="100"
              value={alpha}
              onChange={(e) => handleAlphaChange(parseInt(e.target.value) || 0)}
              className="w-16 px-2 py-1 bg-brand-charcoal border border-brand-green rounded text-brand-cream text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
