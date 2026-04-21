export type MaterialCategory = 'fabric' | 'foam' | 'laminate' | 'fastener' | 'thread' | 'accessory' | 'packaging' | 'other';
export type FabricType = 'woven' | 'knit' | 'non-woven' | 'leather' | 'synthetic-leather' | 'canvas' | 'mesh';
export type FiberType = 'polyester' | 'nylon' | 'cotton' | 'wool' | 'acrylic' | 'spandex' | 'leather' | 'blend';
export type FinishType = 'waterproof' | 'water-resistant' | 'flame-retardant' | 'anti-bacterial' | 'uv-resistant' | 'breathable' | 'none';
export type FoamType = 'PU' | 'open-cell' | 'closed-cell' | 'memory-foam' | 'EVA' | 'latex';
export type FastenerType = 'zipper' | 'j-clip' | 'snap-button' | 'velcro' | 'buckle' | 'elastic-cord';

export interface FabricSpecification {
  fabricType: FabricType;
  gsm: number; // grams per square meter
  width: number; // in cm
  widthUnit: 'cm' | 'inch';
  fiberComposition: {
    fiber: FiberType;
    percentage: number;
  }[];
  finish: FinishType[];
  color: string;
  patternDesign?: string;
  stretch?: boolean;
  stretchPercentage?: number;
  isLaminated: boolean;
  laminationDetails?: {
    laminateType: 'PU-foam' | 'open-cell-foam' | 'closed-cell-foam' | 'TPU' | 'other';
    thickness: number; // in mm
    density?: number; // kg/m³
    bondingMethod: 'adhesive' | 'heat-bond' | 'flame-lamination';
  };
}

export interface FoamSpecification {
  foamType: FoamType;
  density: number; // kg/m³
  thickness: number; // in mm
  hardness?: number; // Shore A
  color: string;
  isFireRetardant: boolean;
  compression?: number; // percentage
}

export interface FastenerSpecification {
  fastenerType: FastenerType;
  size: string; // e.g., "#5", "10mm", "Small"
  material: string; // e.g., "Metal", "Plastic", "Nylon"
  color: string;
  finish?: string; // e.g., "Nickel-plated", "Brass", "Matte"
  strength?: string; // e.g., "Heavy-duty", "Standard"
}

export interface ThreadSpecification {
  threadType: 'polyester' | 'nylon' | 'cotton' | 'bonded-nylon';
  weight: string; // e.g., "T-70", "T-90", "40/2"
  color: string;
  strength: number; // in N (Newtons)
  uvResistant: boolean;
}

export interface PackagingSpecification {
  packagingType: 'poly-bag' | 'box' | 'carton' | 'hang-tag' | 'label' | 'insert';
  material: string;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: 'cm' | 'inch';
  };
  printDetails?: string;
  recyclable: boolean;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: MaterialCategory;
  
  // Common fields
  supplier: string;
  supplierSKU?: string;
  currentStock: number;
  unit: string;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  leadTimeDays: number;
  costPerUnit: number;
  currency: string;
  lastPurchaseDate?: string;
  lastPurchasePrice?: number;
  
  // Category-specific specifications
  fabricSpec?: FabricSpecification;
  foamSpec?: FoamSpecification;
  fastenerSpec?: FastenerSpecification;
  threadSpec?: ThreadSpecification;
  packagingSpec?: PackagingSpecification;
  
  // Additional details
  location?: string; // Warehouse location
  batchNumber?: string;
  expiryDate?: string; // For adhesives, etc.
  certifications?: string[]; // e.g., "OEKO-TEX", "ISO-9001"
  notes?: string;
  imageUrl?: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'discontinued';
}

