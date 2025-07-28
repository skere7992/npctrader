import React, { useState } from 'react';
import { TradeOffer, RequiredItem, Reward } from '../types/config';
import { ItemSelector } from './ItemSelector';
import { IconSelector } from './IconSelector';
import { Plus, Trash2, Package, Gift, ChevronDown, ChevronRight, Eye, EyeOff } from 'lucide-react';

interface TradeOfferEditorProps {
  offer: TradeOffer;
  onChange: (offer: TradeOffer) => void;
  onDelete: () => void;
}

export const TradeOfferEditor: React.FC<TradeOfferEditorProps> = ({ offer, onChange, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateOffer = (updates: Partial<TradeOffer>) => {
    onChange({ ...offer, ...updates });
  };

  const addRequiredItem = () => {
    const newItem: RequiredItem = {
      "Item Shortname": "wood",
      "Amount": 100,
      "Skin ID": 0
    };
    updateOffer({
      "Required Items": [...offer["Required Items"], newItem]
    });
  };

  const updateRequiredItem = (index: number, updates: Partial<RequiredItem>) => {
    const items = [...offer["Required Items"]];
    items[index] = { ...items[index], ...updates };
    updateOffer({ "Required Items": items });
  };

  const removeRequiredItem = (index: number) => {
    const items = offer["Required Items"].filter((_, i) => i !== index);
    updateOffer({ "Required Items": items });
  };

  const addReward = () => {
    const newReward: Reward = {
      "Type": 0,
      "Value": "metal.fragments",
      "Amount": 50,
      "Skin ID": 0
    };
    updateOffer({
      "Rewards": [...offer.Rewards, newReward]
    });
  };

  const updateReward = (index: number, updates: Partial<Reward>) => {
    const rewards = [...offer.Rewards];
    rewards[index] = { ...rewards[index], ...updates };
    updateOffer({ "Rewards": rewards });
  };

  const removeReward = (index: number) => {
    const rewards = offer.Rewards.filter((_, i) => i !== index);
    updateOffer({ "Rewards": rewards });
  };

  // Función para obtener un resumen de los items requeridos
  const getRequiredItemsSummary = () => {
    if (offer["Required Items"].length === 0) return "No items required";
    if (offer["Required Items"].length === 1) {
      const item = offer["Required Items"][0];
      return `${item.Amount}x ${item["Item Shortname"]}`;
    }
    return `${offer["Required Items"].length} items required`;
  };

  // Función para obtener un resumen de las recompensas
  const getRewardsSummary = () => {
    if (offer.Rewards.length === 0) return "No rewards";
    if (offer.Rewards.length === 1) {
      const reward = offer.Rewards[0];
      const typeText = reward.Type === 0 ? "Item" : reward.Type === 1 ? "Command" : "Permission";
      return `${reward.Amount}x ${reward.Value} (${typeText})`;
    }
    return `${offer.Rewards.length} rewards`;
  };

  return (
    <div className="bg-brand-charcoal border border-brand-green rounded-lg overflow-hidden">
      {/* Header - Always visible and clickable */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-brand-charcoal/80 transition-colors border-b border-brand-green/30"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3 flex-1">
          {/* Expand/Collapse Icon */}
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-brand-green" />
          ) : (
            <ChevronRight className="w-5 h-5 text-brand-green" />
          )}
          
          {/* Trade Offer Info */}
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-bold text-brand-cream">{offer["Display Name"] || "Unnamed Trade"}</h3>
              <span className="text-xs text-brand-grey bg-brand-charcoal px-2 py-1 rounded font-mono">
                {offer.Icon || "no-icon"}
              </span>
            </div>
            
            {/* Summary - Only visible when collapsed */}
            {!isExpanded && (
              <div className="mt-2 flex flex-wrap gap-4 text-sm text-brand-grey">
                <span className="flex items-center">
                  <Package className="w-4 h-4 mr-1" />
                  {getRequiredItemsSummary()}
                </span>
                <span className="flex items-center">
                  <Gift className="w-4 h-4 mr-1" />
                  {getRewardsSummary()}
                </span>
                {offer["Permission Required"] && (
                  <span className="text-brand-orange text-xs">Requires permission</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-2 text-brand-green hover:bg-brand-green/20 rounded transition-colors"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-2 text-brand-rust-red hover:bg-brand-rust-red/20 rounded transition-colors"
            title="Delete Trade Offer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-6 space-y-6">
          {/* Basic Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brand-cream mb-2">Display Name</label>
              <input
                type="text"
                value={offer["Display Name"]}
                onChange={(e) => updateOffer({ "Display Name": e.target.value })}
                className="w-full px-3 py-2 bg-brand-charcoal border border-brand-green rounded text-brand-cream focus:outline-none focus:ring-2 focus:ring-brand-green"
                placeholder="Enter display name..."
              />
            </div>

            <div>
              <IconSelector
                value={offer.Icon}
                onChange={(value) => updateOffer({ "Icon": value })}
                label="Icon"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-brand-cream mb-2">Permission Required</label>
              <input
                type="text"
                value={offer["Permission Required"]}
                onChange={(e) => updateOffer({ "Permission Required": e.target.value })}
                className="w-full px-3 py-2 bg-brand-charcoal border border-brand-green rounded text-brand-cream focus:outline-none focus:ring-2 focus:ring-brand-green"
                placeholder="Leave empty for no permission requirement"
              />
            </div>
          </div>

          {/* Required Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-brand-cream flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Required Items ({offer["Required Items"].length})
              </h4>
              <button
                onClick={addRequiredItem}
                className="px-3 py-1 bg-brand-orange hover:bg-orange-700 rounded text-white text-sm transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Item
              </button>
            </div>

            <div className="space-y-3">
              {offer["Required Items"].map((item, index) => (
                <div key={index} className="bg-brand-charcoal/50 p-4 rounded border border-brand-green/30">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <ItemSelector
                        value={item["Item Shortname"]}
                        onChange={(value) => updateRequiredItem(index, { "Item Shortname": value })}
                        label="Item"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-brand-grey mb-1">Amount</label>
                      <input
                        type="number"
                        min="1"
                        value={item.Amount}
                        onChange={(e) => updateRequiredItem(index, { "Amount": Math.max(1, parseInt(e.target.value) || 1) })}
                        className="w-full px-2 py-1 bg-brand-charcoal border border-brand-green rounded text-brand-cream text-sm focus:outline-none focus:ring-1 focus:ring-brand-green"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-brand-grey mb-1">Skin ID</label>
                      <input
                        type="number"
                        min="0"
                        value={item["Skin ID"]}
                        onChange={(e) => updateRequiredItem(index, { "Skin ID": Math.max(0, parseInt(e.target.value) || 0) })}
                        className="w-full px-2 py-1 bg-brand-charcoal border border-brand-green rounded text-brand-cream text-sm focus:outline-none focus:ring-1 focus:ring-brand-green"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={() => removeRequiredItem(index)}
                        className="w-full px-2 py-1 bg-brand-rust-red hover:bg-red-700 rounded text-white text-sm transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4 mx-auto" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {offer["Required Items"].length === 0 && (
                <div className="text-center py-8 text-brand-grey">
                  <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No required items yet. Click "Add Item" to add some.</p>
                </div>
              )}
            </div>
          </div>

          {/* Rewards */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-brand-cream flex items-center">
                <Gift className="w-5 h-5 mr-2" />
                Rewards ({offer.Rewards.length})
              </h4>
              <button
                onClick={addReward}
                className="px-3 py-1 bg-brand-green hover:bg-green-700 rounded text-white text-sm transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Reward
              </button>
            </div>

            <div className="space-y-3">
              {offer.Rewards.map((reward, index) => (
                <div key={index} className="bg-brand-charcoal/50 p-4 rounded border border-brand-green/30">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    <div>
                      <label className="block text-xs text-brand-grey mb-1">Type</label>
                      <select
                        value={reward.Type}
                        onChange={(e) => updateReward(index, { "Type": parseInt(e.target.value) })}
                        className="w-full px-2 py-1 bg-brand-charcoal border border-brand-green rounded text-brand-cream text-sm focus:outline-none focus:ring-1 focus:ring-brand-green"
                      >
                        <option value={0}>Item</option>
                        <option value={1}>Command</option>
                        <option value={2}>Permission</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-brand-grey mb-1">Value</label>
                      {reward.Type === 0 ? (
                        <ItemSelector
                          value={reward.Value}
                          onChange={(value) => updateReward(index, { "Value": value })}
                          label=""
                          className="w-full"
                        />
                      ) : (
                        <input
                          type="text"
                          value={reward.Value}
                          onChange={(e) => updateReward(index, { "Value": e.target.value })}
                          className="w-full px-2 py-1 bg-brand-charcoal border border-brand-green rounded text-brand-cream text-sm focus:outline-none focus:ring-1 focus:ring-brand-green"
                          placeholder={reward.Type === 1 ? "console command" : "permission"}
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-xs text-brand-grey mb-1">Amount</label>
                      <input
                        type="number"
                        min="1"
                        value={reward.Amount}
                        onChange={(e) => updateReward(index, { "Amount": Math.max(1, parseInt(e.target.value) || 1) })}
                        className="w-full px-2 py-1 bg-brand-charcoal border border-brand-green rounded text-brand-cream text-sm focus:outline-none focus:ring-1 focus:ring-brand-green"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-brand-grey mb-1">Skin ID</label>
                      <input
                        type="number"
                        min="0"
                        value={reward["Skin ID"]}
                        onChange={(e) => updateReward(index, { "Skin ID": Math.max(0, parseInt(e.target.value) || 0) })}
                        className="w-full px-2 py-1 bg-brand-charcoal border border-brand-green rounded text-brand-cream text-sm focus:outline-none focus:ring-1 focus:ring-brand-green"
                        disabled={reward.Type !== 0}
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={() => removeReward(index)}
                        className="w-full px-2 py-1 bg-brand-rust-red hover:bg-red-700 rounded text-white text-sm transition-colors"
                        title="Remove reward"
                      >
                        <Trash2 className="w-4 h-4 mx-auto" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {offer.Rewards.length === 0 && (
                <div className="text-center py-8 text-brand-grey">
                  <Gift className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No rewards yet. Click "Add Reward" to add some.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
