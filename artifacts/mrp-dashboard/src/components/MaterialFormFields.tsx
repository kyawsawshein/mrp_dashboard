import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import { MaterialCategory, InventoryItem, FabricSpecification, FoamSpecification, FastenerSpecification, ThreadSpecification, PackagingSpecification, FabricType, FiberType, FinishType, FoamType, FastenerType } from '../data/mockData';

interface MaterialFormFieldsProps {
  formData: Partial<InventoryItem>;
  updateFormField: (field: keyof InventoryItem, value: any) => void;
  updateFabricSpec: (field: keyof FabricSpecification, value: any) => void;
  updateFoamSpec: (field: keyof FoamSpecification, value: any) => void;
  updateFastenerSpec: (field: keyof FastenerSpecification, value: any) => void;
  updateThreadSpec: (field: keyof ThreadSpecification, value: any) => void;
  updatePackagingSpec: (field: keyof PackagingSpecification, value: any) => void;
}

export function MaterialFormFields({
  formData,
  updateFormField,
  updateFabricSpec,
  updateFoamSpec,
  updateFastenerSpec,
  updateThreadSpec,
  updatePackagingSpec,
}: MaterialFormFieldsProps) {
  
  // Helper for fiber composition management
  const addFiber = () => {
    const currentComposition = formData.fabricSpec?.fiberComposition || [];
    updateFabricSpec('fiberComposition', [...currentComposition, { fiber: 'polyester' as FiberType, percentage: 0 }]);
  };

  const updateFiber = (index: number, field: 'fiber' | 'percentage', value: any) => {
    const currentComposition = [...(formData.fabricSpec?.fiberComposition || [])];
    currentComposition[index] = { ...currentComposition[index], [field]: value };
    updateFabricSpec('fiberComposition', currentComposition);
  };

  const removeFiber = (index: number) => {
    const currentComposition = [...(formData.fabricSpec?.fiberComposition || [])];
    currentComposition.splice(index, 1);
    updateFabricSpec('fiberComposition', currentComposition);
  };

  // Helper for finishes management
  const toggleFinish = (finish: FinishType) => {
    const current = formData.fabricSpec?.finish || [];
    const newFinishes = current.includes(finish)
      ? current.filter(f => f !== finish)
      : [...current, finish];
    updateFabricSpec('finish', newFinishes);
  };

  return (
    <div className="space-y-6">
      {/* Common Fields */}
      <div className="space-y-4">
        <h3 className="font-semibold text-sm border-b pb-2">Basic Information</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Material Name *</Label>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={(e) => updateFormField('name', e.target.value)}
              placeholder="e.g., Premium Automotive Leather"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sku">SKU *</Label>
            <Input
              id="sku"
              value={formData.sku || ''}
              onChange={(e) => updateFormField('sku', e.target.value)}
              placeholder="e.g., FAB-LEATH-BLK-001"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={formData.category} onValueChange={(value) => updateFormField('category', value as MaterialCategory)}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fabric">Fabric</SelectItem>
                <SelectItem value="foam">Foam</SelectItem>
                <SelectItem value="laminate">Laminate</SelectItem>
                <SelectItem value="fastener">Fastener</SelectItem>
                <SelectItem value="thread">Thread</SelectItem>
                <SelectItem value="accessory">Accessory</SelectItem>
                <SelectItem value="packaging">Packaging</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplier">Supplier *</Label>
            <Input
              id="supplier"
              value={formData.supplier || ''}
              onChange={(e) => updateFormField('supplier', e.target.value)}
              placeholder="Supplier name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplierSKU">Supplier SKU</Label>
            <Input
              id="supplierSKU"
              value={formData.supplierSKU || ''}
              onChange={(e) => updateFormField('supplierSKU', e.target.value)}
              placeholder="Supplier's part number"
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="currentStock">Current Stock *</Label>
            <Input
              id="currentStock"
              type="number"
              value={formData.currentStock || 0}
              onChange={(e) => updateFormField('currentStock', parseFloat(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit">Unit *</Label>
            <Input
              id="unit"
              value={formData.unit || ''}
              onChange={(e) => updateFormField('unit', e.target.value)}
              placeholder="sqm, pcs, meters, kg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="minStock">Min Stock</Label>
            <Input
              id="minStock"
              type="number"
              value={formData.minStock || 0}
              onChange={(e) => updateFormField('minStock', parseFloat(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxStock">Max Stock</Label>
            <Input
              id="maxStock"
              type="number"
              value={formData.maxStock || 0}
              onChange={(e) => updateFormField('maxStock', parseFloat(e.target.value))}
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="reorderPoint">Reorder Point</Label>
            <Input
              id="reorderPoint"
              type="number"
              value={formData.reorderPoint || 0}
              onChange={(e) => updateFormField('reorderPoint', parseFloat(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="leadTimeDays">Lead Time (days)</Label>
            <Input
              id="leadTimeDays"
              type="number"
              value={formData.leadTimeDays || 0}
              onChange={(e) => updateFormField('leadTimeDays', parseInt(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="costPerUnit">Cost per Unit ($)</Label>
            <Input
              id="costPerUnit"
              type="number"
              step="0.01"
              value={formData.costPerUnit || 0}
              onChange={(e) => updateFormField('costPerUnit', parseFloat(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select value={formData.currency || 'USD'} onValueChange={(value) => updateFormField('currency', value)}>
              <SelectTrigger id="currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
                <SelectItem value="CNY">CNY</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="location">Warehouse Location</Label>
            <Input
              id="location"
              value={formData.location || ''}
              onChange={(e) => updateFormField('location', e.target.value)}
              placeholder="e.g., Warehouse A - Rack 12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="certifications">Certifications (comma-separated)</Label>
            <Input
              id="certifications"
              value={formData.certifications?.join(', ') || ''}
              onChange={(e) => updateFormField('certifications', e.target.value.split(',').map(s => s.trim()))}
              placeholder="e.g., ISO-9001, OEKO-TEX"
            />
          </div>
        </div>
      </div>

      {/* Category-Specific Specifications */}
      {formData.category === 'fabric' && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="font-semibold text-sm border-b pb-2">Fabric Specifications</h3>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fabricType">Fabric Type *</Label>
              <Select 
                value={formData.fabricSpec?.fabricType} 
                onValueChange={(value) => updateFabricSpec('fabricType', value as FabricType)}
              >
                <SelectTrigger id="fabricType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="woven">Woven</SelectItem>
                  <SelectItem value="knit">Knit</SelectItem>
                  <SelectItem value="non-woven">Non-woven</SelectItem>
                  <SelectItem value="leather">Leather</SelectItem>
                  <SelectItem value="synthetic-leather">Synthetic Leather</SelectItem>
                  <SelectItem value="canvas">Canvas</SelectItem>
                  <SelectItem value="mesh">Mesh</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gsm">GSM (g/m²) *</Label>
              <Input
                id="gsm"
                type="number"
                value={formData.fabricSpec?.gsm || 0}
                onChange={(e) => updateFabricSpec('gsm', parseInt(e.target.value))}
                placeholder="e.g., 450"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Color *</Label>
              <Input
                id="color"
                value={formData.fabricSpec?.color || ''}
                onChange={(e) => updateFabricSpec('color', e.target.value)}
                placeholder="e.g., Black, Navy Blue"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="width">Width *</Label>
              <Input
                id="width"
                type="number"
                value={formData.fabricSpec?.width || 0}
                onChange={(e) => updateFabricSpec('width', parseFloat(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="widthUnit">Width Unit</Label>
              <Select 
                value={formData.fabricSpec?.widthUnit || 'cm'} 
                onValueChange={(value) => updateFabricSpec('widthUnit', value as 'cm' | 'inch')}
              >
                <SelectTrigger id="widthUnit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cm">cm</SelectItem>
                  <SelectItem value="inch">inch</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="patternDesign">Pattern/Design</Label>
              <Input
                id="patternDesign"
                value={formData.fabricSpec?.patternDesign || ''}
                onChange={(e) => updateFabricSpec('patternDesign', e.target.value)}
                placeholder="e.g., Plain, Striped, Embossed"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Fiber Composition *</Label>
            <div className="space-y-2">
              {(formData.fabricSpec?.fiberComposition || [{ fiber: 'polyester' as FiberType, percentage: 100 }]).map((fiber, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Select value={fiber.fiber} onValueChange={(value) => updateFiber(index, 'fiber', value as FiberType)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="polyester">Polyester</SelectItem>
                        <SelectItem value="nylon">Nylon</SelectItem>
                        <SelectItem value="cotton">Cotton</SelectItem>
                        <SelectItem value="wool">Wool</SelectItem>
                        <SelectItem value="acrylic">Acrylic</SelectItem>
                        <SelectItem value="spandex">Spandex</SelectItem>
                        <SelectItem value="leather">Leather</SelectItem>
                        <SelectItem value="blend">Blend</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-32">
                    <Input
                      type="number"
                      value={fiber.percentage}
                      onChange={(e) => updateFiber(index, 'percentage', parseInt(e.target.value))}
                      placeholder="%"
                      max={100}
                    />
                  </div>
                  <span className="text-sm text-gray-500 min-w-[20px]">%</span>
                  {(formData.fabricSpec?.fiberComposition || []).length > 1 && (
                    <Button size="sm" variant="ghost" onClick={() => removeFiber(index)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button size="sm" variant="outline" onClick={addFiber}>
                <Plus className="w-3 h-3 mr-1" />
                Add Fiber
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Finish/Treatment</Label>
            <div className="grid grid-cols-3 gap-3">
              {(['waterproof', 'water-resistant', 'flame-retardant', 'anti-bacterial', 'uv-resistant', 'breathable', 'none'] as FinishType[]).map((finish) => (
                <div key={finish} className="flex items-center space-x-2">
                  <Checkbox
                    id={`finish-${finish}`}
                    checked={(formData.fabricSpec?.finish || []).includes(finish)}
                    onCheckedChange={() => toggleFinish(finish)}
                  />
                  <label htmlFor={`finish-${finish}`} className="text-sm capitalize">
                    {finish.replace('-', ' ')}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="stretch"
                checked={formData.fabricSpec?.stretch || false}
                onCheckedChange={(checked) => updateFabricSpec('stretch', checked)}
              />
              <label htmlFor="stretch" className="text-sm">Stretch Fabric</label>
            </div>

            {formData.fabricSpec?.stretch && (
              <div className="space-y-2">
                <Label htmlFor="stretchPercentage">Stretch %</Label>
                <Input
                  id="stretchPercentage"
                  type="number"
                  value={formData.fabricSpec?.stretchPercentage || 0}
                  onChange={(e) => updateFabricSpec('stretchPercentage', parseInt(e.target.value))}
                />
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isLaminated"
                checked={formData.fabricSpec?.isLaminated || false}
                onCheckedChange={(checked) => updateFabricSpec('isLaminated', checked)}
              />
              <label htmlFor="isLaminated" className="text-sm font-medium">Laminated Fabric</label>
            </div>

            {formData.fabricSpec?.isLaminated && (
              <div className="pl-6 space-y-3 border-l-2">
                <h4 className="text-sm font-medium">Lamination Details</h4>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="laminateType">Laminate Type</Label>
                    <Select 
                      value={formData.fabricSpec?.laminationDetails?.laminateType} 
                      onValueChange={(value) => updateFabricSpec('laminationDetails', {
                        ...formData.fabricSpec?.laminationDetails,
                        laminateType: value
                      })}
                    >
                      <SelectTrigger id="laminateType">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PU-foam">PU Foam</SelectItem>
                        <SelectItem value="open-cell-foam">Open Cell Foam</SelectItem>
                        <SelectItem value="closed-cell-foam">Closed Cell Foam</SelectItem>
                        <SelectItem value="TPU">TPU</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="laminateThickness">Thickness (mm)</Label>
                    <Input
                      id="laminateThickness"
                      type="number"
                      step="0.1"
                      value={formData.fabricSpec?.laminationDetails?.thickness || 0}
                      onChange={(e) => updateFabricSpec('laminationDetails', {
                        ...formData.fabricSpec?.laminationDetails,
                        thickness: parseFloat(e.target.value)
                      })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="laminateDensity">Density (kg/m³)</Label>
                    <Input
                      id="laminateDensity"
                      type="number"
                      value={formData.fabricSpec?.laminationDetails?.density || 0}
                      onChange={(e) => updateFabricSpec('laminationDetails', {
                        ...formData.fabricSpec?.laminationDetails,
                        density: parseInt(e.target.value)
                      })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bondingMethod">Bonding Method</Label>
                  <Select 
                    value={formData.fabricSpec?.laminationDetails?.bondingMethod} 
                    onValueChange={(value) => updateFabricSpec('laminationDetails', {
                      ...formData.fabricSpec?.laminationDetails,
                      bondingMethod: value as 'adhesive' | 'heat-bond' | 'flame-lamination'
                    })}
                  >
                    <SelectTrigger id="bondingMethod">
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="adhesive">Adhesive</SelectItem>
                      <SelectItem value="heat-bond">Heat Bond</SelectItem>
                      <SelectItem value="flame-lamination">Flame Lamination</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {formData.category === 'foam' && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="font-semibold text-sm border-b pb-2">Foam Specifications</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="foamType">Foam Type *</Label>
              <Select 
                value={formData.foamSpec?.foamType} 
                onValueChange={(value) => updateFoamSpec('foamType', value as FoamType)}
              >
                <SelectTrigger id="foamType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PU">PU (Polyurethane)</SelectItem>
                  <SelectItem value="open-cell">Open Cell</SelectItem>
                  <SelectItem value="closed-cell">Closed Cell</SelectItem>
                  <SelectItem value="memory-foam">Memory Foam</SelectItem>
                  <SelectItem value="EVA">EVA</SelectItem>
                  <SelectItem value="latex">Latex</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="foamColor">Color</Label>
              <Input
                id="foamColor"
                value={formData.foamSpec?.color || ''}
                onChange={(e) => updateFoamSpec('color', e.target.value)}
                placeholder="e.g., Natural White, Gray"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="density">Density (kg/m³) *</Label>
              <Input
                id="density"
                type="number"
                value={formData.foamSpec?.density || 0}
                onChange={(e) => updateFoamSpec('density', parseInt(e.target.value))}
                placeholder="e.g., 35, 60"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="thickness">Thickness (mm) *</Label>
              <Input
                id="thickness"
                type="number"
                step="0.1"
                value={formData.foamSpec?.thickness || 0}
                onChange={(e) => updateFoamSpec('thickness', parseFloat(e.target.value))}
                placeholder="e.g., 5, 10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hardness">Hardness (Shore A)</Label>
              <Input
                id="hardness"
                type="number"
                value={formData.foamSpec?.hardness || 0}
                onChange={(e) => updateFoamSpec('hardness', parseInt(e.target.value))}
                placeholder="e.g., 45"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="compression">Compression (%)</Label>
              <Input
                id="compression"
                type="number"
                value={formData.foamSpec?.compression || 0}
                onChange={(e) => updateFoamSpec('compression', parseInt(e.target.value))}
                placeholder="e.g., 25"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isFireRetardant"
              checked={formData.foamSpec?.isFireRetardant || false}
              onCheckedChange={(checked) => updateFoamSpec('isFireRetardant', checked)}
            />
            <label htmlFor="isFireRetardant" className="text-sm">Fire Retardant Treated</label>
          </div>
        </div>
      )}

      {formData.category === 'fastener' && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="font-semibold text-sm border-b pb-2">Fastener Specifications</h3>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fastenerType">Fastener Type *</Label>
              <Select 
                value={formData.fastenerSpec?.fastenerType} 
                onValueChange={(value) => updateFastenerSpec('fastenerType', value as FastenerType)}
              >
                <SelectTrigger id="fastenerType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zipper">Zipper</SelectItem>
                  <SelectItem value="j-clip">J-Clip</SelectItem>
                  <SelectItem value="snap-button">Snap Button</SelectItem>
                  <SelectItem value="velcro">Velcro</SelectItem>
                  <SelectItem value="buckle">Buckle</SelectItem>
                  <SelectItem value="elastic-cord">Elastic Cord</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Size *</Label>
              <Input
                id="size"
                value={formData.fastenerSpec?.size || ''}
                onChange={(e) => updateFastenerSpec('size', e.target.value)}
                placeholder="e.g., #5, 25mm, Large"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="material">Material *</Label>
              <Input
                id="material"
                value={formData.fastenerSpec?.material || ''}
                onChange={(e) => updateFastenerSpec('material', e.target.value)}
                placeholder="e.g., Metal, Plastic, Nylon"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fastenerColor">Color</Label>
              <Input
                id="fastenerColor"
                value={formData.fastenerSpec?.color || ''}
                onChange={(e) => updateFastenerSpec('color', e.target.value)}
                placeholder="e.g., Black, Silver"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fastenerFinish">Finish</Label>
              <Input
                id="fastenerFinish"
                value={formData.fastenerSpec?.finish || ''}
                onChange={(e) => updateFastenerSpec('finish', e.target.value)}
                placeholder="e.g., Nickel-plated, Matte"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="strength">Strength Rating</Label>
              <Input
                id="strength"
                value={formData.fastenerSpec?.strength || ''}
                onChange={(e) => updateFastenerSpec('strength', e.target.value)}
                placeholder="e.g., Heavy-duty, Standard"
              />
            </div>
          </div>
        </div>
      )}

      {formData.category === 'thread' && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="font-semibold text-sm border-b pb-2">Thread Specifications</h3>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="threadType">Thread Type *</Label>
              <Select 
                value={formData.threadSpec?.threadType} 
                onValueChange={(value) => updateThreadSpec('threadType', value as 'polyester' | 'nylon' | 'cotton' | 'bonded-nylon')}
              >
                <SelectTrigger id="threadType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="polyester">Polyester</SelectItem>
                  <SelectItem value="nylon">Nylon</SelectItem>
                  <SelectItem value="cotton">Cotton</SelectItem>
                  <SelectItem value="bonded-nylon">Bonded Nylon</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Weight/Size *</Label>
              <Input
                id="weight"
                value={formData.threadSpec?.weight || ''}
                onChange={(e) => updateThreadSpec('weight', e.target.value)}
                placeholder="e.g., T-90, T-70, 40/2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="threadColor">Color</Label>
              <Input
                id="threadColor"
                value={formData.threadSpec?.color || ''}
                onChange={(e) => updateThreadSpec('color', e.target.value)}
                placeholder="e.g., Black, White"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="threadStrength">Strength (N - Newtons)</Label>
              <Input
                id="threadStrength"
                type="number"
                value={formData.threadSpec?.strength || 0}
                onChange={(e) => updateThreadSpec('strength', parseInt(e.target.value))}
                placeholder="e.g., 90"
              />
            </div>

            <div className="flex items-center space-x-2 pt-6">
              <Checkbox
                id="uvResistant"
                checked={formData.threadSpec?.uvResistant || false}
                onCheckedChange={(checked) => updateThreadSpec('uvResistant', checked)}
              />
              <label htmlFor="uvResistant" className="text-sm">UV Resistant</label>
            </div>
          </div>
        </div>
      )}

      {formData.category === 'packaging' && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="font-semibold text-sm border-b pb-2">Packaging Specifications</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="packagingType">Packaging Type *</Label>
              <Select 
                value={formData.packagingSpec?.packagingType} 
                onValueChange={(value) => updatePackagingSpec('packagingType', value as 'poly-bag' | 'box' | 'carton' | 'hang-tag' | 'label' | 'insert')}
              >
                <SelectTrigger id="packagingType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="poly-bag">Poly Bag</SelectItem>
                  <SelectItem value="box">Box</SelectItem>
                  <SelectItem value="carton">Carton</SelectItem>
                  <SelectItem value="hang-tag">Hang Tag</SelectItem>
                  <SelectItem value="label">Label</SelectItem>
                  <SelectItem value="insert">Insert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="packagingMaterial">Material *</Label>
              <Input
                id="packagingMaterial"
                value={formData.packagingSpec?.material || ''}
                onChange={(e) => updatePackagingSpec('material', e.target.value)}
                placeholder="e.g., LDPE, Cardboard, Paper"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Dimensions</Label>
            <div className="grid grid-cols-4 gap-4">
              <Input
                type="number"
                value={formData.packagingSpec?.dimensions?.length || 0}
                onChange={(e) => updatePackagingSpec('dimensions', {
                  ...formData.packagingSpec?.dimensions,
                  length: parseFloat(e.target.value)
                })}
                placeholder="Length"
              />
              <Input
                type="number"
                value={formData.packagingSpec?.dimensions?.width || 0}
                onChange={(e) => updatePackagingSpec('dimensions', {
                  ...formData.packagingSpec?.dimensions,
                  width: parseFloat(e.target.value)
                })}
                placeholder="Width"
              />
              <Input
                type="number"
                value={formData.packagingSpec?.dimensions?.height || 0}
                onChange={(e) => updatePackagingSpec('dimensions', {
                  ...formData.packagingSpec?.dimensions,
                  height: parseFloat(e.target.value)
                })}
                placeholder="Height"
              />
              <Select 
                value={formData.packagingSpec?.dimensions?.unit || 'cm'} 
                onValueChange={(value) => updatePackagingSpec('dimensions', {
                  ...formData.packagingSpec?.dimensions,
                  unit: value as 'cm' | 'inch'
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cm">cm</SelectItem>
                  <SelectItem value="inch">inch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="printDetails">Print Details</Label>
              <Input
                id="printDetails"
                value={formData.packagingSpec?.printDetails || ''}
                onChange={(e) => updatePackagingSpec('printDetails', e.target.value)}
                placeholder="e.g., Full color logo, Barcode"
              />
            </div>

            <div className="flex items-center space-x-2 pt-6">
              <Checkbox
                id="recyclable"
                checked={formData.packagingSpec?.recyclable || false}
                onCheckedChange={(checked) => updatePackagingSpec('recyclable', checked)}
              />
              <label htmlFor="recyclable" className="text-sm">Recyclable</label>
            </div>
          </div>
        </div>
      )}

      {/* Notes field for all categories */}
      <div className="space-y-2 border-t pt-4">
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes || ''}
          onChange={(e) => updateFormField('notes', e.target.value)}
          placeholder="Special handling instructions, quality requirements, etc."
        />
      </div>
    </div>
  );
}