export const inventoryItems: InventoryItem[] = [
  {
    id: 'INV-001',
    name: 'Premium Automotive Leather - Black',
    sku: 'FAB-LEATH-BLK-001',
    category: 'fabric',
    supplier: 'Premium Textiles Ltd',
    supplierSKU: 'PTL-AUTO-BLK-150',
    currentStock: 450,
    unit: 'sqm',
    minStock: 200,
    maxStock: 800,
    reorderPoint: 250,
    leadTimeDays: 21,
    costPerUnit: 45.50,
    currency: 'USD',
    lastPurchaseDate: '2026-03-25',
    lastPurchasePrice: 44.80,
    location: 'Warehouse A - Rack 12',
    certifications: ['ISO-9001', 'REACH-Compliant'],
    status: 'in-stock',
    fabricSpec: {
      fabricType: 'leather',
      gsm: 850,
      width: 140,
      widthUnit: 'cm',
      fiberComposition: [
        { fiber: 'leather', percentage: 100 }
      ],
      finish: ['waterproof', 'uv-resistant'],
      color: 'Black',
      stretch: false,
      isLaminated: false,
    }
  },
  {
    id: 'INV-002',
    name: 'Sport Mesh Fabric - Gray',
    sku: 'FAB-MESH-GRY-002',
    category: 'fabric',
    supplier: 'TechFabric Solutions',
    supplierSKU: 'TFS-MESH-380-GRY',
    currentStock: 680,
    unit: 'sqm',
    minStock: 300,
    maxStock: 1000,
    reorderPoint: 350,
    leadTimeDays: 14,
    costPerUnit: 28.75,
    currency: 'USD',
    lastPurchaseDate: '2026-04-01',
    location: 'Warehouse A - Rack 8',
    certifications: ['OEKO-TEX Standard 100'],
    status: 'in-stock',
    fabricSpec: {
      fabricType: 'mesh',
      gsm: 380,
      width: 150,
      widthUnit: 'cm',
      fiberComposition: [
        { fiber: 'polyester', percentage: 85 },
        { fiber: 'spandex', percentage: 15 }
      ],
      finish: ['breathable', 'anti-bacterial'],
      color: 'Charcoal Gray',
      stretch: true,
      stretchPercentage: 20,
      isLaminated: true,
      laminationDetails: {
        laminateType: 'PU-foam',
        thickness: 3,
        density: 35,
        bondingMethod: 'flame-lamination'
      }
    }
  },
  {
    id: 'INV-003',
    name: 'Heavy Duty Canvas - Natural',
    sku: 'FAB-CANV-NAT-003',
    category: 'fabric',
    supplier: 'Industrial Fabrics Co',
    supplierSKU: 'IFC-HDC-600-NAT',
    currentStock: 325,
    unit: 'sqm',
    minStock: 150,
    maxStock: 600,
    reorderPoint: 200,
    leadTimeDays: 18,
    costPerUnit: 22.00,
    currency: 'USD',
    location: 'Warehouse B - Rack 3',
    certifications: ['ISO-9001'],
    status: 'in-stock',
    fabricSpec: {
      fabricType: 'canvas',
      gsm: 600,
      width: 160,
      widthUnit: 'cm',
      fiberComposition: [
        { fiber: 'cotton', percentage: 100 }
      ],
      finish: ['water-resistant', 'flame-retardant'],
      color: 'Natural Beige',
      stretch: false,
      isLaminated: false,
    }
  },
  {
    id: 'INV-004',
    name: 'Airbag-Safe Fabric - Certified',
    sku: 'FAB-AIR-CRT-004',
    category: 'fabric',
    supplier: 'SafetyTech Textiles',
    supplierSKU: 'STT-AIRBAG-450',
    currentStock: 180,
    unit: 'sqm',
    minStock: 100,
    maxStock: 400,
    reorderPoint: 120,
    leadTimeDays: 28,
    costPerUnit: 65.00,
    currency: 'USD',
    location: 'Warehouse A - Rack 1 (Certified)',
    certifications: ['Airbag-Certified', 'ISO-9001', 'FMVSS-302'],
    status: 'in-stock',
    notes: 'Requires special handling - airbag deployment certified. Use only breakaway stitching.',
    fabricSpec: {
      fabricType: 'synthetic-leather',
      gsm: 450,
      width: 140,
      widthUnit: 'cm',
      fiberComposition: [
        { fiber: 'polyester', percentage: 100 }
      ],
      finish: ['flame-retardant', 'anti-bacterial'],
      color: 'Multiple (specify in order)',
      stretch: true,
      stretchPercentage: 10,
      isLaminated: false,
    }
  },
  {
    id: 'INV-005',
    name: 'Heavy Duty Thread - Black',
    sku: 'THR-HD-BLK-005',
    category: 'thread',
    supplier: 'Thread Masters Inc',
    supplierSKU: 'TMI-T90-BLK',
    currentStock: 450,
    unit: 'spools',
    minStock: 200,
    maxStock: 800,
    reorderPoint: 250,
    leadTimeDays: 10,
    costPerUnit: 8.50,
    currency: 'USD',
    location: 'Warehouse C - Thread Storage',
    status: 'in-stock',
    threadSpec: {
      threadType: 'bonded-nylon',
      weight: 'T-90',
      color: 'Black',
      strength: 90,
      uvResistant: true,
    }
  },
  {
    id: 'INV-006',
    name: 'PU Open Cell Foam - 5mm',
    sku: 'FOAM-PU-5MM-006',
    category: 'foam',
    supplier: 'Foam Solutions Ltd',
    supplierSKU: 'FSL-PU-OC-5-35',
    currentStock: 850,
    unit: 'sqm',
    minStock: 400,
    maxStock: 1200,
    reorderPoint: 500,
    leadTimeDays: 14,
    costPerUnit: 12.50,
    currency: 'USD',
    location: 'Warehouse B - Foam Section',
    certifications: ['ISO-9001', 'CA-117'],
    status: 'in-stock',
    foamSpec: {
      foamType: 'PU',
      density: 35,
      thickness: 5,
      hardness: 45,
      color: 'Natural White',
      isFireRetardant: true,
      compression: 25,
    }
  },
  {
    id: 'INV-007',
    name: 'Memory Foam - 10mm High Density',
    sku: 'FOAM-MEM-10MM-007',
    category: 'foam',
    supplier: 'ComfortFoam International',
    supplierSKU: 'CFI-MEM-10-60',
    currentStock: 420,
    unit: 'sqm',
    minStock: 200,
    maxStock: 700,
    reorderPoint: 250,
    leadTimeDays: 21,
    costPerUnit: 28.00,
    currency: 'USD',
    location: 'Warehouse B - Foam Section',
    certifications: ['CertiPUR-US', 'ISO-9001'],
    status: 'in-stock',
    foamSpec: {
      foamType: 'memory-foam',
      density: 60,
      thickness: 10,
      hardness: 35,
      color: 'Natural White',
      isFireRetardant: true,
      compression: 15,
    }
  },
  {
    id: 'INV-008',
    name: 'Heating Elements - UL Certified',
    sku: 'ACC-HEAT-UL-008',
    category: 'accessory',
    supplier: 'AutoHeat Technologies',
    supplierSKU: 'AHT-HEAT-PAD-12V',
    currentStock: 145,
    unit: 'pcs',
    minStock: 80,
    maxStock: 300,
    reorderPoint: 100,
    leadTimeDays: 35,
    costPerUnit: 35.00,
    currency: 'USD',
    location: 'Warehouse C - Electronics',
    certifications: ['UL-Certified', 'CE-Mark'],
    status: 'in-stock',
    notes: 'Requires certified electrician for installation. 12V DC, max 45W per pad.',
  },
  {
    id: 'INV-009',
    name: 'Elastic Bands - 25mm Wide',
    sku: 'ACC-ELAS-25MM-009',
    category: 'accessory',
    supplier: 'Elastic Solutions',
    supplierSKU: 'ES-ELAS-25-BLK',
    currentStock: 2400,
    unit: 'meters',
    minStock: 1000,
    maxStock: 4000,
    reorderPoint: 1200,
    leadTimeDays: 7,
    costPerUnit: 1.25,
    currency: 'USD',
    location: 'Warehouse C - Accessories',
    status: 'in-stock',
  },
  {
    id: 'INV-010',
    name: 'Metal Zipper #5 - Black',
    sku: 'ZIP-MET-5-BLK-010',
    category: 'fastener',
    supplier: 'Zipper World',
    supplierSKU: 'ZW-MET-5-BLK-AUTO',
    currentStock: 850,
    unit: 'pcs',
    minStock: 400,
    maxStock: 1500,
    reorderPoint: 500,
    leadTimeDays: 12,
    costPerUnit: 2.80,
    currency: 'USD',
    location: 'Warehouse C - Fasteners',
    status: 'in-stock',
    fastenerSpec: {
      fastenerType: 'zipper',
      size: '#5',
      material: 'Metal',
      color: 'Black',
      finish: 'Nickel-plated',
      strength: 'Heavy-duty',
    }
  },
  {
    id: 'INV-011',
    name: 'J-Clips Stainless Steel - Large',
    sku: 'CLIP-J-SS-L-011',
    category: 'fastener',
    supplier: 'Fastener Pro',
    supplierSKU: 'FP-JCLIP-SS-25',
    currentStock: 5600,
    unit: 'pcs',
    minStock: 2000,
    maxStock: 10000,
    reorderPoint: 2500,
    leadTimeDays: 10,
    costPerUnit: 0.45,
    currency: 'USD',
    location: 'Warehouse C - Fasteners',
    status: 'in-stock',
    fastenerSpec: {
      fastenerType: 'j-clip',
      size: '25mm',
      material: 'Stainless Steel',
      color: 'Silver',
      finish: 'Polished',
      strength: 'Heavy-duty',
    }
  },
  {
    id: 'INV-012',
    name: 'Poly Bag - Large (50x60cm)',
    sku: 'PKG-POLY-L-012',
    category: 'packaging',
    supplier: 'PackRight Solutions',
    supplierSKU: 'PRS-POLY-50X60',
    currentStock: 3200,
    unit: 'pcs',
    minStock: 1500,
    maxStock: 6000,
    reorderPoint: 2000,
    leadTimeDays: 7,
    costPerUnit: 0.35,
    currency: 'USD',
    location: 'Warehouse D - Packaging',
    status: 'in-stock',
    packagingSpec: {
      packagingType: 'poly-bag',
      material: 'LDPE',
      dimensions: {
        length: 60,
        width: 50,
        height: 0.05,
        unit: 'cm'
      },
      recyclable: true,
    }
  },
  {
    id: 'INV-013',
    name: 'Waterproof Coated Nylon - Navy',
    sku: 'FAB-NYL-NVY-013',
    category: 'fabric',
    supplier: 'OutdoorFabric Specialists',
    supplierSKU: 'OFS-WP-NYL-420-NVY',
    currentStock: 280,
    unit: 'sqm',
    minStock: 150,
    maxStock: 500,
    reorderPoint: 180,
    leadTimeDays: 16,
    costPerUnit: 18.50,
    currency: 'USD',
    location: 'Warehouse A - Rack 15',
    certifications: ['OEKO-TEX Standard 100'],
    status: 'in-stock',
    notes: 'Perfect for tent production - 3000mm waterproof rating',
    fabricSpec: {
      fabricType: 'woven',
      gsm: 420,
      width: 150,
      widthUnit: 'cm',
      fiberComposition: [
        { fiber: 'nylon', percentage: 100 }
      ],
      finish: ['waterproof', 'uv-resistant'],
      color: 'Navy Blue',
      stretch: false,
      isLaminated: true,
      laminationDetails: {
        laminateType: 'TPU',
        thickness: 0.5,
        bondingMethod: 'heat-bond'
      }
    }
  },
  {
    id: 'INV-014',
    name: 'Cotton Twill - Khaki',
    sku: 'FAB-COT-KHK-014',
    category: 'fabric',
    supplier: 'Natural Textiles Co',
    supplierSKU: 'NTC-TWILL-340-KHK',
    currentStock: 520,
    unit: 'sqm',
    minStock: 250,
    maxStock: 800,
    reorderPoint: 300,
    leadTimeDays: 12,
    costPerUnit: 14.20,
    currency: 'USD',
    location: 'Warehouse A - Rack 10',
    certifications: ['GOTS-Certified', 'OEKO-TEX'],
    status: 'in-stock',
    notes: 'Organic cotton - ideal for garments',
    fabricSpec: {
      fabricType: 'woven',
      gsm: 340,
      width: 145,
      widthUnit: 'cm',
      fiberComposition: [
        { fiber: 'cotton', percentage: 100 }
      ],
      finish: ['none'],
      color: 'Khaki',
      stretch: false,
      isLaminated: false,
    }
  },
  {
    id: 'INV-015',
    name: 'YKK Coil Zipper #8 - Olive',
    sku: 'ZIP-COIL-8-OLV-015',
    category: 'fastener',
    supplier: 'YKK Direct',
    supplierSKU: 'YKK-COIL-8-OLV-60CM',
    currentStock: 620,
    unit: 'pcs',
    minStock: 300,
    maxStock: 1000,
    reorderPoint: 350,
    leadTimeDays: 14,
    costPerUnit: 3.50,
    currency: 'USD',
    location: 'Warehouse C - Fasteners',
    status: 'in-stock',
    notes: '60cm length - for tent doors and garment applications',
    fastenerSpec: {
      fastenerType: 'zipper',
      size: '#8',
      material: 'Nylon Coil',
      color: 'Olive Green',
      finish: 'Matte',
      strength: 'Heavy-duty',
    }
  },
];

