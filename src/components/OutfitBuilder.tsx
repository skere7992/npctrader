import React, { useState, useRef, useEffect, Suspense } from 'react';
import * as THREE from 'three';
import { getItemIconUrl, getItemDisplayName } from '../types/config';
import { Search, User, Shirt, Shield, Eye, RotateCcw, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';

interface OutfitBuilderProps {
  customItems: Record<string, number>;
  onChange: (customItems: Record<string, number>) => void;
  className?: string;
}

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

// 3D Character Viewer Component
const Character3DViewer: React.FC<{ 
  items: Record<string, { shortname: string; skinId: number }>;
  className?: string;
}> = ({ items, className = "" }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const characterRef = useRef<THREE.Group>();
  const frameRef = useRef<number>();
  const controlsRef = useRef<{
    isMouseDown: boolean;
    mouseX: number;
    mouseY: number;
    rotationY: number;
    rotationX: number;
    zoom: number;
  }>({
    isMouseDown: false,
    mouseX: 0,
    mouseY: 0,
    rotationY: 0,
    rotationX: 0,
    zoom: 1
  });

  // Create basic character geometry
  const createCharacterModel = () => {
    const character = new THREE.Group();

    // Body parts with materials for different clothing slots
    const bodyGeometry = new THREE.BoxGeometry(0.8, 1.2, 0.4);
    const headGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const armGeometry = new THREE.BoxGeometry(0.25, 1, 0.25);
    const legGeometry = new THREE.BoxGeometry(0.3, 1, 0.3);

    // Create materials for different body parts
    const skinMaterial = new THREE.MeshLambertMaterial({ color: 0xffdbac });
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });

    // Head
    const head = new THREE.Mesh(headGeometry, skinMaterial);
    head.position.set(0, 1.85, 0);
    head.userData = { slot: 'helmet', originalMaterial: skinMaterial };
    character.add(head);

    // Body/Chest
    const chest = new THREE.Mesh(bodyGeometry, bodyMaterial);
    chest.position.set(0, 1, 0);
    chest.userData = { slot: 'chest', originalMaterial: bodyMaterial };
    character.add(chest);

    // Arms
    const leftArm = new THREE.Mesh(armGeometry, skinMaterial);
    leftArm.position.set(-0.6, 1, 0);
    leftArm.userData = { slot: 'hands', originalMaterial: skinMaterial };
    character.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, skinMaterial);
    rightArm.position.set(0.6, 1, 0);
    rightArm.userData = { slot: 'hands', originalMaterial: skinMaterial };
    character.add(rightArm);

    // Legs
    const leftLeg = new THREE.Mesh(legGeometry, skinMaterial);
    leftLeg.position.set(-0.2, 0, 0);
    leftLeg.userData = { slot: 'legs', originalMaterial: skinMaterial };
    character.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, skinMaterial);
    rightLeg.position.set(0.2, 0, 0);
    rightLeg.userData = { slot: 'legs', originalMaterial: skinMaterial };
    character.add(rightLeg);

    // Feet
    const leftFoot = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.15, 0.4), skinMaterial);
    leftFoot.position.set(-0.2, -0.6, 0.05);
    leftFoot.userData = { slot: 'feet', originalMaterial: skinMaterial };
    character.add(leftFoot);

    const rightFoot = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.15, 0.4), skinMaterial);
    rightFoot.position.set(0.2, -0.6, 0.05);
    rightFoot.userData = { slot: 'feet', originalMaterial: skinMaterial };
    character.add(rightFoot);

    return character;
  };

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x2a2a2a);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.set(0, 1.5, 4);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(300, 400);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const fillLight = new THREE.DirectionalLight(0x4080ff, 0.3);
    fillLight.position.set(-5, 5, -5);
    scene.add(fillLight);

    // Create character
    const character = createCharacterModel();
    character.position.set(0, -0.5, 0);
    characterRef.current = character;
    scene.add(character);

    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(10, 10);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.5;
    ground.receiveShadow = true;
    scene.add(ground);

    mountRef.current.appendChild(renderer.domElement);

    // Animation loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      
      if (characterRef.current) {
        characterRef.current.rotation.y = controlsRef.current.rotationY;
        characterRef.current.rotation.x = controlsRef.current.rotationX;
        
        // Apply zoom
        camera.position.z = 4 / controlsRef.current.zoom;
      }
      
      renderer.render(scene, camera);
    };
    animate();

    // Mouse controls
    const handleMouseDown = (e: MouseEvent) => {
      controlsRef.current.isMouseDown = true;
      controlsRef.current.mouseX = e.clientX;
      controlsRef.current.mouseY = e.clientY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!controlsRef.current.isMouseDown) return;
      
      const deltaX = e.clientX - controlsRef.current.mouseX;
      const deltaY = e.clientY - controlsRef.current.mouseY;
      
      controlsRef.current.rotationY += deltaX * 0.01;
      controlsRef.current.rotationX += deltaY * 0.01;
      
      // Clamp vertical rotation
      controlsRef.current.rotationX = Math.max(-0.5, Math.min(0.5, controlsRef.current.rotationX));
      
      controlsRef.current.mouseX = e.clientX;
      controlsRef.current.mouseY = e.clientY;
    };

    const handleMouseUp = () => {
      controlsRef.current.isMouseDown = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      controlsRef.current.zoom = Math.max(0.5, Math.min(3, controlsRef.current.zoom + e.deltaY * 0.001));
    };

    const canvas = renderer.domElement;
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('wheel', handleWheel);
      
      if (mountRef.current && renderer.domElement.parentNode) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      renderer.dispose();
    };
  }, []);

  // Update character appearance when items change
  useEffect(() => {
    if (!characterRef.current) return;

    characterRef.current.children.forEach((child) => {
      if (child instanceof THREE.Mesh && child.userData.slot) {
        const slot = child.userData.slot;
        const item = items[slot];
        
        if (item) {
          // Create material based on item and skin
          const itemColor = getItemColor(item.shortname, item.skinId);
          const material = new THREE.MeshLambertMaterial({ color: itemColor });
          child.material = material;
        } else {
          // Reset to original material
          child.material = child.userData.originalMaterial;
        }
      }
    });
  }, [items]);

  // Get color for item based on shortname and skin ID
  const getItemColor = (shortname: string, skinId: number): number => {
    // Color mapping for different items (simplified)
    const itemColors: Record<string, number> = {
      // Helmets
      'metal.facemask': 0x666666,
      'riot.helmet': 0x333333,
      'coffee.can.helmet': 0x8B4513,
      'bucket.helmet': 0x708090,
      'hat.cap': 0x4169E1,
      'hat.beenie': 0x8B4513,
      
      // Chest items
      'metal.plate.torso': 0x666666,
      'roadsign.jacket': 0xFF4500,
      'hoodie': 0x2F4F4F,
      'jacket': 0x8B4513,
      'tshirt': 0x87CEEB,
      'burlap.shirt': 0xDEB887,
      
      // Legs
      'roadsign.kilt': 0xFF4500,
      'pants': 0x2F4F4F,
      'pants.shorts': 0x4169E1,
      'burlap.trousers': 0xDEB887,
      
      // Feet
      'shoes.boots': 0x8B4513,
      'burlap.shoes': 0xDEB887,
      
      // Hands
      'roadsign.gloves': 0xFF4500,
      'burlap.gloves': 0xDEB887,
      'tactical.gloves': 0x333333,
    };

    let baseColor = itemColors[shortname] || 0x8B4513;
    
    // Apply skin color variation (simplified)
    if (skinId > 0) {
      // Modify color based on skin ID (this is a simplified approach)
      const hue = (skinId * 137.508) % 360; // Golden angle for color distribution
      const hsl = `hsl(${hue}, 70%, 50%)`;
      baseColor = new THREE.Color(hsl).getHex();
    }
    
    return baseColor;
  };

  const resetRotation = () => {
    controlsRef.current.rotationY = 0;
    controlsRef.current.rotationX = 0;
  };

  const resetZoom = () => {
    controlsRef.current.zoom = 1;
  };

  return (
    <div className={`bg-brand-charcoal/50 rounded-lg p-4 border border-brand-green/30 ${className}`}>
      <h4 className="text-sm font-medium text-brand-cream mb-3 flex items-center justify-between">
        <span className="flex items-center">
          <Eye className="w-4 h-4 mr-2" />
          3D Character Preview
        </span>
        <div className="flex gap-1">
          <button
            onClick={resetRotation}
            className="p-1 bg-brand-green/20 hover:bg-brand-green/40 rounded transition-colors"
            title="Reset Rotation"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
          <button
            onClick={resetZoom}
            className="p-1 bg-brand-green/20 hover:bg-brand-green/40 rounded transition-colors"
            title="Reset Zoom"
          >
            <ZoomOut className="w-3 h-3" />
          </button>
        </div>
      </h4>
      
      <div className="flex justify-center">
        <div 
          ref={mountRef} 
          className="border border-brand-green/50 rounded-lg overflow-hidden cursor-grab active:cursor-grabbing"
          style={{ width: '300px', height: '400px' }}
        />
      </div>
      
      <div className="mt-2 text-xs text-brand-grey text-center">
        🖱️ Drag to rotate • Scroll to zoom
      </div>
    </div>
  );
};

