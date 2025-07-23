import React, { useState, useEffect } from 'react';
import { NPCTraderConfig, SKIN_SETS } from './types/config';
import { ColorPicker } from './components/ColorPicker';
import { TradeOfferEditor } from './components/TradeOfferEditor';
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
  Save,
  FileText,
  Wrench
} from 'lucide-react';

function App() {
  const [config, setConfig] = useState<NPCTraderConfig | null>(null);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    // Load the default config
    fetch('/NPCTrader.json')
      .then(response => response.json())
      .then(data => setConfig(data))
      .catch(error => console.error('Error loading config:', error));
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
          const uploadedConfig = JSON.parse(e.target?.result as string);
          setConfig(uploadedConfig);
        } catch (error) {
          alert('Error parsing JSON file');
        }
      };
      reader.readAsText(file);
    }
  };

  const addTradeOffer = () => {
    if (!config) return;
    
    const newOffer = {
      "Display Name": "New Trade Offer",
      "Required Items": [{
        "Item Shortname": "wood",
        "Amount": 100,
        "Skin ID": 0
      }],
      "Rewards": [{
        "Type": 0,
        "Value": "metal.fragments",
        "Amount": 50,
        "Skin ID": 0
      }],
      "Icon": "ore",
      "Permission Required": ""
    };

    updateConfig({
      "Trade Offers": [...config["Trade Offers"], newOffer]
    });
  };

  if (!config) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-charcoal via-brand-charcoal to-brand-green flex items-center justify-center">
        <div className="text-center">
          <Wrench className="w-16 h-16 text-brand-green mx-auto mb-4 animate-spin" />
          <p className="text-brand-cream text-xl">Loading NPC Trader Configuration...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'appearance', label: 'Appearance', icon: User },
    { id: 'cooldowns', label: 'Cooldowns', icon: Clock },
    { id: 'language', label: 'Language', icon: Globe },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'ui', label: 'UI Colors', icon: Palette },
    { id: 'trades', label: 'Trade Offers', icon: ShoppingCart },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-charcoal via-brand-charcoal to-brand-green">
      {/* Header */}
      <div className="bg-brand-charcoal/90 border-b border-brand-green backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Wrench className="w-8 h-8 text-brand-green" />
              <div>
                <h1 className="text-2xl font-bold text-brand-cream">Rust NPC Trader</h1>
                <p className="text-brand-grey text-sm">Configuration Editor</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".json"
                  onChange={uploadConfig}
                  className="hidden"
                />
                <div className="flex items-center px-4 py-2 bg-brand-blue hover:bg-blue-700 rounded text-white transition-colors">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </div>
              </label>
              
              <button
                onClick={downloadConfig}
                className="flex items-center px-4 py-2 bg-brand-green hover:bg-green-700 rounded text-white transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-brand-charcoal/80 rounded-lg border border-brand-green p-4 backdrop-blur-sm">
              <nav className="space-y-2">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 rounded transition-colors ${
                        activeTab === tab.id
                          ? 'bg-brand-green text-white'
                          : 'text-brand-cream hover:bg-brand-charcoal'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-brand-charcoal/80 rounded-lg border border-brand-green p-6 backdrop-blur-sm">
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-brand-cream flex items-center">
                    <Settings className="w-6 h-6 mr-3" />
                    General Settings
                  </h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-brand-cream mb-2">NPC Display Name</label>
                    <input
                      type="text"
                      value={config["NPC Display Name"]}
                      onChange={(e) => updateConfig({ "NPC Display Name": e.target.value })}
                      className="w-full px-3 py-2 bg-brand-charcoal border border-brand-green rounded text-brand-cream"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-brand-cream flex items-center">
                    <User className="w-6 h-6 mr-3" />
                    NPC Appearance
                  </h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-brand-cream mb-2">Skin Set</label>
                    <select
                      value={config["NPC Appearance"]["Skin Set Name (Available: TacticalTrader, MerchantRobes, ArmoredGuard, WastelandScavenger, EliteOperator, PirateTrader, SurvivalExpert, ApocalypseSurvivor, ScientistResearcher, BanditLeader, ArcticWolf, BlackoutOperator, DesertOutlaw, DragonLord, RustmasTrader, CowboyTrader, NightStalker, SteampunkMerchant, VikingWarrior, AzulMerchant, ToxicMerchant, TribalHunter)"]}
                      onChange={(e) => updateConfig({
                        "NPC Appearance": {
                          ...config["NPC Appearance"],
                          "Skin Set Name (Available: TacticalTrader, MerchantRobes, ArmoredGuard, WastelandScavenger, EliteOperator, PirateTrader, SurvivalExpert, ApocalypseSurvivor, ScientistResearcher, BanditLeader, ArcticWolf, BlackoutOperator, DesertOutlaw, DragonLord, RustmasTrader, CowboyTrader, NightStalker, SteampunkMerchant, VikingWarrior, AzulMerchant, ToxicMerchant, TribalHunter)": e.target.value
                        }
                      })}
                      className="w-full px-3 py-2 bg-brand-charcoal border border-brand-green rounded text-brand-cream"
                    >
                      <option value="">Select a skin set...</option>
                      {SKIN_SETS.map(set => (
                        <option key={set} value={set}>{set}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-brand-cream mb-4">Custom Items with Skins</h3>
                    <div className="space-y-3">
                      {Object.entries(config["NPC Appearance"]["Custom Items with Skins (overrides preset if specified)"]).map(([item, skinId]) => (
                        <div key={item} className="flex items-center space-x-3">
                          <span className="text-brand-grey w-32">{item}:</span>
                          <input
                            type="number"
                            value={skinId}
                            onChange={(e) => updateConfig({
                              "NPC Appearance": {
                                ...config["NPC Appearance"],
                                "Custom Items with Skins (overrides preset if specified)": {
                                  ...config["NPC Appearance"]["Custom Items with Skins (overrides preset if specified)"],
                                  [item]: parseInt(e.target.value) || 0
                                }
                              }
                            })}
                            className="flex-1 px-3 py-2 bg-brand-charcoal border border-brand-green rounded text-brand-cream"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'cooldowns' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-brand-cream flex items-center">
                    <Clock className="w-6 h-6 mr-3" />
                    Cooldown Settings
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-brand-cream mb-2">Default Cooldown (seconds)</label>
                      <input
                        type="number"
                        value={config["Default Cooldown (seconds)"]}
                        onChange={(e) => updateConfig({ "Default Cooldown (seconds)": parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-brand-charcoal border border-brand-green rounded text-brand-cream"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-brand-cream mb-2">VIP Cooldown (seconds)</label>
                      <input
                        type="number"
                        value={config["VIP Cooldown (seconds)"]}
                        onChange={(e) => updateConfig({ "VIP Cooldown (seconds)": parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-brand-charcoal border border-brand-green rounded text-brand-cream"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'language' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-brand-cream flex items-center">
                    <Globe className="w-6 h-6 mr-3" />
                    Language Settings
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-brand-cream mb-2">Default Language</label>
                      <input
                        type="text"
                        value={config["Language Settings"]["Default Language"]}
                        onChange={(e) => updateConfig({
                          "Language Settings": {
                            ...config["Language Settings"],
                            "Default Language": e.target.value
                          }
                        })}
                        className="w-full px-3 py-2 bg-brand-charcoal border border-brand-green rounded text-brand-cream"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={config["Language Settings"]["Allow Per-Player Language"]}
                        onChange={(e) => updateConfig({
                          "Language Settings": {
                            ...config["Language Settings"],
                            "Allow Per-Player Language": e.target.checked
                          }
                        })}
                        className="w-4 h-4 text-brand-green bg-brand-charcoal border-brand-green rounded focus:ring-brand-green"
                      />
                      <label className="text-sm font-medium text-brand-cream">Allow Per-Player Language</label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-brand-cream flex items-center">
                    <Bell className="w-6 h-6 mr-3" />
                    Notification Settings
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={config["NCP Integration"]["Enable NCP Integration"]}
                        onChange={(e) => updateConfig({
                          "NCP Integration": {
                            ...config["NCP Integration"],
                            "Enable NCP Integration": e.target.checked
                          }
                        })}
                        className="w-4 h-4 text-brand-green bg-brand-charcoal border-brand-green rounded focus:ring-brand-green"
                      />
                      <label className="text-sm font-medium text-brand-cream">Enable NCP Integration</label>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={config["NCP Integration"]["Use Chat Fallback if NCP Unavailable"]}
                        onChange={(e) => updateConfig({
                          "NCP Integration": {
                            ...config["NCP Integration"],
                            "Use Chat Fallback if NCP Unavailable": e.target.checked
                          }
                        })}
                        className="w-4 h-4 text-brand-green bg-brand-charcoal border-brand-green rounded focus:ring-brand-green"
                      />
                      <label className="text-sm font-medium text-brand-cream">Use Chat Fallback if NCP Unavailable</label>
                    </div>

                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-brand-cream mb-4">Notification Types</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Object.entries(config["NCP Integration"]["Notification Types"]).map(([key, value]) => (
                          <div key={key} className="flex items-center space-x-3">
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
                              className="w-4 h-4 text-brand-green bg-brand-charcoal border-brand-green rounded focus:ring-brand-green"
                            />
                            <label className="text-sm text-brand-cream">{key}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'ui' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-brand-cream flex items-center">
                    <Palette className="w-6 h-6 mr-3" />
                    UI Color Settings
                  </h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {Object.entries(config["UI Settings"]).map(([key, value]) => (
                      <ColorPicker
                        key={key}
                        label={key}
                        value={value}
                        onChange={(newValue) => updateUISettings(key, newValue)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'trades' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-brand-cream flex items-center">
                      <ShoppingCart className="w-6 h-6 mr-3" />
                      Trade Offers
                    </h2>
                    <button
                      onClick={addTradeOffer}
                      className="flex items-center px-4 py-2 bg-brand-green hover:bg-green-700 rounded text-white transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Trade Offer
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    {config["Trade Offers"].map((offer, index) => (
                      <TradeOfferEditor
                        key={index}
                        offer={offer}
                        onChange={(updatedOffer) => {
                          const offers = [...config["Trade Offers"]];
                          offers[index] = updatedOffer;
                          updateConfig({ "Trade Offers": offers });
                        }}
                        onDelete={() => {
                          const offers = config["Trade Offers"].filter((_, i) => i !== index);
                          updateConfig({ "Trade Offers": offers });
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;