export const departments = [
  { id: 'cnc-cutting', name: 'CNC Cutting', icon: 'Scissors' },
  { id: 'sewing-1', name: 'Sewing Dept 1', icon: 'Shirt' },
  { id: 'sewing-2', name: 'Sewing Dept 2', icon: 'Shirt' },
  { id: 'sewing-3', name: 'Sewing Dept 3', icon: 'Shirt' },
  { id: 'sewing-4', name: 'Sewing Dept 4', icon: 'Shirt' },
  { id: 'airbag', name: 'Airbag Section', icon: 'Shield' },
  { id: 'embroidery', name: 'Embroidery', icon: 'Sparkles' },
  { id: 'qc', name: 'Quality Control', icon: 'ClipboardCheck' },
  { id: 'packing', name: 'Packing', icon: 'Package' },
];

// Manufacturing Orders
export interface ManufacturingOrder {
  id: string;
  product: string;
  quantity: number;
  department: string;
  status: 'planned' | 'in-progress' | 'completed' | 'delayed' | 'on-hold';
  priority: 'low' | 'medium' | 'high';
  startDate: string;
  endDate: string;
  completion: number;
  materials: {
    id: string;
    name: string;
    required: number;
    available: number;
    unit: string;
    status: 'sufficient' | 'shortage' | 'ordered';
  }[];
}

export const manufacturingOrders: ManufacturingOrder[] = [
  {
    id: 'MO-2026-001',
    product: 'Premium Leather Sedan Seat Covers',
    quantity: 200,
    department: 'cnc-cutting',
    status: 'in-progress',
    priority: 'high',
    startDate: '2026-04-07',
    endDate: '2026-04-10',
    completion: 75,
    materials: [
      { id: 'MAT-001', name: 'Premium Leather Black', required: 400, available: 400, unit: 'sqm', status: 'sufficient' },
      { id: 'MAT-002', name: 'Cutting Blades', required: 10, available: 8, unit: 'pcs', status: 'shortage' },
      { id: 'MAT-003', name: 'Pattern Templates', required: 5, available: 5, unit: 'sets', status: 'sufficient' },
    ],
  },
  {
    id: 'MO-2026-002',
    product: 'SUV Sport Seat Cover Set',
    quantity: 150,
    department: 'sewing-1',
    status: 'in-progress',
    priority: 'high',
    startDate: '2026-04-08',
    endDate: '2026-04-15',
    completion: 45,
    materials: [
      { id: 'MAT-004', name: 'Sport Fabric Gray', required: 300, available: 300, unit: 'sqm', status: 'sufficient' },
      { id: 'MAT-005', name: 'Heavy Duty Thread', required: 50, available: 45, unit: 'spools', status: 'shortage' },
      { id: 'MAT-006', name: 'Elastic Bands', required: 600, available: 600, unit: 'meters', status: 'sufficient' },
    ],
  },
  {
    id: 'MO-2026-003',
    product: 'Truck Bench Seat Covers',
    quantity: 120,
    department: 'sewing-2',
    status: 'planned',
    priority: 'medium',
    startDate: '2026-04-12',
    endDate: '2026-04-18',
    completion: 0,
    materials: [
      { id: 'MAT-007', name: 'Heavy Duty Canvas', required: 240, available: 180, unit: 'sqm', status: 'ordered' },
      { id: 'MAT-008', name: 'Reinforced Thread', required: 30, available: 35, unit: 'spools', status: 'sufficient' },
      { id: 'MAT-009', name: 'Velcro Strips', required: 480, available: 500, unit: 'meters', status: 'sufficient' },
    ],
  },
  {
    id: 'MO-2026-004',
    product: 'Luxury Sedan Covers with Heating',
    quantity: 100,
    department: 'sewing-3',
    status: 'in-progress',
    priority: 'high',
    startDate: '2026-04-09',
    endDate: '2026-04-16',
    completion: 60,
    materials: [
      { id: 'MAT-010', name: 'Heated Fabric Beige', required: 200, available: 200, unit: 'sqm', status: 'sufficient' },
      { id: 'MAT-011', name: 'Heating Elements', required: 200, available: 180, unit: 'pcs', status: 'shortage' },
      { id: 'MAT-012', name: 'Wiring Harness', required: 100, available: 100, unit: 'sets', status: 'sufficient' },
    ],
  },
  {
    id: 'MO-2026-005',
    product: 'Economy Sedan Seat Covers',
    quantity: 300,
    department: 'sewing-4',
    status: 'planned',
    priority: 'low',
    startDate: '2026-04-14',
    endDate: '2026-04-20',
    completion: 0,
    materials: [
      { id: 'MAT-013', name: 'Polyester Fabric Black', required: 500, available: 500, unit: 'sqm', status: 'sufficient' },
      { id: 'MAT-014', name: 'Standard Thread', required: 40, available: 40, unit: 'spools', status: 'sufficient' },
      { id: 'MAT-015', name: 'Elastic Cord', required: 600, available: 550, unit: 'meters', status: 'shortage' },
    ],
  },
  {
    id: 'MO-2026-006',
    product: 'Airbag Compatible SUV Covers',
    quantity: 180,
    department: 'airbag',
    status: 'in-progress',
    priority: 'high',
    startDate: '2026-04-07',
    endDate: '2026-04-13',
    completion: 55,
    materials: [
      { id: 'MAT-016', name: 'Airbag-Safe Fabric', required: 360, available: 360, unit: 'sqm', status: 'sufficient' },
      { id: 'MAT-017', name: 'Breakaway Stitching', required: 180, available: 180, unit: 'sets', status: 'sufficient' },
      { id: 'MAT-018', name: 'Safety Labels', required: 180, available: 150, unit: 'pcs', status: 'ordered' },
    ],
  },
  {
    id: 'MO-2026-007',
    product: 'Custom Logo Embroidered Covers',
    quantity: 80,
    department: 'embroidery',
    status: 'in-progress',
    priority: 'medium',
    startDate: '2026-04-10',
    endDate: '2026-04-14',
    completion: 30,
    materials: [
      { id: 'MAT-019', name: 'Premium Fabric Navy', required: 160, available: 160, unit: 'sqm', status: 'sufficient' },
      { id: 'MAT-020', name: 'Embroidery Thread Multi', required: 80, available: 70, unit: 'spools', status: 'shortage' },
      { id: 'MAT-021', name: 'Stabilizer Backing', required: 80, available: 100, unit: 'sheets', status: 'sufficient' },
    ],
  },
  {
    id: 'MO-2026-008',
    product: 'Sports Car Seat Cover QC Batch',
    quantity: 250,
    department: 'qc',
    status: 'delayed',
    priority: 'high',
    startDate: '2026-04-06',
    endDate: '2026-04-11',
    completion: 40,
    materials: [
      { id: 'MAT-022', name: 'QC Checklist Forms', required: 250, available: 250, unit: 'pcs', status: 'sufficient' },
      { id: 'MAT-023', name: 'Testing Equipment', required: 5, available: 4, unit: 'sets', status: 'shortage' },
      { id: 'MAT-024', name: 'Defect Tags', required: 50, available: 50, unit: 'pcs', status: 'sufficient' },
    ],
  },
  {
    id: 'MO-2026-009',
    product: 'Minivan Full Set Packaging',
    quantity: 160,
    department: 'packing',
    status: 'planned',
    priority: 'medium',
    startDate: '2026-04-15',
    endDate: '2026-04-18',
    completion: 0,
    materials: [
      { id: 'MAT-025', name: 'Retail Boxes Large', required: 160, available: 160, unit: 'pcs', status: 'sufficient' },
      { id: 'MAT-026', name: 'Instruction Manuals', required: 160, available: 140, unit: 'pcs', status: 'shortage' },
      { id: 'MAT-027', name: 'Plastic Bags', required: 160, available: 200, unit: 'pcs', status: 'sufficient' },
    ],
  },
  {
    id: 'MO-2026-010',
    product: 'Premium Leather Cutting - Batch 2',
    quantity: 220,
    department: 'cnc-cutting',
    status: 'planned',
    priority: 'medium',
    startDate: '2026-04-11',
    endDate: '2026-04-14',
    completion: 0,
    materials: [
      { id: 'MAT-028', name: 'Premium Leather Brown', required: 440, available: 440, unit: 'sqm', status: 'sufficient' },
      { id: 'MAT-029', name: 'CNC Blade Set', required: 8, available: 10, unit: 'sets', status: 'sufficient' },
    ],
  },
  {
    id: 'MO-2026-011',
    product: 'Racing Stripe Embroidery',
    quantity: 60,
    department: 'embroidery',
    status: 'planned',
    priority: 'low',
    startDate: '2026-04-16',
    endDate: '2026-04-19',
    completion: 0,
    materials: [
      { id: 'MAT-030', name: 'Racing Fabric Red', required: 120, available: 100, unit: 'sqm', status: 'ordered' },
      { id: 'MAT-031', name: 'Metallic Thread', required: 30, available: 30, unit: 'spools', status: 'sufficient' },
    ],
  },
  {
    id: 'MO-2026-012',
    product: 'Airbag Safety Testing Batch',
    quantity: 140,
    department: 'airbag',
    status: 'planned',
    priority: 'high',
    startDate: '2026-04-14',
    endDate: '2026-04-19',
    completion: 0,
    materials: [
      { id: 'MAT-032', name: 'Safety Certified Fabric', required: 280, available: 280, unit: 'sqm', status: 'sufficient' },
      { id: 'MAT-033', name: 'Certification Tags', required: 140, available: 140, unit: 'pcs', status: 'sufficient' },
    ],
  },
];