const OutfitPreview: React.FC<{ items: Record<string, { shortname: string; skinId: number }> }> = ({ items }) => {
  return (
    <div className="space-y-4">
      {/* 3D Character Viewer */}
      <Character3DViewer items={items} />
      
      {/* Traditional Grid Preview */}
      <div className="bg-brand-charcoal/50 rounded-lg p-4 border border-brand-green/30">
        <h4 className="text-sm font-medium text-brand-cream mb-3 flex items-center">
          <Eye className="w-4 h-4 mr-2" />
          Item Icons
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

  // Convert customItems to manageable format
  const outfitItems = Object.entries(customItems).reduce((acc, [shortname, skinId]) => {
    const slot = OUTFIT_SLOTS.find(s => s.items.includes(shortname));
    if (slot) {
      acc[slot.id] = { shortname, skinId };
    }
    return acc;
  }, {} as Record<string, { shortname: string; skinId: number }>);

  const updateOutfitItem = (slotId: string, shortname: string, skinId: number = 0) => {
    const newCustomItems = { ...customItems };
    
    // Remove previous item from slot if exists
    const existingItem = outfitItems[slotId];
    if (existingItem) {
      delete newCustomItems[existingItem.shortname];
    }
    
    // Add new item
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
    <div className={`space-y-6 ${className}`}>
      {/* Header with search */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-brand-cream flex items-center">
          <User className="w-5 h-5 mr-2" />
          Outfit Builder
        </h3>
        <button
          onClick={clearOutfit}
          className="px-3 py-1 bg-brand-rust-red hover:bg-red-700 rounded text-white text-sm transition-colors flex items-center"
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          Clear All
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Item Selection */}
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-grey w-4 h-4" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-brand-charcoal border border-brand-green/50 rounded text-brand-cream placeholder-brand-grey focus:border-brand-green focus:outline-none"
            />
          </div>

          {/* Slots */}
          <div className="space-y-3">
            {filteredSlots.map(slot => {
              const Icon = slot.icon;
              const currentItem = outfitItems[slot.id];
              
              return (
                <div key={slot.id} className="bg-brand-charcoal/30 rounded-lg p-4 border border-brand-green/20">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-brand-cream font-medium flex items-center">
                      <Icon className="w-4 h-4 mr-2" />
                      {slot.name}
                    </h4>
                    {currentItem && (
                      <button
                        onClick={() => removeOutfitItem(slot.id)}
                        className="text-brand-rust-red hover:text-red-400 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {currentItem ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-2 bg-brand-charcoal/50 rounded border border-brand-green/30">
                        <div className="w-12 h-12 bg-brand-charcoal border border-brand-green/50 rounded overflow-hidden">
                          <img
                            src={getItemIconUrl(currentItem.shortname)}
                            alt={getItemDisplayName(currentItem.shortname)}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="text-brand-cream font-medium">
                            {getItemDisplayName(currentItem.shortname)}
                          </div>
                          <div className="text-brand-grey text-sm font-mono">
                            {currentItem.shortname}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <label className="text-brand-grey text-sm">Skin ID:</label>
                        <input
                          type="number"
                          value={currentItem.skinId}
                          onChange={(e) => updateSkinId(currentItem.shortname, parseInt(e.target.value) || 0)}
                          className="w-24 px-2 py-1 bg-brand-charcoal border border-brand-green/50 rounded text-brand-cream text-sm"
                          placeholder="0"
                        />
                        <button
                          onClick={() => setSelectedSlot(selectedSlot === slot.id ? null : slot.id)}
                          className="px-2 py-1 bg-brand-orange hover:bg-orange-700 rounded text-white text-sm transition-colors"
                        >
                          Change Item
                        </button>
                      </div>
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

                  {/* Item selector dropdown */}
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
        </div>

        {/* Right: 3D Preview */}
        <div className="space-y-4">
          {Object.keys(outfitItems).length > 0 ? (
            <OutfitPreview items={outfitItems} />
          ) : (
            <div className="bg-brand-charcoal/50 rounded-lg p-8 border border-brand-green/30 text-center">
              <User className="w-16 h-16 mx-auto text-brand-grey/50 mb-4" />
              <div className="text-brand-grey">
                Add items to see your character preview
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
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
