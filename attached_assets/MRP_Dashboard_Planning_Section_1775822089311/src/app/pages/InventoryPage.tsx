import React, { useState } from 'react';
import { inventoryItems, InventoryItem, FabricSpecification, FoamSpecification, FastenerSpecification, ThreadSpecification, PackagingSpecification } from '../data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Package, Search, AlertTriangle, TrendingDown, TrendingUp, DollarSign, Plus, Pencil, Trash2, Printer, Copy } from 'lucide-react';
import { Progress } from '../components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';
import { toast } from 'sonner';
import { MaterialFormFields } from '../components/MaterialFormFields';
import { ResizableDialog } from '../components/ResizableDialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '../components/ui/tooltip';

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>(inventoryItems);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState<Partial<InventoryItem>>({});
  
  // Dialog size persistence
  const [dialogSize, setDialogSize] = useState({ width: 1200, height: 800 });

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(items.map(i => i.category)));
  
  const lowStockItems = items.filter(i => i.currentStock < i.reorderPoint);
  const totalValue = items.reduce((sum, i) => sum + (i.currentStock * i.costPerUnit), 0);
  const itemsNeedingReorder = lowStockItems.length;

  // CRUD Operations
  const handleCreate = () => {
    setFormData({
      name: '',
      sku: '',
      category: 'fabric',
      supplier: '',
      currentStock: 0,
      unit: '',
      minStock: 0,
      maxStock: 0,
      reorderPoint: 0,
      leadTimeDays: 14,
      costPerUnit: 0,
      currency: 'USD',
      lastPurchaseDate: new Date().toISOString().split('T')[0],
      status: 'in-stock',
    });
    setIsCreateDialogOpen(true);
  };

  const handleEdit = (item: InventoryItem) => {
    setSelectedItem(item);
    setFormData({ ...item });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };

  const handleCopy = (item: InventoryItem) => {
    // Create a copy with modified SKU and name
    const copiedItem = {
      ...item,
      name: `${item.name} (Copy)`,
      sku: `${item.sku}-COPY`,
      currentStock: 0, // Reset stock for copied item
      lastPurchaseDate: new Date().toISOString().split('T')[0],
    };
    
    setFormData(copiedItem);
    setIsCreateDialogOpen(true);
    toast.info('Material duplicated. Update the name and SKU before saving.');
  };

  const confirmDelete = () => {
    if (selectedItem) {
      setItems(items.filter(i => i.id !== selectedItem.id));
      toast.success(`Material "${selectedItem.name}" deleted successfully`);
      setIsDeleteDialogOpen(false);
      setSelectedItem(null);
    }
  };

  const saveItem = () => {
    if (!formData.name || !formData.category || !formData.unit || !formData.supplier) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (isEditDialogOpen && selectedItem) {
      // Update existing item
      setItems(items.map(i => 
        i.id === selectedItem.id ? { ...formData as InventoryItem, id: selectedItem.id } : i
      ));
      toast.success(`Material "${formData.name}" updated successfully`);
      setIsEditDialogOpen(false);
    } else {
      // Create new item
      const newItem: InventoryItem = {
        ...formData as InventoryItem,
        id: `INV-${String(items.length + 1).padStart(3, '0')}`,
      };
      setItems([...items, newItem]);
      toast.success(`Material "${formData.name}" created successfully`);
      setIsCreateDialogOpen(false);
    }
    
    setFormData({});
    setSelectedItem(null);
  };

  const updateFormField = (field: keyof InventoryItem, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  // Helpers for category-specific spec updates
  const updateFabricSpec = (field: keyof FabricSpecification, value: any) => {
    setFormData({
      ...formData,
      fabricSpec: { ...formData.fabricSpec, [field]: value } as FabricSpecification
    });
  };

  const updateFoamSpec = (field: keyof FoamSpecification, value: any) => {
    setFormData({
      ...formData,
      foamSpec: { ...formData.foamSpec, [field]: value } as FoamSpecification
    });
  };

  const updateFastenerSpec = (field: keyof FastenerSpecification, value: any) => {
    setFormData({
      ...formData,
      fastenerSpec: { ...formData.fastenerSpec, [field]: value } as FastenerSpecification
    });
  };

  const updateThreadSpec = (field: keyof ThreadSpecification, value: any) => {
    setFormData({
      ...formData,
      threadSpec: { ...formData.threadSpec, [field]: value } as ThreadSpecification
    });
  };

  const updatePackagingSpec = (field: keyof PackagingSpecification, value: any) => {
    setFormData({
      ...formData,
      packagingSpec: { ...formData.packagingSpec, [field]: value } as PackagingSpecification
    });
  };

  const getStockStatus = (item: typeof inventoryItems[0]) => {
    const percentage = (item.currentStock / item.maxStock) * 100;
    if (item.currentStock < item.reorderPoint) return 'critical';
    if (percentage < 40) return 'low';
    if (percentage < 70) return 'medium';
    return 'good';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'low': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'medium': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'good': return 'bg-green-100 text-green-700 border-green-200';
      default: return '';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'critical': return 'Critical';
      case 'low': return 'Low Stock';
      case 'medium': return 'Medium';
      case 'good': return 'Good';
      default: return '';
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-2">Track material stock levels, reorder points, and inventory value</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add Material
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-600">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-gray-500" />
              <span className="text-2xl font-bold">{inventoryItems.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-600">Need Reorder</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span className="text-2xl font-bold text-red-600">{itemsNeedingReorder}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-600">Inventory Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              <span className="text-2xl font-bold">${totalValue.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-600">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-500" />
              <span className="text-2xl font-bold">{categories.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 text-xs font-semibold text-gray-600">Item</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-600">Category</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-600">Stock Level</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-600">Status</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-600">Supplier</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-600">Cost/Unit</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-600">Value</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item, index) => {
                  const status = getStockStatus(item);
                  const stockPercentage = (item.currentStock / item.maxStock) * 100;
                  const totalValue = item.currentStock * item.costPerUnit;

                  return (
                    <tr key={item.id} className={`border-b border-gray-200 hover:bg-gray-50 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                    }`}>
                      <td className="p-4">
                        <div>
                          <div className="font-medium text-gray-900">{item.name}</div>
                          <div className="text-xs text-gray-500">{item.id}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="min-w-[180px]">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">
                              {item.currentStock} {item.unit}
                            </span>
                            <span className="text-xs text-gray-500">
                              / {item.maxStock}
                            </span>
                          </div>
                          <Progress value={stockPercentage} className="h-1.5" />
                          <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                            {item.currentStock < item.reorderPoint ? (
                              <>
                                <TrendingDown className="w-3 h-3 text-red-500" />
                                <span className="text-red-600">Below reorder point ({item.reorderPoint})</span>
                              </>
                            ) : (
                              <>
                                <TrendingUp className="w-3 h-3 text-green-500" />
                                <span>Above reorder point</span>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className={getStatusBadge(status)}>
                          {getStatusText(status)}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-900">{item.supplier}</div>
                        <div className="text-xs text-gray-500">
                          Last: {item.lastPurchaseDate ? new Date(item.lastPurchaseDate).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-medium">
                          ${item.costPerUnit.toFixed(2)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-medium text-green-600">
                          ${totalValue.toLocaleString()}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          {status === 'critical' && (
                            <Button size="sm" variant="default" title="Place reorder for critical stock">
                              Reorder
                            </Button>
                          )}
                          <Button size="sm" variant="outline" onClick={() => handleEdit(item)} title="Edit Material">
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleCopy(item)} title="Duplicate Material">
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDelete(item)} title="Delete Material">
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {filteredItems.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No items found matching your search criteria
        </div>
      )}

      {/* Create Dialog */}
      <ResizableDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen} 
        title="Create New Material"
        description="Add a new material to the inventory with complete specifications"
        size={dialogSize} 
        onResize={setDialogSize}
        footer={
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={saveItem}>
              Create Material
            </Button>
          </DialogFooter>
        }
      >
        <MaterialFormFields 
          formData={formData} 
          updateFormField={updateFormField}
          updateFabricSpec={updateFabricSpec}
          updateFoamSpec={updateFoamSpec}
          updateFastenerSpec={updateFastenerSpec}
          updateThreadSpec={updateThreadSpec}
          updatePackagingSpec={updatePackagingSpec}
        />
      </ResizableDialog>

      {/* Edit Dialog */}
      <ResizableDialog 
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen} 
        title="Edit Material"
        description="Update material details and specifications"
        size={dialogSize} 
        onResize={setDialogSize}
        footer={
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={saveItem}>
              Update Material
            </Button>
          </DialogFooter>
        }
      >
        <MaterialFormFields 
          formData={formData} 
          updateFormField={updateFormField}
          updateFabricSpec={updateFabricSpec}
          updateFoamSpec={updateFoamSpec}
          updateFastenerSpec={updateFastenerSpec}
          updateThreadSpec={updateThreadSpec}
          updatePackagingSpec={updatePackagingSpec}
        />
      </ResizableDialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the material from the inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}