export const capacityData = [
  { department: 'CNC Cutting', planned: 90, actual: 85, capacity: 100 },
  { department: 'Sewing 1', planned: 88, actual: 78, capacity: 100 },
  { department: 'Sewing 2', planned: 75, actual: 72, capacity: 100 },
  { department: 'Sewing 3', planned: 82, actual: 80, capacity: 100 },
  { department: 'Sewing 4', planned: 65, actual: 60, capacity: 100 },
  { department: 'Airbag', planned: 92, actual: 85, capacity: 100 },
  { department: 'Embroidery', planned: 70, actual: 55, capacity: 100 },
  { department: 'QC', planned: 85, actual: 70, capacity: 100 },
  { department: 'Packing', planned: 60, actual: 58, capacity: 100 },
];

// Finished Products Inventory
export interface FinishedProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  vehicleType: string;
  currentStock: number;
  unit: string;
  minStock: number;
  maxStock: number;
  productionCost: number;
  retailPrice: number;
  lastProduced: string;
  totalProduced: number;
  totalSold: number;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'discontinued';
  bomId?: string; // Link to BOM
  description?: string;
  leadTimeDays?: number;
}

export const finishedProducts: FinishedProduct[] = [
  {
    id: 'FP-001',
    name: 'Premium Leather Sedan Seat Covers - Black',
    sku: 'PLSC-BLK-001',
    category: 'Premium Leather',
    vehicleType: 'Sedan',
    currentStock: 145,
    unit: 'sets',
    minStock: 50,
    maxStock: 300,
    productionCost: 285.50,
    retailPrice: 499.99,
    lastProduced: '2026-04-08',
    totalProduced: 1250,
    totalSold: 1105,
    status: 'in-stock',
    bomId: 'BOM-001',
    description: 'High-quality leather seat covers for premium sedans.',
    leadTimeDays: 10,
  },
  {
    id: 'FP-002',
    name: 'Sports Fabric SUV Seat Covers - Gray',
    sku: 'SFSC-GRY-002',
    category: 'Sport Fabric',
    vehicleType: 'SUV',
    currentStock: 89,
    unit: 'sets',
    minStock: 60,
    maxStock: 250,
    productionCost: 198.75,
    retailPrice: 349.99,
    lastProduced: '2026-04-07',
    totalProduced: 980,
    totalSold: 891,
    status: 'in-stock',
    bomId: 'BOM-002',
    description: 'Sporty and durable seat covers for SUVs.',
    leadTimeDays: 14,
  },
  {
    id: 'FP-003',
    name: 'Heavy Duty Truck Seat Covers - Canvas',
    sku: 'HDSC-CNV-003',
    category: 'Heavy Duty',
    vehicleType: 'Truck',
    currentStock: 32,
    unit: 'sets',
    minStock: 40,
    maxStock: 200,
    productionCost: 175.00,
    retailPrice: 299.99,
    lastProduced: '2026-04-05',
    totalProduced: 580,
    totalSold: 548,
    status: 'low-stock',
    bomId: 'BOM-004',
    description: 'Heavy-duty canvas seat covers for trucks.',
    leadTimeDays: 18,
  },
  {
    id: 'FP-004',
    name: 'Heated Premium Sedan Seat Covers - Brown',
    sku: 'HPSC-BRN-004',
    category: 'Premium Heated',
    vehicleType: 'Sedan',
    currentStock: 0,
    unit: 'sets',
    minStock: 25,
    maxStock: 150,
    productionCost: 425.00,
    retailPrice: 749.99,
    lastProduced: '2026-03-28',
    totalProduced: 320,
    totalSold: 320,
    status: 'out-of-stock',
    bomId: 'BOM-003',
    description: 'Heated seat covers for premium sedans.',
    leadTimeDays: 28,
  },
  {
    id: 'FP-005',
    name: 'Airbag-Safe Sports Car Seat Covers - Red',
    sku: 'ASSC-RED-005',
    category: 'Sport Performance',
    vehicleType: 'Sports Car',
    currentStock: 156,
    unit: 'sets',
    minStock: 30,
    maxStock: 200,
    productionCost: 315.25,
    retailPrice: 549.99,
    lastProduced: '2026-04-09',
    totalProduced: 650,
    totalSold: 494,
    status: 'in-stock',
    bomId: 'BOM-005',
    description: 'Airbag-safe seat covers for sports cars.',
    leadTimeDays: 21,
  },
  {
    id: 'FP-006',
    name: 'Luxury Embroidered SUV Covers - Beige',
    sku: 'LESC-BGE-006',
    category: 'Luxury',
    vehicleType: 'SUV',
    currentStock: 67,
    unit: 'sets',
    minStock: 35,
    maxStock: 180,
    productionCost: 385.00,
    retailPrice: 679.99,
    lastProduced: '2026-04-06',
    totalProduced: 420,
    totalSold: 353,
    status: 'in-stock',
  },
  {
    id: 'FP-007',
    name: 'Basic Economy Sedan Covers - Gray',
    sku: 'BESC-GRY-007',
    category: 'Economy',
    vehicleType: 'Sedan',
    currentStock: 220,
    unit: 'sets',
    minStock: 100,
    maxStock: 400,
    productionCost: 89.50,
    retailPrice: 149.99,
    lastProduced: '2026-04-08',
    totalProduced: 2100,
    totalSold: 1880,
    status: 'in-stock',
    bomId: 'BOM-006',
    description: 'Economy seat covers for sedans.',
    leadTimeDays: 10,
  },
  {
    id: 'FP-008',
    name: 'Waterproof Outdoor Truck Covers - Black',
    sku: 'WOTC-BLK-008',
    category: 'Waterproof',
    vehicleType: 'Truck',
    currentStock: 28,
    unit: 'sets',
    minStock: 45,
    maxStock: 220,
    productionCost: 245.00,
    retailPrice: 429.99,
    lastProduced: '2026-04-04',
    totalProduced: 485,
    totalSold: 457,
    status: 'low-stock',
  },
  {
    id: 'FP-009',
    name: 'Custom Embroidery Luxury Sedan - Navy',
    sku: 'CELS-NVY-009',
    category: 'Custom',
    vehicleType: 'Sedan',
    currentStock: 12,
    unit: 'sets',
    minStock: 20,
    maxStock: 100,
    productionCost: 465.00,
    retailPrice: 899.99,
    lastProduced: '2026-04-02',
    totalProduced: 180,
    totalSold: 168,
    status: 'low-stock',
  },
  {
    id: 'FP-010',
    name: 'Family Van 3-Row Covers - Charcoal',
    sku: 'FVRC-CHR-010',
    category: 'Family',
    vehicleType: 'Van',
    currentStock: 45,
    unit: 'sets',
    minStock: 30,
    maxStock: 150,
    productionCost: 325.00,
    retailPrice: 569.99,
    lastProduced: '2026-04-07',
    totalProduced: 380,
    totalSold: 335,
    status: 'in-stock',
  },
];

