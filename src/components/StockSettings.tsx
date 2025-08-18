import React from 'react';
import { StockSettings } from '../types/config';
import { Package } from 'lucide-react';

interface StockSettingsEditorProps {
  settings: StockSettings;
  onChange: (settings: StockSettings) => void;
  title?: string;
}

export const StockSettingsEditor: React.FC<StockSettingsEditorProps> = ({ 
  settings, 
  onChange,
  title = "Stock Settings"
}) => {
  const handleChange = (key: keyof StockSettings, value: any) => {
    onChange({
      ...settings,
      [key]: value
    });
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <Package className="w-5 h-5" />
        {title}
      </h3>
      
      <div className="space-y-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings["Enable Stock Limit"]}
            onChange={(e) => handleChange("Enable Stock Limit", e.target.checked)}
            className="rounded"
          />
          <span>Enable Stock Limit</span>
        </label>

        {settings["Enable Stock Limit"] && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1">Maximum Stock</label>
                <input
                  type="number"
                  value={settings["Maximum Stock"]}
                  onChange={(e) => handleChange("Maximum Stock", parseInt(e.target.value))}
                  className="w-full bg-gray-700 rounded px-3 py-1"
                />
              </div>
              
              <div>
                <label className="block text-sm mb-1">Current Stock</label>
                <input
                  type="number"
                  value={settings["Current Stock"]}
                  onChange={(e) => handleChange("Current Stock", parseInt(e.target.value))}
                  className="w-full bg-gray-700 rounded px-3 py-1"
                />
              </div>
              
              <div>
                <label className="block text-sm mb-1">Restock Amount</label>
                <input
                  type="number"
                  value={settings["Restock Amount"]}
                  onChange={(e) => handleChange("Restock Amount", parseInt(e.target.value))}
                  className="w-full bg-gray-700 rounded px-3 py-1"
                />
              </div>
              
              <div>
                <label className="block text-sm mb-1">Restock Interval (seconds)</label>
                <input
                  type="number"
                  value={settings["Restock Interval (seconds, 0 = disabled)"]}
                  onChange={(e) => handleChange("Restock Interval (seconds, 0 = disabled)", parseInt(e.target.value))}
                  className="w-full bg-gray-700 rounded px-3 py-1"
                />
              </div>
            </div>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings["Reset Stock on Wipe"]}
                onChange={(e) => handleChange("Reset Stock on Wipe", e.target.checked)}
                className="rounded"
              />
              <span>Reset Stock on Wipe</span>
            </label>
          </>
        )}
      </div>
    </div>
  );
};
