import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { 
  departments, 
  finishedProducts, 
  calculateMaterialRequirements,
  calculateProductionCost,
  canProduceOrder 
} from '../data/mockData';
import { Plus, AlertTriangle, CheckCircle2, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

export function CreateOrderDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    department: '',
    priority: 'medium',
    startDate: '',
    endDate: '',
  });

  const selectedProduct = finishedProducts.find(p => p.id === formData.productId);
  const quantity = parseInt(formData.quantity) || 0;
  
  // Calculate material requirements when product and quantity selected
  const materialRequirements = selectedProduct && quantity > 0
    ? calculateMaterialRequirements(selectedProduct.id, quantity)
    : [];

  const productionCheck = selectedProduct && quantity > 0
    ? canProduceOrder(selectedProduct.id, quantity)
    : { canProduce: false, missingMaterials: [] };

  const costBreakdown = selectedProduct && quantity > 0
    ? calculateProductionCost(selectedProduct.id, quantity)
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.productId || !formData.quantity || !formData.department || !formData.startDate || !formData.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!productionCheck.canProduce) {
      toast.error('Cannot create order: Material shortages detected', {
        description: 'Please review material requirements and ensure sufficient stock',
      });
      return;
    }

    // Generate MO ID
    const moId = `MO-2026-${String(Math.floor(Math.random() * 900) + 100)}`;

    toast.success(`Manufacturing Order ${moId} created successfully!`, {
      description: `${selectedProduct?.name} - ${formData.quantity} units`,
    });

    // Reset form and close
    setFormData({
      productId: '',
      quantity: '',
      department: '',
      priority: 'medium',
      startDate: '',
      endDate: '',
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Order
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Manufacturing Order</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="product">Product *</Label>
              <Select
                value={formData.productId}
                onValueChange={(value) => setFormData({ ...formData, productId: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select product to manufacture" />
                </SelectTrigger>
                <SelectContent>
                  {finishedProducts.map(product => (
                    <SelectItem key={product.id} value={product.id}>
                      <div className="flex items-center justify-between gap-4">
                        <span>{product.name}</span>
                        <span className="text-xs text-gray-500">{product.sku}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedProduct && (
                <p className="text-sm text-gray-600 mt-1">
                  SKU: {selectedProduct.sku} | Category: {selectedProduct.category} | Vehicle: {selectedProduct.vehicleType}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="Units to produce"
                required
              />
            </div>

            <div>
              <Label htmlFor="department">Department *</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => setFormData({ ...formData, department: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Priority Level</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                min={formData.startDate}
                required
              />
            </div>
          </div>

          {/* Production Cost Summary */}
          {costBreakdown && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-4 h-4 text-gray-600" />
                <h4 className="font-medium text-gray-900">Production Cost Estimate</h4>
              </div>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Materials</p>
                  <p className="font-medium text-gray-900">${costBreakdown.materialCost.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Labor</p>
                  <p className="font-medium text-gray-900">${costBreakdown.laborCost.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Overhead</p>
                  <p className="font-medium text-gray-900">${costBreakdown.overheadCost.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Total Cost</p>
                  <p className="font-medium text-green-600 text-lg">${costBreakdown.totalCost.toFixed(2)}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Cost per unit: ${costBreakdown.costPerUnit.toFixed(2)}
              </p>
            </div>
          )}

          {/* Material Requirements */}
          {materialRequirements.length > 0 && (
            <div className="border border-gray-200 rounded-lg">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">Material Requirements (Auto-calculated from BOM)</h4>
                  {productionCheck.canProduce ? (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      All materials available
                    </Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800 border-red-200">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      {productionCheck.missingMaterials.length} shortages
                    </Badge>
                  )}
                </div>
              </div>
              <div className="p-4">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr className="text-left text-gray-600">
                      <th className="pb-2 font-medium">Material</th>
                      <th className="pb-2 font-medium text-right">Required</th>
                      <th className="pb-2 font-medium text-right">Available</th>
                      <th className="pb-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materialRequirements.map((req) => (
                      <tr key={req.materialId} className="border-b last:border-0">
                        <td className="py-2">
                          <div>
                            <p className="font-medium text-gray-900">{req.materialName}</p>
                            <p className="text-xs text-gray-500">{req.materialId}</p>
                          </div>
                        </td>
                        <td className="py-2 text-right">
                          <span className="font-medium">{req.required}</span>
                          <span className="text-gray-500 ml-1">{req.unit}</span>
                        </td>
                        <td className="py-2 text-right">
                          <span className="font-medium">{req.available}</span>
                          <span className="text-gray-500 ml-1">{req.unit}</span>
                        </td>
                        <td className="py-2">
                          {req.status === 'sufficient' ? (
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Sufficient
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800 border-red-200">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Short: {req.shortfall} {req.unit}
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!selectedProduct && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Select a product</strong> to view material requirements and production cost estimates
              </p>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={!productionCheck.canProduce && materialRequirements.length > 0}
            >
              Create Order
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