// BOM (Bill of Materials) data structures
export interface BOMItem {
  id: string;
  materialId: string; // Reference to inventory item
  materialName: string;
  quantity: number;
  unit: string;
  scrapFactor: number; // Percentage (e.g., 5 = 5% waste)
  costPerUnit: number;
  notes?: string;
}

export interface BOM {
  id: string;
  productId: string;
  productName: string;
  productSKU: string;
  version: string;
  status: 'active' | 'draft' | 'obsolete';
  effectiveDate: string;
  createdBy: string;
  createdDate: string;
  lastModified: string;
  items: BOMItem[];
  totalMaterialCost: number;
  laborCost: number;
  overheadCost: number;
  totalCost: number;
  notes?: string;
}

export const boms: BOM[] = [
  {
    id: 'BOM-001',
    productId: 'FP-001',
    productName: 'Premium Leather Sedan Seat Covers - Black',
    productSKU: 'PLSC-BLK-001',
    version: '1.0',
    status: 'active',
    effectiveDate: '2026-01-01',
    createdBy: 'Production Manager',
    createdDate: '2026-01-01',
    lastModified: '2026-03-15',
    laborCost: 85.00,
    overheadCost: 45.00,
    totalMaterialCost: 155.50,
    totalCost: 285.50,
    items: [
      {
        id: 'BOM-001-01',
        materialId: 'INV-001',
        materialName: 'Premium Leather Black',
        quantity: 2.5,
        unit: 'sqm',
        scrapFactor: 8,
        costPerUnit: 45.50,
        notes: 'High-grade automotive leather'
      },
      {
        id: 'BOM-001-02',
        materialId: 'INV-005',
        materialName: 'Heavy Duty Thread',
        quantity: 0.5,
        unit: 'spools',
        scrapFactor: 5,
        costPerUnit: 8.50,
      },
      {
        id: 'BOM-001-03',
        materialId: 'INV-009',
        materialName: 'Elastic Bands',
        quantity: 12,
        unit: 'meters',
        scrapFactor: 3,
        costPerUnit: 1.25,
      },
    ],
  },
  {
    id: 'BOM-002',
    productId: 'FP-002',
    productName: 'Sports Fabric SUV Seat Covers - Gray',
    productSKU: 'SFSC-GRY-002',
    version: '1.2',
    status: 'active',
    effectiveDate: '2026-02-01',
    createdBy: 'Engineering Team',
    createdDate: '2025-12-15',
    lastModified: '2026-04-01',
    laborCost: 65.00,
    overheadCost: 35.00,
    totalMaterialCost: 98.75,
    totalCost: 198.75,
    items: [
      {
        id: 'BOM-002-01',
        materialId: 'INV-002',
        materialName: 'Sport Fabric Gray',
        quantity: 3.0,
        unit: 'sqm',
        scrapFactor: 6,
        costPerUnit: 28.75,
      },
      {
        id: 'BOM-002-02',
        materialId: 'INV-005',
        materialName: 'Heavy Duty Thread',
        quantity: 0.4,
        unit: 'spools',
        scrapFactor: 5,
        costPerUnit: 8.50,
      },
      {
        id: 'BOM-002-03',
        materialId: 'INV-009',
        materialName: 'Elastic Bands',
        quantity: 15,
        unit: 'meters',
        scrapFactor: 3,
        costPerUnit: 1.25,
      },
    ],
  },
  {
    id: 'BOM-003',
    productId: 'FP-004',
    productName: 'Heated Premium Sedan Seat Covers - Brown',
    productSKU: 'HPSC-BRN-004',
    version: '2.0',
    status: 'active',
    effectiveDate: '2026-03-01',
    createdBy: 'R&D Department',
    createdDate: '2026-02-10',
    lastModified: '2026-03-25',
    laborCost: 125.00,
    overheadCost: 65.00,
    totalMaterialCost: 235.00,
    totalCost: 425.00,
    notes: 'Requires certified electrician for heating element installation',
    items: [
      {
        id: 'BOM-003-01',
        materialId: 'INV-001',
        materialName: 'Premium Leather Black',
        quantity: 2.8,
        unit: 'sqm',
        scrapFactor: 8,
        costPerUnit: 45.50,
        notes: 'Brown leather - special order'
      },
      {
        id: 'BOM-003-02',
        materialId: 'INV-008',
        materialName: 'Heating Elements',
        quantity: 2,
        unit: 'pcs',
        scrapFactor: 2,
        costPerUnit: 35.00,
        notes: 'UL certified heating pads'
      },
      {
        id: 'BOM-003-03',
        materialId: 'INV-005',
        materialName: 'Heavy Duty Thread',
        quantity: 0.6,
        unit: 'spools',
        scrapFactor: 5,
        costPerUnit: 8.50,
      },
      {
        id: 'BOM-003-04',
        materialId: 'INV-009',
        materialName: 'Elastic Bands',
        quantity: 12,
        unit: 'meters',
        scrapFactor: 3,
        costPerUnit: 1.25,
      },
    ],
  },
  {
    id: 'BOM-004',
    productId: 'FP-003',
    productName: 'Heavy Duty Truck Seat Covers - Canvas',
    productSKU: 'HDSC-CNV-003',
    version: '1.0',
    status: 'active',
    effectiveDate: '2026-01-15',
    createdBy: 'Production Manager',
    createdDate: '2026-01-10',
    lastModified: '2026-02-20',
    laborCost: 55.00,
    overheadCost: 30.00,
    totalMaterialCost: 90.00,
    totalCost: 175.00,
    items: [
      {
        id: 'BOM-004-01',
        materialId: 'INV-003',
        materialName: 'Heavy Duty Canvas',
        quantity: 3.5,
        unit: 'sqm',
        scrapFactor: 7,
        costPerUnit: 22.00,
      },
      {
        id: 'BOM-004-02',
        materialId: 'INV-005',
        materialName: 'Heavy Duty Thread',
        quantity: 0.3,
        unit: 'spools',
        scrapFactor: 5,
        costPerUnit: 8.50,
      },
    ],
  },
  {
    id: 'BOM-005',
    productId: 'FP-005',
    productName: 'Airbag-Safe Sports Car Seat Covers - Red',
    productSKU: 'ASSC-RED-005',
    version: '1.1',
    status: 'active',
    effectiveDate: '2026-02-15',
    createdBy: 'Safety Engineer',
    createdDate: '2026-02-01',
    lastModified: '2026-03-10',
    laborCost: 95.00,
    overheadCost: 55.00,
    totalMaterialCost: 165.25,
    totalCost: 315.25,
    notes: 'Must use breakaway stitching for airbag deployment zones',
    items: [
      {
        id: 'BOM-005-01',
        materialId: 'INV-004',
        materialName: 'Airbag-Safe Fabric',
        quantity: 2.2,
        unit: 'sqm',
        scrapFactor: 5,
        costPerUnit: 65.00,
        notes: 'Red airbag-certified fabric'
      },
      {
        id: 'BOM-005-02',
        materialId: 'INV-005',
        materialName: 'Heavy Duty Thread',
        quantity: 0.4,
        unit: 'spools',
        scrapFactor: 5,
        costPerUnit: 8.50,
        notes: 'Standard thread for non-deployment zones'
      },
      {
        id: 'BOM-005-03',
        materialId: 'INV-009',
        materialName: 'Elastic Bands',
        quantity: 10,
        unit: 'meters',
        scrapFactor: 3,
        costPerUnit: 1.25,
      },
    ],
  },
  {
    id: 'BOM-006',
    productId: 'FP-007',
    productName: 'Basic Economy Sedan Covers - Gray',
    productSKU: 'BESC-GRY-007',
    version: '1.0',
    status: 'active',
    effectiveDate: '2025-11-01',
    createdBy: 'Production Manager',
    createdDate: '2025-10-15',
    lastModified: '2025-12-05',
    laborCost: 35.00,
    overheadCost: 20.00,
    totalMaterialCost: 34.50,
    totalCost: 89.50,
    items: [
      {
        id: 'BOM-006-01',
        materialId: 'INV-002',
        materialName: 'Sport Fabric Gray',
        quantity: 1.8,
        unit: 'sqm',
        scrapFactor: 4,
        costPerUnit: 28.75,
        notes: 'Economy grade polyester'
      },
      {
        id: 'BOM-006-02',
        materialId: 'INV-009',
        materialName: 'Elastic Bands',
        quantity: 8,
        unit: 'meters',
        scrapFactor: 3,
        costPerUnit: 1.25,
      },
    ],
  },
];

