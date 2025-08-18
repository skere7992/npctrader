import React, { useState } from 'react';
import { TradeOffer, RequiredItem, Reward, AVAILABLE_ICONS, RUST_ITEMS, getItemDisplayName, getItemIconUrl, StockSettings, CooldownSettings } from '../types/config';
import { Plus, Trash2, Package, Clock, ShoppingCart, Settings, X, ChevronDown, ChevronUp } from 'lucide-react';

interface TradeOfferEditorProps {
  offers: TradeOffer[];
  onChange: (offers: TradeOffer[]) => void;
}

const defaultStockSettings: StockSettings = {
  "Enable Stock Limit": false,
  "Maximum Stock": 100,
  "Current Stock": 100,
  "Restock Amount": 100,
  "Restock Interval (seconds, 0 = disabled)": 3600,
  "Reset Stock on Wipe": true,
  "Last Restock Time": "0001-01-01T00:00:00"
};

const defaultCooldownSettings: CooldownSettings = {
  "Enable Custom Cooldown": false,
  "Cooldown (seconds)": 3600,
  "VIP Cooldown (seconds)": 1800
};

export const TradeOfferEditor: React.FC<TradeOfferEditorProps> = ({ offers, onChange }) => {
  const [expandedOffers, setExpandedOffers] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('');
  const [showIconPicker, setShowIconPicker] = useState<number | null>(null);

  const filteredIcons = AVAILABLE_ICONS.filter(icon => 
    icon.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredItems = RUST_ITEMS.filter(item =>
    item.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getItemDisplayName(item).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedOffers);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedOffers(newExpanded);
  };

  const addOffer = () => {
    const newOffer: TradeOffer = {
      "Display Name": "New Trade Offer",
      "Required Items": [
        { "Item Shortname": "wood", "Amount": 100, "Skin ID": 0 }
      ],
      "Rewards": [
        { "Type": 0, "Value": "metal.fragments", "Amount": 50, "Skin ID": 0 }
      ],
      "Icon": "ore",
      "Permission Required": "",
      "Stock Settings": { ...defaultStockSettings },
      "Cooldown Settings": { ...defaultCooldownSettings }
    };
    onChange([...offers, newOffer]);
    setExpandedOffers(new Set([...expandedOffers, offers.length]));
  };

  const removeOffer = (index: number) => {
    onChange(offers.filter((_, i) => i !== index));
  };

  const updateOffer = (index: number, updatedOffer: TradeOffer) => {
    const newOffers = [...offers];
    newOffers[index] = updatedOffer;
    onChange(newOffers);
  };

  const addRequiredItem = (offerIndex: number) => {
    const offer = offers[offerIndex];
    const newItem: RequiredItem = { "Item Shortname": "wood", "Amount": 100, "Skin ID": 0 };
    updateOffer(offerIndex, {
      ...offer,
      "Required Items": [...offer["Required Items"], newItem]
    });
  };

  const removeRequiredItem = (offerIndex: number, itemIndex: number) => {
    const offer = offers[offerIndex];
    updateOffer(offerIndex, {
      ...offer,
      "Required Items": offer["Required Items"].filter((_, i) => i !== itemIndex)
    });
  };

  const updateRequiredItem = (offerIndex: number, itemIndex: number, item: RequiredItem) => {
    const offer = offers[offerIndex];
    const newItems = [...offer["Required Items"]];
    newItems[itemIndex] = item;
    updateOffer(offerIndex, { ...offer, "Required Items": newItems });
  };

  const addReward = (offerIndex: number) => {
    const offer = offers[offerIndex];
    const newReward: Reward = { "Type": 0, "Value": "metal.fragments", "Amount": 50, "Skin ID": 0 };
    updateOffer(offerIndex, {
      ...offer,
      "Rewards": [...offer["Rewards"], newReward]
    });
  };

  const removeReward = (offerIndex: number, rewardIndex: number) => {
    const offer = offers[offerIndex];
    updateOffer(offerIndex, {
      ...offer,
      "Rewards": offer["Rewards"].filter((_, i) => i !== rewardIndex)
    });
  };

  const updateReward = (offerIndex: number, rewardIndex: number, reward: Reward) => {
    const offer = offers[offerIndex];
    const newRewards = [...offer["Rewards"]];
    newRewards[rewardIndex] = reward;
    updateOffer(offerIndex, { ...offer, "Rewards": newRewards });
  };

  const updateStockSettings = (offerIndex: number, settings: StockSettings) => {
    const offer = offers[offerIndex];
    updateOffer(offerIndex, { ...offer, "Stock Settings": settings });
  };

  const updateCooldownSettings = (offerIndex: number, settings: CooldownSettings) => {
    const offer = offers[offerIndex];
    updateOffer(offerIndex, { ...offer, "Cooldown Settings": settings });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Trade Offers ({offers.length})</h2>
        <button
          onClick={addOffer}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded transition"
        >
          <Plus className="w-4 h-4" />
          Add Trade Offer
        </button>
      </div>

      {offers.map((offer, offerIndex) => (
        <div key={offerIndex} className="bg-gray-800 rounded-lg overflow-hidden">
          {/* Header */}
          <div 
            className="flex items-center justify-between p-4 bg-gray-700 cursor-pointer hover:bg-gray-650 transition"
            onClick={() => toggleExpanded(offerIndex)}
          >
            <div className="flex items-center gap-3">
              {expandedOffers.has(offerIndex) ? 
                <ChevronUp className="w-5 h-5" /> : 
                <ChevronDown className="w-5 h-5" />
              }
              <ShoppingCart className="w-5 h-5 text-blue-400" />
              <span className="font-semibold">{offer["Display Name"]}</span>
              {offer["Permission Required"] && (
                <span className="text-xs bg-yellow-600 px-2 py-1 rounded">
                  {offer["Permission Required"]}
                </span>
              )}
              {offer["Stock Settings"]["Enable Stock Limit"] && (
                <span className="text-xs bg-purple-600 px-2 py-1 rounded">
                  Stock: {offer["Stock Settings"]["Current Stock"]}/{offer["Stock Settings"]["Maximum Stock"]}
                </span>
              )}
              {offer["Cooldown Settings"]["Enable Custom Cooldown"] && (
                <span className="text-xs bg-blue-600 px-2 py-1 rounded">
                  CD: {offer["Cooldown Settings"]["Cooldown (seconds)"]}s
                </span>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeOffer(offerIndex);
              }}
              className="text-red-500 hover:text-red-400 transition"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          {/* Expanded Content */}
          {expandedOffers.has(offerIndex) && (
            <div className="p-4 space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm mb-1">Display Name</label>
                  <input
                    type="text"
                    value={offer["Display Name"]}
                    onChange={(e) => updateOffer(offerIndex, { ...offer, "Display Name": e.target.value })}
                    className="w-full bg-gray-700 rounded px-3 py-1"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Icon</label>
                  <div className="relative">
                    <button
                      onClick={() => setShowIconPicker(offerIndex)}
                      className="w-full bg-gray-700 rounded px-3 py-1 text-left hover:bg-gray-600 transition"
                    >
                      {offer["Icon"] || "Select Icon"}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-1">Permission</label>
                  <input
                    type="text"
                    value={offer["Permission Required"]}
                    onChange={(e) => updateOffer(offerIndex, { ...offer, "Permission Required": e.target.value })}
                    placeholder="Optional"
                    className="w-full bg-gray-700 rounded px-3 py-1"
                  />
                </div>
              </div>

              {/* Required Items */}
              <div className="bg-gray-900 rounded p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-red-400">Required Items</h4>
                  <button
                    onClick={() => addRequiredItem(offerIndex)}
                    className="text-green-500 hover:text-green-400 transition"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {offer["Required Items"].map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center gap-2 bg-gray-800 p-2 rounded">
                      <img 
                        src={getItemIconUrl(item["Item Shortname"])} 
                        alt={item["Item Shortname"]}
                        className="w-8 h-8 object-contain"
                      />
                      <select
                        value={item["Item Shortname"]}
                        onChange={(e) => updateRequiredItem(offerIndex, itemIndex, {
                          ...item,
                          "Item Shortname": e.target.value
                        })}
                        className="flex-1 bg-gray-700 rounded px-2 py-1 text-sm"
                      >
                        {RUST_ITEMS.map(rustItem => (
                          <option key={rustItem} value={rustItem}>
                            {getItemDisplayName(rustItem)}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        value={item["Amount"]}
                        onChange={(e) => updateRequiredItem(offerIndex, itemIndex, {
                          ...item,
                          "Amount": parseInt(e.target.value) || 0
                        })}
                        className="w-20 bg-gray-700 rounded px-2 py-1 text-sm"
                      />
                      <input
                        type="number"
                        value={item["Skin ID"]}
                        onChange={(e) => updateRequiredItem(offerIndex, itemIndex, {
                          ...item,
                          "Skin ID": parseInt(e.target.value) || 0
                        })}
                        placeholder="Skin"
                        className="w-24 bg-gray-700 rounded px-2 py-1 text-sm"
                      />
                      <button
                        onClick={() => removeRequiredItem(offerIndex, itemIndex)}
                        className="text-red-500 hover:text-red-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rewards */}
              <div className="bg-gray-900 rounded p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-green-400">Rewards</h4>
                  <button
                    onClick={() => addReward(offerIndex)}
                    className="text-green-500 hover:text-green-400 transition"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {offer["Rewards"].map((reward, rewardIndex) => (
                    <div key={rewardIndex} className="flex items-center gap-2 bg-gray-800 p-2 rounded">
                      <select
                        value={reward["Type"]}
                        onChange={(e) => updateReward(offerIndex, rewardIndex, {
                          ...reward,
                          "Type": parseInt(e.target.value)
                        })}
                        className="w-24 bg-gray-700 rounded px-2 py-1 text-sm"
                      >
                        <option value={0}>Item</option>
                        <option value={1}>Command</option>
                        <option value={2}>Kit</option>
                      </select>
                      {reward["Type"] === 0 ? (
                        <>
                          <img 
                            src={getItemIconUrl(reward["Value"])} 
                            alt={reward["Value"]}
                            className="w-8 h-8 object-contain"
                          />
                          <select
                            value={reward["Value"]}
                            onChange={(e) => updateReward(offerIndex, rewardIndex, {
                              ...reward,
                              "Value": e.target.value
                            })}
                            className="flex-1 bg-gray-700 rounded px-2 py-1 text-sm"
                          >
                            {RUST_ITEMS.map(rustItem => (
                              <option key={rustItem} value={rustItem}>
                                {getItemDisplayName(rustItem)}
                              </option>
                            ))}
                          </select>
                        </>
                      ) : (
                        <input
                          type="text"
                          value={reward["Value"]}
                          onChange={(e) => updateReward(offerIndex, rewardIndex, {
                            ...reward,
                            "Value": e.target.value
                          })}
                          placeholder={reward["Type"] === 1 ? "Command" : "Kit name"}
                          className="flex-1 bg-gray-700 rounded px-2 py-1 text-sm"
                        />
                      )}
                      <input
                        type="number"
                        value={reward["Amount"]}
                        onChange={(e) => updateReward(offerIndex, rewardIndex, {
                          ...reward,
                          "Amount": parseInt(e.target.value) || 0
                        })}
                        className="w-20 bg-gray-700 rounded px-2 py-1 text-sm"
                      />
                      {reward["Type"] === 0 && (
                        <input
                          type="number"
                          value={reward["Skin ID"]}
                          onChange={(e) => updateReward(offerIndex, rewardIndex, {
                            ...reward,
                            "Skin ID": parseInt(e.target.value) || 0
                          })}
                          placeholder="Skin"
                          className="w-24 bg-gray-700 rounded px-2 py-1 text-sm"
                        />
                      )}
                      <button
                        onClick={() => removeReward(offerIndex, rewardIndex)}
                        className="text-red-500 hover:text-red-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stock Settings */}
              <div className="bg-gray-900 rounded p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Stock Settings
                </h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={offer["Stock Settings"]["Enable Stock Limit"]}
                      onChange={(e) => updateStockSettings(offerIndex, {
                        ...offer["Stock Settings"],
                        "Enable Stock Limit": e.target.checked
                      })}
                      className="rounded"
                    />
                    <span>Enable Stock Limit</span>
                  </label>

                  {offer["Stock Settings"]["Enable Stock Limit"] && (
                    <div className="grid grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs mb-1">Max Stock</label>
                        <input
                          type="number"
                          value={offer["Stock Settings"]["Maximum Stock"]}
                          onChange={(e) => updateStockSettings(offerIndex, {
                            ...offer["Stock Settings"],
                            "Maximum Stock": parseInt(e.target.value) || 0
                          })}
                          className="w-full bg-gray-700 rounded px-2 py-1 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs mb-1">Current</label>
                        <input
                          type="number"
                          value={offer["Stock Settings"]["Current Stock"]}
                          onChange={(e) => updateStockSettings(offerIndex, {
                            ...offer["Stock Settings"],
                            "Current Stock": parseInt(e.target.value) || 0
                          })}
                          className="w-full bg-gray-700 rounded px-2 py-1 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs mb-1">Restock</label>
                        <input
                          type="number"
                          value={offer["Stock Settings"]["Restock Amount"]}
                          onChange={(e) => updateStockSettings(offerIndex, {
                            ...offer["Stock Settings"],
                            "Restock Amount": parseInt(e.target.value) || 0
                          })}
                          className="w-full bg-gray-700 rounded px-2 py-1 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs mb-1">Interval (s)</label>
                        <input
                          type="number"
                          value={offer["Stock Settings"]["Restock Interval (seconds, 0 = disabled)"]}
                          onChange={(e) => updateStockSettings(offerIndex, {
                            ...offer["Stock Settings"],
                            "Restock Interval (seconds, 0 = disabled)": parseInt(e.target.value) || 0
                          })}
                          className="w-full bg-gray-700 rounded px-2 py-1 text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Cooldown Settings */}
              <div className="bg-gray-900 rounded p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Cooldown Settings
                </h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={offer["Cooldown Settings"]["Enable Custom Cooldown"]}
                      onChange={(e) => updateCooldownSettings(offerIndex, {
                        ...offer["Cooldown Settings"],
                        "Enable Custom Cooldown": e.target.checked
                      })}
                      className="rounded"
                    />
                    <span>Enable Custom Cooldown</span>
                  </label>

                  {offer["Cooldown Settings"]["Enable Custom Cooldown"] && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs mb-1">Cooldown (seconds)</label>
                        <input
                          type="number"
                          value={offer["Cooldown Settings"]["Cooldown (seconds)"]}
                          onChange={(e) => updateCooldownSettings(offerIndex, {
                            ...offer["Cooldown Settings"],
                            "Cooldown (seconds)": parseInt(e.target.value) || 0
                          })}
                          className="w-full bg-gray-700 rounded px-2 py-1 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs mb-1">VIP Cooldown (seconds)</label>
                        <input
                          type="number"
                          value={offer["Cooldown Settings"]["VIP Cooldown (seconds)"]}
                          onChange={(e) => updateCooldownSettings(offerIndex, {
                            ...offer["Cooldown Settings"],
                            "VIP Cooldown (seconds)": parseInt(e.target.value) || 0
                          })}
                          className="w-full bg-gray-700 rounded px-2 py-1 text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Icon Picker Modal */}
      {showIconPicker !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Select Icon</h3>
              <button
                onClick={() => setShowIconPicker(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <input
              type="text"
              placeholder="Search icons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-700 rounded px-3 py-2 mb-4"
            />
            <div className="grid grid-cols-6 gap-2">
              {filteredIcons.map(icon => (
                <button
                  key={icon}
                  onClick={() => {
                    updateOffer(showIconPicker, { ...offers[showIconPicker], "Icon": icon });
                    setShowIconPicker(null);
                    setSearchTerm('');
                  }}
                  className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-xs transition"
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
