import React, { useState, useEffect } from 'react';
import { NPCTraderConfig, SKIN_SETS, StockSettings } from './types/config';
import { ColorPicker } from './components/ColorPicker';
import { TradeOfferEditor } from './components/TradeOfferEditor';
import { OutfitBuilder } from './components/OutfitBuilder';
import { LanguageCreator } from './components/LanguageCreator';
import { 
  Download, 
  Upload, 
  Settings, 
  User, 
  Clock, 
  Globe, 
  Bell, 
  Palette, 
  ShoppingCart,
  Plus,
  Wrench,
  Package
} from 'lucide-react';

// Stock Settings Editor Component
const StockSettingsEditor: React.FC<{
  settings: StockSettings;
  onChange: (settings: StockSettings) => void;
  title?: string;
}> = ({ settings, onChange, title = "Stock Settings" }) => {
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

function App() {
  const [config, setConfig] = useState<NPCTraderConfig | null>(null);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    // Load the default config
    fetch('./NPCTrader.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => setConfig(data))
      .catch(() => {
        console.error('Error loading config, using fallback');
        // Fallback config with new structure
        setConfig({
          "NPC Display Name": "NPCTrader",
          "NPC Appearance": {
            "Skin Set Name (Available: TacticalTrader, MerchantRobes, ArmoredGuard, WastelandScavenger, EliteOperator, PirateTrader, SurvivalExpert, ApocalypseSurvivor, ScientistResearcher, BanditLeader, ArcticWolf, BlackoutOperator, DesertOutlaw, DragonLord, RustmasTrader, CowboyTrader, NightStalker, SteampunkMerchant, VikingWarrior, AzulMerchant, ToxicMerchant, TribalHunter)": "PirateTrader",
            "Custom Items with Skins (overrides preset if specified)": {}
          },
          "Default Cooldown (seconds)": 3600,
          "VIP Cooldown (seconds)": 1800,
          "Stock Settings": {
            "Enable Stock Limit": false,
            "Maximum Stock": 100,
            "Current Stock": 100,
            "Restock Amount": 100,
            "Restock Interval (seconds, 0 = disabled)": 3600,
            "Reset Stock on Wipe": true,
            "Last Restock Time": "0001-01-01T00:00:00"
          },
          "Language Settings": {
            "Default Language": "en",
            "Allow Per-Player Language": true
          },
          "NCP Integration": {
            "Enable NCP Integration": true,
            "Use Chat Fallback if NCP Unavailable": true,
            "Notification Types": {
              "Trade Success Notifications": true,
              "Trade Error Notifications": true,
              "Cooldown Notifications": true,
              "Permission Error Notifications": true,
              "Configuration Change Notifications": true,
              "NPC Management Notifications": true,
              "Conversation Notifications": false,
              "General Info Notifications": true
            }
          },
          "UI Settings": {
            "Main Background Color": "#1E202095",
            "Header Background Color": "#1E202080"
          },
          "Trade Offers": []
        } as NPCTraderConfig);
      });
  }, []);

  const updateConfig = (updates: Partial<NPCTraderConfig>) => {
    if (config) {
      setConfig({ ...config, ...updates });
    }
  };

  const updateUISettings = (key: string, value: string) => {
    if (config) {
      setConfig({
        ...config,
        "UI Settings": {
          ...config["UI Settings"],
          [key]: value
        }
      });
    }
  };

  const downloadConfig = () => {
    if (!config) return;
    
    const dataStr = JSON.stringify(config, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'NPCTrader.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const uploadConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          setConfig(json);
        } catch (error) {
          console.error('Invalid JSON file');
        }
      };
      reader.readAsText(file);
    }
  };

  if (!config) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-xl">Loading configuration...</div>
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'appearance', label: 'Appearance', icon: User },
    { id: 'stock', label: 'Stock', icon: Package },
    { id: 'cooldowns', label: 'Cooldowns', icon: Clock },
    { id: 'language', label: 'Language', icon: Globe },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'ui', label: 'UI Colors', icon: Palette },
    { id: 'offers', label: 'Trade Offers', icon: ShoppingCart },
    { id: 'tools', label: 'Tools', icon: Wrench }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">NPC Trader Configuration</h1>
            <div className="flex gap-2">
              <button
                onClick={downloadConfig}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded transition"
              >
                <Download className="w-4 h-4" />
                Download Config
              </button>
              <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded cursor-pointer transition">
                <Upload className="w-4 h-4" />
                Upload Config
                <input
                  type="file"
                  accept=".json"
                  onChange={uploadConfig}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gray-800 border-t border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded transition whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {/* General Tab */}
        {activeTab === 'general' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <label className="block text-sm font-medium mb-2">NPC Display Name</label>
              <input
                type="text"
                value={config["NPC Display Name"]}
                onChange={(e) => updateConfig({ "NPC Display Name": e.target.value })}
                className="w-full bg-gray-800 rounded px-4 py-2"
              />
            </div>
          </div>
        )}

        {/* Appearance Tab */}
        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <div className="max-w-2xl">
              <label className="block text-sm font-medium mb-2">Skin Set</label>
              <select
                value={config["NPC Appearance"]["Skin Set Name (Available: TacticalTrader, MerchantRobes, ArmoredGuard, WastelandScavenger, EliteOperator, PirateTrader, SurvivalExpert, ApocalypseSurvivor, ScientistResearcher, BanditLeader, ArcticWolf, BlackoutOperator, DesertOutlaw, DragonLord, RustmasTrader, CowboyTrader, NightStalker, SteampunkMerchant, VikingWarrior, AzulMerchant, ToxicMerchant, TribalHunter)"]}
                onChange={(e) => updateConfig({
                  "NPC Appearance": {
                    ...config["NPC Appearance"],
                    "Skin Set Name (Available: TacticalTrader, MerchantRobes, ArmoredGuard, WastelandScavenger, EliteOperator, PirateTrader, SurvivalExpert, ApocalypseSurvivor, ScientistResearcher, BanditLeader, ArcticWolf, BlackoutOperator, DesertOutlaw, DragonLord, RustmasTrader, CowboyTrader, NightStalker, SteampunkMerchant, VikingWarrior, AzulMerchant, ToxicMerchant, TribalHunter)": e.target.value
                  }
                })}
                className="w-full bg-gray-800 rounded px-4 py-2"
              >
                <option value="">Custom Items Only</option>
                {SKIN_SETS.map(set => (
                  <option key={set} value={set}>{set}</option>
                ))}
              </select>
            </div>
            
            <OutfitBuilder
              customItems={config["NPC Appearance"]["Custom Items with Skins (overrides preset if specified)"]}
              onChange={(items) => updateConfig({
                "NPC Appearance": {
                  ...config["NPC Appearance"],
                  "Custom Items with Skins (overrides preset if specified)": items
                }
              })}
            />
          </div>
        )}

        {/* Stock Tab */}
        {activeTab === 'stock' && config["Stock Settings"] && (
          <div className="max-w-2xl">
            <StockSettingsEditor
              settings={config["Stock Settings"]}
              onChange={(settings) => updateConfig({ "Stock Settings": settings })}
              title="Global Stock Configuration"
            />
          </div>
        )}

        {/* Cooldowns Tab */}
        {activeTab === 'cooldowns' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <label className="block text-sm font-medium mb-2">Default Cooldown (seconds)</label>
              <input
                type="number"
                value={config["Default Cooldown (seconds)"]}
                onChange={(e) => updateConfig({ "Default Cooldown (seconds)": parseInt(e.target.value) })}
                className="w-full bg-gray-800 rounded px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">VIP Cooldown (seconds)</label>
              <input
                type="number"
                value={config["VIP Cooldown (seconds)"]}
                onChange={(e) => updateConfig({ "VIP Cooldown (seconds)": parseInt(e.target.value) })}
                className="w-full bg-gray-800 rounded px-4 py-2"
              />
            </div>
          </div>
        )}

        {/* Language Tab */}
        {activeTab === 'language' && (
          <div className="space-y-6">
            <div className="max-w-2xl space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Default Language</label>
                <input
                  type="text"
                  value={config["Language Settings"]["Default Language"]}
                  onChange={(e) => updateConfig({
                    "Language Settings": {
                      ...config["Language Settings"],
                      "Default Language": e.target.value
                    }
                  })}
                  className="w-full bg-gray-800 rounded px-4 py-2"
                />
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config["Language Settings"]["Allow Per-Player Language"]}
                  onChange={(e) => updateConfig({
                    "Language Settings": {
                      ...config["Language Settings"],
                      "Allow Per-Player Language": e.target.checked
                    }
                  })}
                  className="rounded"
                />
                <span>Allow Per-Player Language</span>
              </label>
            </div>
            
            <LanguageCreator />
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-6 max-w-2xl">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config["NCP Integration"]["Enable NCP Integration"]}
                onChange={(e) => updateConfig({
                  "NCP Integration": {
                    ...config["NCP Integration"],
                    "Enable NCP Integration": e.target.checked
                  }
                })}
                className="rounded"
              />
              <span>Enable NCP Integration</span>
            </label>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config["NCP Integration"]["Use Chat Fallback if NCP Unavailable"]}
                onChange={(e) => updateConfig({
                  "NCP Integration": {
                    ...config["NCP Integration"],
                    "Use Chat Fallback if NCP Unavailable": e.target.checked
                  }
                })}
                className="rounded"
              />
              <span>Use Chat Fallback if NCP Unavailable</span>
            </label>
            
            <div className="space-y-2">
              <h3 className="font-semibold">Notification Types</h3>
              {Object.entries(config["NCP Integration"]["Notification Types"]).map(([key, value]) => (
                <label key={key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => updateConfig({
                      "NCP Integration": {
                        ...config["NCP Integration"],
                        "Notification Types": {
                          ...config["NCP Integration"]["Notification Types"],
                          [key]: e.target.checked
                        }
                      }
                    })}
                    className="rounded"
                  />
                  <span>{key}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* UI Colors Tab */}
        {activeTab === 'ui' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">UI Color Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(config["UI Settings"]).map(([key, value]) => (
                <ColorPicker
                  key={key}
                  label={key.replace(/([A-Z])/g, ' $1').trim()}
                  color={value}
                  onChange={(color) => updateUISettings(key, color)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Trade Offers Tab */}
        {activeTab === 'offers' && (
          <TradeOfferEditor
            offers={config["Trade Offers"]}
            onChange={(offers) => updateConfig({ "Trade Offers": offers })}
          />
        )}

        {/* Tools Tab */}
        {activeTab === 'tools' && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Configuration Tools</h3>
              <div className="space-y-4">
                <button
                  onClick={() => {
                    if (confirm('This will reset all settings to default. Are you sure?')) {
                      window.location.reload();
                    }
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition"
                >
                  Reset to Default
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