// Alerts data
export interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  category: 'material' | 'schedule' | 'quality' | 'capacity';
  title: string;
  description: string;
  timestamp: string;
  relatedTo?: string;
  actionable: boolean;
}

export const alerts: Alert[] = [
  {
    id: 'ALERT-001',
    type: 'critical',
    category: 'material',
    title: 'Critical Material Shortage',
    description: 'Cutting Blades inventory below reorder point (8/15). Production may be affected.',
    timestamp: '2026-04-09T08:30:00',
    relatedTo: 'INV-007',
    actionable: true,
  },
  {
    id: 'ALERT-002',
    type: 'critical',
    category: 'material',
    title: 'Material Shortage Alert',
    description: 'Embroidery Thread Multi running low (70/80). Reorder recommended.',
    timestamp: '2026-04-09T07:15:00',
    relatedTo: 'INV-006',
    actionable: true,
  },
  {
    id: 'ALERT-003',
    type: 'warning',
    category: 'schedule',
    title: 'Order Behind Schedule',
    description: 'MO-2026-008 (Sports Car Seat Cover QC Batch) is delayed - 40% complete, expected 65%.',
    timestamp: '2026-04-09T06:45:00',
    relatedTo: 'MO-2026-008',
    actionable: true,
  },
  {
    id: 'ALERT-004',
    type: 'warning',
    category: 'capacity',
    title: 'Department Near Capacity',
    description: 'Airbag Section at 92% planned capacity. Consider load balancing.',
    timestamp: '2026-04-08T14:20:00',
    relatedTo: 'airbag',
    actionable: false,
  },
  {
    id: 'ALERT-005',
    type: 'warning',
    category: 'material',
    title: 'Low Stock Warning',
    description: 'Heavy Duty Canvas below target levels (180/250). Order scheduled delivery Apr 14.',
    timestamp: '2026-04-08T10:00:00',
    relatedTo: 'INV-003',
    actionable: false,
  },
  {
    id: 'ALERT-006',
    type: 'info',
    category: 'schedule',
    title: 'Upcoming Deadline',
    description: 'MO-2026-001 scheduled to complete tomorrow (Apr 10).',
    timestamp: '2026-04-08T09:00:00',
    relatedTo: 'MO-2026-001',
    actionable: false,
  },
];

// Analytics data
export const productionTrends = [
  { month: 'Oct', planned: 2800, actual: 2650, efficiency: 94.6 },
  { month: 'Nov', planned: 3100, actual: 2900, efficiency: 93.5 },
  { month: 'Dec', planned: 2900, actual: 2750, efficiency: 94.8 },
  { month: 'Jan', planned: 3200, actual: 3050, efficiency: 95.3 },
  { month: 'Feb', planned: 3400, actual: 3150, efficiency: 92.6 },
  { month: 'Mar', planned: 3600, actual: 3420, efficiency: 95.0 },
  { month: 'Apr', planned: 3800, actual: 3100, efficiency: 81.6 },
];

export const departmentPerformance = [
  { department: 'CNC Cutting', efficiency: 94.4, oee: 88.2, yield: 96.5 },
  { department: 'Sewing 1', efficiency: 88.6, oee: 82.1, yield: 94.2 },
  { department: 'Sewing 2', efficiency: 96.0, oee: 89.4, yield: 95.8 },
  { department: 'Sewing 3', efficiency: 97.6, oee: 91.2, yield: 97.1 },
  { department: 'Sewing 4', efficiency: 92.3, oee: 85.6, yield: 93.4 },
  { department: 'Airbag', efficiency: 92.4, oee: 87.8, yield: 98.2 },
  { department: 'Embroidery', efficiency: 78.6, oee: 72.4, yield: 91.5 },
  { department: 'QC', efficiency: 82.4, oee: 79.8, yield: 88.9 },
  { department: 'Packing', efficiency: 96.7, oee: 92.1, yield: 99.2 },
];

export const defectsByDepartment = [
  { department: 'CNC Cutting', defects: 12, name: 'CNC' },
  { department: 'Sewing 1', defects: 28, name: 'Sew1' },
  { department: 'Sewing 2', defects: 18, name: 'Sew2' },
  { department: 'Sewing 3', defects: 15, name: 'Sew3' },
  { department: 'Sewing 4', defects: 22, name: 'Sew4' },
  { department: 'Airbag', defects: 8, name: 'Airbag' },
  { department: 'Embroidery', defects: 35, name: 'Embr' },
  { department: 'QC', defects: 42, name: 'QC' },
  { department: 'Packing', defects: 5, name: 'Pack' },
];

// ============================================================================
// HELPER FUNCTIONS - Product-BOM Linkage & MRP Calculations
// ============================================================================

/**
 * Get BOM for a specific product
 */
export function getBOMForProduct(productId: string): BOM | undefined {
  return boms.find(bom => bom.productId === productId && bom.status === 'active');
}

/**
 * Get all products that use a specific material
 */
export function getProductsUsingMaterial(materialId: string): FinishedProduct[] {
  const productsWithBOM = finishedProducts.filter(product => product.bomId);
  
  return productsWithBOM.filter(product => {
    const bom = getBOMForProduct(product.id);
    return bom?.items.some(item => item.materialId === materialId);
  });
}

/**
 * Calculate material requirements for a manufacturing order
 * @param productId - Product to manufacture
 * @param quantity - Quantity to produce
 * @returns Array of material requirements with availability check
 */
export interface MaterialRequirement {
  materialId: string;
  materialName: string;
  required: number;
  available: number;
  unit: string;
  status: 'sufficient' | 'shortage' | 'critical';
  shortfall?: number;
}

export function calculateMaterialRequirements(
  productId: string, 
  quantity: number
): MaterialRequirement[] {
  const bom = getBOMForProduct(productId);
  if (!bom) return [];

  return bom.items.map(bomItem => {
    // Calculate required quantity with scrap factor
    const scrapMultiplier = 1 + (bomItem.scrapFactor / 100);
    const requiredQty = bomItem.quantity * quantity * scrapMultiplier;
    
    // Get current inventory
    const inventoryItem = inventoryItems.find(inv => inv.id === bomItem.materialId);
    const availableQty = inventoryItem?.currentStock || 0;
    
    // Determine status
    let status: 'sufficient' | 'shortage' | 'critical' = 'sufficient';
    let shortfall = 0;
    
    if (availableQty < requiredQty) {
      shortfall = requiredQty - availableQty;
      const reorderPoint = inventoryItem?.reorderPoint || 0;
      status = availableQty < reorderPoint ? 'critical' : 'shortage';
    }
    
    return {
      materialId: bomItem.materialId,
      materialName: bomItem.materialName,
      required: Math.ceil(requiredQty * 100) / 100, // Round to 2 decimals
      available: availableQty,
      unit: bomItem.unit,
      status,
      shortfall: shortfall > 0 ? Math.ceil(shortfall * 100) / 100 : undefined,
    };
  });
}

/**
 * Calculate production cost for a given quantity
 * @param productId - Product ID
 * @param quantity - Quantity to produce
 * @returns Total cost breakdown
 */
export interface ProductionCostBreakdown {
  materialCost: number;
  laborCost: number;
  overheadCost: number;
  totalCost: number;
  costPerUnit: number;
}

export function calculateProductionCost(
  productId: string,
  quantity: number
): ProductionCostBreakdown | null {
  const bom = getBOMForProduct(productId);
  if (!bom) return null;

  const materialCost = bom.totalMaterialCost * quantity;
  const laborCost = bom.laborCost * quantity;
  const overheadCost = bom.overheadCost * quantity;
  const totalCost = materialCost + laborCost + overheadCost;

  return {
    materialCost,
    laborCost,
    overheadCost,
    totalCost,
    costPerUnit: bom.totalCost,
  };
}

/**
 * Check if all materials are available for production
 */
export function canProduceOrder(productId: string, quantity: number): {
  canProduce: boolean;
  missingMaterials: MaterialRequirement[];
} {
  const requirements = calculateMaterialRequirements(productId, quantity);
  const missingMaterials = requirements.filter(req => req.status !== 'sufficient');
  
  return {
    canProduce: missingMaterials.length === 0,
    missingMaterials,
  };
}

/**
 * Get inventory value for a specific product's materials
 */
export function getProductMaterialValue(productId: string): number {
  const bom = getBOMForProduct(productId);
  if (!bom) return 0;
  
  return bom.totalMaterialCost;
}

/**
 * Calculate potential profit for a product
 */
export function calculateProductProfit(productId: string): {
  costPerUnit: number;
  retailPrice: number;
  profit: number;
  marginPercentage: number;
} | null {
  const product = finishedProducts.find(p => p.id === productId);
  const bom = getBOMForProduct(productId);
  
  if (!product || !bom) return null;
  
  const profit = product.retailPrice - bom.totalCost;
  const marginPercentage = (profit / product.retailPrice) * 100;
  
  return {
    costPerUnit: bom.totalCost,
    retailPrice: product.retailPrice,
    profit,
    marginPercentage,
  };
}

// ============================================================================
// MRP CALCULATION ENGINE - Material Requirements Planning
// ============================================================================

/**
 * Material allocation tracking per manufacturing order
 */
export interface MaterialAllocation {
  materialId: string;
  materialName: string;
  orderId: string;
  orderProduct: string;
  allocatedQty: number;
  unit: string;
  orderDate: string;
  requiredDate: string;
}

/**
 * MRP calculation result for a single material
 */
export interface MRPCalculation {
  materialId: string;
  materialName: string;
  unit: string;
  currentStock: number;
  allocatedQty: number;
  availableQty: number;
  grossRequirement: number;
  netRequirement: number;
  reorderPoint: number;
  status: 'sufficient' | 'low' | 'shortage' | 'critical';
  allocations: MaterialAllocation[];
  recommendPurchase: boolean;
  recommendedOrderQty?: number;
  leadTimeDays: number;
  suggestedOrderDate?: string;
}

/**
 * Purchase Order interface
 */
export interface PurchaseOrder {
  id: string;
  materialId: string;
  materialName: string;
  supplier: string;
  quantity: number;
  unit: string;
  costPerUnit: number;
  totalCost: number;
  orderDate: string;
  expectedDelivery: string;
  status: 'draft' | 'pending' | 'ordered' | 'received' | 'cancelled';
  notes?: string;
  createdBy: string;
}

/**
 * Calculate MRP for all materials across all manufacturing orders
 */
export function calculateMRP(orders: ManufacturingOrder[] = manufacturingOrders): MRPCalculation[] {
  const mrpResults: Map<string, MRPCalculation> = new Map();
  
  // Initialize MRP calculations for all inventory items
  inventoryItems.forEach(item => {
    mrpResults.set(item.id, {
      materialId: item.id,
      materialName: item.name,
      unit: item.unit,
      currentStock: item.currentStock,
      allocatedQty: 0,
      availableQty: item.currentStock,
      grossRequirement: 0,
      netRequirement: 0,
      reorderPoint: item.reorderPoint,
      status: 'sufficient',
      allocations: [],
      recommendPurchase: false,
      leadTimeDays: item.leadTimeDays,
    });
  });

  // Process all active and planned manufacturing orders
  const activeOrders = orders.filter(order => 
    order.status === 'planned' || order.status === 'in-progress'
  );

  activeOrders.forEach(order => {
    // Get product and BOM
    const product = finishedProducts.find(p => p.name === order.product);
    if (!product) return;

    const bom = getBOMForProduct(product.id);
    if (!bom) return;

    // Calculate requirements for this order
    bom.items.forEach(bomItem => {
      const mrp = mrpResults.get(bomItem.materialId);
      if (!mrp) return;

      // Calculate required quantity with scrap factor
      const scrapMultiplier = 1 + (bomItem.scrapFactor / 100);
      const requiredQty = bomItem.quantity * order.quantity * scrapMultiplier;
      const roundedQty = Math.ceil(requiredQty * 100) / 100;

      // Update gross requirement
      mrp.grossRequirement += roundedQty;

      // Add allocation
      mrp.allocations.push({
        materialId: bomItem.materialId,
        materialName: bomItem.materialName,
        orderId: order.id,
        orderProduct: order.product,
        allocatedQty: roundedQty,
        unit: bomItem.unit,
        orderDate: order.startDate,
        requiredDate: order.endDate,
      });
    });
  });

  // Calculate net requirements and status for each material
  mrpResults.forEach((mrp) => {
    mrp.allocatedQty = mrp.grossRequirement;
    mrp.availableQty = mrp.currentStock - mrp.allocatedQty;
    mrp.netRequirement = Math.max(0, mrp.allocatedQty - mrp.currentStock);

    // Determine status
    if (mrp.netRequirement > 0) {
      mrp.status = mrp.currentStock <= 0 ? 'critical' : 'shortage';
      mrp.recommendPurchase = true;
      
      // Calculate recommended order quantity
      const inventoryItem = inventoryItems.find(inv => inv.id === mrp.materialId);
      if (inventoryItem) {
        // Order enough to cover shortage + bring back to max stock
        mrp.recommendedOrderQty = Math.ceil(
          mrp.netRequirement + (inventoryItem.maxStock - inventoryItem.currentStock)
        );
        
        // Calculate suggested order date (lead time before first required date)
        if (mrp.allocations.length > 0) {
          const earliestRequiredDate = mrp.allocations
            .map(a => new Date(a.requiredDate))
            .sort((a, b) => a.getTime() - b.getTime())[0];
          
          const orderDate = new Date(earliestRequiredDate);
          orderDate.setDate(orderDate.getDate() - mrp.leadTimeDays - 2); // Add 2 day buffer
          mrp.suggestedOrderDate = orderDate.toISOString().split('T')[0];
        }
      }
    } else if (mrp.availableQty < mrp.reorderPoint) {
      mrp.status = 'low';
      mrp.recommendPurchase = true;
      
      const inventoryItem = inventoryItems.find(inv => inv.id === mrp.materialId);
      if (inventoryItem) {
        mrp.recommendedOrderQty = inventoryItem.maxStock - mrp.currentStock;
      }
    } else {
      mrp.status = 'sufficient';
    }
  });

  // Return only materials with requirements or low stock
  return Array.from(mrpResults.values())
    .filter(mrp => mrp.grossRequirement > 0 || mrp.status !== 'sufficient')
    .sort((a, b) => {
      // Sort by priority: critical > shortage > low > sufficient
      const statusPriority = { critical: 0, shortage: 1, low: 2, sufficient: 3 };
      return statusPriority[a.status] - statusPriority[b.status];
    });
}

/**
 * Generate purchase recommendations based on MRP
 */
export function generatePurchaseRecommendations(mrpResults: MRPCalculation[]): PurchaseOrder[] {
  const recommendations: PurchaseOrder[] = [];
  
  mrpResults
    .filter(mrp => mrp.recommendPurchase && mrp.recommendedOrderQty)
    .forEach((mrp, index) => {
      const inventoryItem = inventoryItems.find(inv => inv.id === mrp.materialId);
      if (!inventoryItem) return;

      const quantity = mrp.recommendedOrderQty || 0;
      const totalCost = quantity * inventoryItem.costPerUnit;
      
      // Calculate expected delivery
      const orderDate = new Date(mrp.suggestedOrderDate || new Date());
      const deliveryDate = new Date(orderDate);
      deliveryDate.setDate(deliveryDate.getDate() + mrp.leadTimeDays);

      recommendations.push({
        id: `PO-${new Date().getFullYear()}-${String(index + 1).padStart(4, '0')}`,
        materialId: mrp.materialId,
        materialName: mrp.materialName,
        supplier: inventoryItem.supplier,
        quantity,
        unit: mrp.unit,
        costPerUnit: inventoryItem.costPerUnit,
        totalCost,
        orderDate: mrp.suggestedOrderDate || new Date().toISOString().split('T')[0],
        expectedDelivery: deliveryDate.toISOString().split('T')[0],
        status: 'draft',
        notes: mrp.status === 'critical' 
          ? 'URGENT: Critical shortage - order immediately'
          : mrp.status === 'shortage'
          ? 'Material shortage detected - order soon'
          : 'Reorder point reached - routine replenishment',
        createdBy: 'MRP System',
      });
    });

  return recommendations;
}

/**
 * Check material availability for a specific order
 */
export function checkOrderMaterialAvailability(orderId: string): {
  canStart: boolean;
  readyMaterials: MaterialRequirement[];
  missingMaterials: MaterialRequirement[];
  partialMaterials: MaterialRequirement[];
} {
  const order = manufacturingOrders.find(o => o.id === orderId);
  if (!order) {
    return { canStart: false, readyMaterials: [], missingMaterials: [], partialMaterials: [] };
  }

  const product = finishedProducts.find(p => p.name === order.product);
  if (!product) {
    return { canStart: false, readyMaterials: [], missingMaterials: [], partialMaterials: [] };
  }

  const requirements = calculateMaterialRequirements(product.id, order.quantity);
  
  const readyMaterials = requirements.filter(req => req.status === 'sufficient');
  const missingMaterials = requirements.filter(req => req.available === 0);
  const partialMaterials = requirements.filter(req => 
    req.status !== 'sufficient' && req.available > 0
  );

  return {
    canStart: missingMaterials.length === 0 && partialMaterials.length === 0,
    readyMaterials,
    missingMaterials,
    partialMaterials,
  };
}

/**
 * Get material consumption forecast for next N days
 */
export function getMaterialForecast(days: number = 30): {
  materialId: string;
  materialName: string;
  unit: string;
  currentStock: number;
  forecastedUsage: number;
  projectedStock: number;
  willRunOut: boolean;
  runOutDate?: string;
}[] {
  const forecast: Map<string, any> = new Map();
  
  // Initialize forecast for all materials
  inventoryItems.forEach(item => {
    forecast.set(item.id, {
      materialId: item.id,
      materialName: item.name,
      unit: item.unit,
      currentStock: item.currentStock,
      forecastedUsage: 0,
      projectedStock: item.currentStock,
      willRunOut: false,
    });
  });

  // Get orders within forecast period
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + days);
  
  const upcomingOrders = manufacturingOrders.filter(order => {
    const orderDate = new Date(order.startDate);
    return orderDate <= endDate && (order.status === 'planned' || order.status === 'in-progress');
  });

  // Calculate usage
  upcomingOrders.forEach(order => {
    const product = finishedProducts.find(p => p.name === order.product);
    if (!product) return;

    const requirements = calculateMaterialRequirements(product.id, order.quantity);
    requirements.forEach(req => {
      const mat = forecast.get(req.materialId);
      if (mat) {
        mat.forecastedUsage += req.required;
      }
    });
  });

  // Calculate projected stock and run-out dates
  forecast.forEach((mat) => {
    mat.projectedStock = mat.currentStock - mat.forecastedUsage;
    mat.willRunOut = mat.projectedStock < 0;
    
    if (mat.willRunOut && mat.forecastedUsage > 0) {
      // Estimate run-out date based on usage rate
      const daysUntilRunOut = Math.floor((mat.currentStock / mat.forecastedUsage) * days);
      const runOutDate = new Date();
      runOutDate.setDate(runOutDate.getDate() + daysUntilRunOut);
      mat.runOutDate = runOutDate.toISOString().split('T')[0];
    }
  });

  return Array.from(forecast.values())
    .filter(mat => mat.forecastedUsage > 0)
    .sort((a, b) => {
      if (a.willRunOut && !b.willRunOut) return -1;
      if (!a.willRunOut && b.willRunOut) return 1;
      return a.projectedStock - b.projectedStock;
    });
}