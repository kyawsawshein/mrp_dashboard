import { useState } from 'react';
import { finishedProducts, FinishedProduct } from '../data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Package, Search, AlertTriangle, TrendingUp, DollarSign, Box, ShoppingCart, Plus, Pencil, Trash2 } from 'lucide-react';
import { Progress } from '../components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';
import { toast } from 'sonner';

export default function ProductsPage() {
  const [products, setProducts] = useState<FinishedProduct[]>(finishedProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [vehicleFilter, setVehicleFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<FinishedProduct | null>(null);
  const [formData, setFormData] = useState<Partial<FinishedProduct>>({});

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesVehicle = vehicleFilter === 'all' || product.vehicleType === vehicleFilter;
    return matchesSearch && matchesCategory && matchesVehicle;
  });

  const categories = Array.from(new Set(products.map(p => p.category)));
  const vehicleTypes = Array.from(new Set(products.map(p => p.vehicleType)));
  
  const lowStockProducts = products.filter(p => p.status === 'low-stock' || p.status === 'out-of-stock');
  const totalInventoryValue = products.reduce((sum, p) => sum + (p.currentStock * p.retailPrice), 0);
  const totalProductsSold = products.reduce((sum, p) => sum + p.totalSold, 0);
  const avgMargin = products.reduce((sum, p) => {
    const margin = ((p.retailPrice - p.productionCost) / p.retailPrice) * 100;
    return sum + margin;
  }, 0) / products.length;

  // CRUD Operations
  const handleCreate = () => {
    setFormData({
      name: '',
      sku: '',
      category: '',
      vehicleType: '',
      currentStock: 0,
      unit: 'sets',
      minStock: 0,
      maxStock: 0,
      productionCost: 0,
      retailPrice: 0,
      lastProduced: new Date().toISOString().split('T')[0],
      totalProduced: 0,
      totalSold: 0,
      status: 'in-stock',
    });
    setIsCreateDialogOpen(true);
  };

  const handleEdit = (product: FinishedProduct) => {
    setSelectedProduct(product);
    setFormData({ ...product });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (product: FinishedProduct) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedProduct) {
      setProducts(products.filter(p => p.id !== selectedProduct.id));
      toast.success(`Product "${selectedProduct.name}" deleted successfully`);
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
    }
  };

  const saveProduct = () => {
    if (!formData.name || !formData.sku || !formData.category || !formData.vehicleType) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (isEditDialogOpen && selectedProduct) {
      // Update existing product
      setProducts(products.map(p => 
        p.id === selectedProduct.id ? { ...formData as FinishedProduct, id: selectedProduct.id } : p
      ));
      toast.success(`Product "${formData.name}" updated successfully`);
      setIsEditDialogOpen(false);
    } else {
      // Create new product
      const newProduct: FinishedProduct = {
        ...formData as FinishedProduct,
        id: `FP-${String(products.length + 1).padStart(3, '0')}`,
      };
      setProducts([...products, newProduct]);
      toast.success(`Product "${formData.name}" created successfully`);
      setIsCreateDialogOpen(false);
    }
    
    setFormData({});
    setSelectedProduct(null);
  };

  const updateFormField = (field: keyof FinishedProduct, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'out-of-stock': return 'bg-red-100 text-red-700 border-red-200';
      case 'low-stock': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'in-stock': return 'bg-green-100 text-green-700 border-green-200';
      case 'discontinued': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return '';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'out-of-stock': return 'Out of Stock';
      case 'low-stock': return 'Low Stock';
      case 'in-stock': return 'In Stock';
      case 'discontinued': return 'Discontinued';
      default: return status;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Finished Products Inventory</h1>
          <p className="text-gray-600 mt-2">Track finished car seat cover products ready for sale</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-600">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Box className="w-5 h-5 text-gray-500" />
              <span className="text-2xl font-bold">{products.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-yellow-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-600">Low/Out Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <span className="text-2xl font-bold text-yellow-600">{lowStockProducts.length}</span>
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
              <span className="text-2xl font-bold">${(totalInventoryValue / 1000).toFixed(0)}k</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-600">Avg Profit Margin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <span className="text-2xl font-bold text-blue-600">{avgMargin.toFixed(1)}%</span>
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
                placeholder="Search by name or SKU..."
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
            <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Vehicles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vehicles</SelectItem>
                {vehicleTypes.map(vt => (
                  <SelectItem key={vt} value={vt}>{vt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 text-xs font-semibold text-gray-600">Product</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-600">Category</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-600">Stock Level</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-600">Status</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-600">Pricing</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-600">Performance</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product, index) => {
                  const stockPercentage = (product.currentStock / product.maxStock) * 100;
                  const margin = ((product.retailPrice - product.productionCost) / product.retailPrice) * 100;
                  const sellThrough = (product.totalSold / product.totalProduced) * 100;

                  return (
                    <tr key={product.id} className={`border-b border-gray-200 hover:bg-gray-50 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                    }`}>
                      <td className="p-4">
                        <div>
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{product.sku}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              {product.vehicleType}
                            </Badge>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="text-xs">
                          {product.category}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="min-w-[160px]">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">
                              {product.currentStock} {product.unit}
                            </span>
                            <span className="text-xs text-gray-500">
                              / {product.maxStock}
                            </span>
                          </div>
                          <Progress value={stockPercentage} className="h-1.5" />
                          <div className="text-xs text-gray-500 mt-1">
                            Min: {product.minStock}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className={getStatusBadge(product.status)}>
                          {getStatusText(product.status)}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="text-sm">
                            <span className="text-gray-500">Retail:</span>{' '}
                            <span className="font-medium text-green-600">
                              ${product.retailPrice.toFixed(2)}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Cost: ${product.productionCost.toFixed(2)}
                          </div>
                          <div className="text-xs font-medium text-blue-600">
                            {margin.toFixed(1)}% margin
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <ShoppingCart className="w-3 h-3 text-gray-400" />
                            <span className="text-sm">
                              {product.totalSold} sold
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {product.totalProduced} produced
                          </div>
                          <div className="text-xs font-medium text-green-600">
                            {sellThrough.toFixed(1)}% sell-through
                          </div>
                          <div className="text-xs text-gray-500">
                            Last: {new Date(product.lastProduced).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          {(product.status === 'low-stock' || product.status === 'out-of-stock') && (
                            <Button size="sm" variant="default">
                              Schedule Production
                            </Button>
                          )}
                          <Button size="sm" variant="outline" onClick={() => handleEdit(product)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDelete(product)}>
                            <Trash2 className="w-4 h-4" />
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

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No products found matching your search criteria
        </div>
      )}

      {/* Create Product Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Product</DialogTitle>
            <DialogDescription>
              Add a new finished product to the inventory.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => updateFormField('name', e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={formData.sku || ''}
                onChange={(e) => updateFormField('sku', e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category">Category</Label>
              <div className="col-span-3">
                <Select
                                  value={formData.category || ''}
                  onValueChange={(value) => updateFormField('category', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="vehicleType">Vehicle Type</Label>
              <div className="col-span-3">
                <Select
                                  value={formData.vehicleType || ''}
                  onValueChange={(value) => updateFormField('vehicleType', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select vehicle type" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicleTypes.map(vt => (
                      <SelectItem key={vt} value={vt}>{vt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="currentStock">Current Stock</Label>
              <Input
                id="currentStock"
                type="number"
                value={formData.currentStock || 0}
                onChange={(e) => updateFormField('currentStock', parseInt(e.target.value))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                value={formData.unit || 'sets'}
                onChange={(e) => updateFormField('unit', e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="minStock">Min Stock</Label>
              <Input
                id="minStock"
                type="number"
                value={formData.minStock || 0}
                onChange={(e) => updateFormField('minStock', parseInt(e.target.value))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="maxStock">Max Stock</Label>
              <Input
                id="maxStock"
                type="number"
                value={formData.maxStock || 0}
                onChange={(e) => updateFormField('maxStock', parseInt(e.target.value))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="productionCost">Production Cost</Label>
              <Input
                id="productionCost"
                type="number"
                value={formData.productionCost || 0}
                onChange={(e) => updateFormField('productionCost', parseFloat(e.target.value))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="retailPrice">Retail Price</Label>
              <Input
                id="retailPrice"
                type="number"
                value={formData.retailPrice || 0}
                onChange={(e) => updateFormField('retailPrice', parseFloat(e.target.value))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lastProduced">Last Produced</Label>
              <Input
                id="lastProduced"
                type="date"
                value={formData.lastProduced || ''}
                onChange={(e) => updateFormField('lastProduced', e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="totalProduced">Total Produced</Label>
              <Input
                id="totalProduced"
                type="number"
                value={formData.totalProduced || 0}
                onChange={(e) => updateFormField('totalProduced', parseInt(e.target.value))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="totalSold">Total Sold</Label>
              <Input
                id="totalSold"
                type="number"
                value={formData.totalSold || 0}
                onChange={(e) => updateFormField('totalSold', parseInt(e.target.value))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status">Status</Label>
              <div className="col-span-3">
                <Select
                                  value={formData.status || ''}
                  onValueChange={(value) => updateFormField('status', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in-stock">In Stock</SelectItem>
                    <SelectItem value="low-stock">Low Stock</SelectItem>
                    <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                    <SelectItem value="discontinued">Discontinued</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={saveProduct}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update the details of the selected product.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => updateFormField('name', e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={formData.sku || ''}
                onChange={(e) => updateFormField('sku', e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category">Category</Label>
              <div className="col-span-3">
                <Select
                                  value={formData.category || ''}
                  onValueChange={(value) => updateFormField('category', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="vehicleType">Vehicle Type</Label>
              <div className="col-span-3">
                <Select
                                  value={formData.vehicleType || ''}
                  onValueChange={(value) => updateFormField('vehicleType', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select vehicle type" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicleTypes.map(vt => (
                      <SelectItem key={vt} value={vt}>{vt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="currentStock">Current Stock</Label>
              <Input
                id="currentStock"
                type="number"
                value={formData.currentStock || 0}
                onChange={(e) => updateFormField('currentStock', parseInt(e.target.value))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                value={formData.unit || 'sets'}
                onChange={(e) => updateFormField('unit', e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="minStock">Min Stock</Label>
              <Input
                id="minStock"
                type="number"
                value={formData.minStock || 0}
                onChange={(e) => updateFormField('minStock', parseInt(e.target.value))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="maxStock">Max Stock</Label>
              <Input
                id="maxStock"
                type="number"
                value={formData.maxStock || 0}
                onChange={(e) => updateFormField('maxStock', parseInt(e.target.value))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="productionCost">Production Cost</Label>
              <Input
                id="productionCost"
                type="number"
                value={formData.productionCost || 0}
                onChange={(e) => updateFormField('productionCost', parseFloat(e.target.value))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="retailPrice">Retail Price</Label>
              <Input
                id="retailPrice"
                type="number"
                value={formData.retailPrice || 0}
                onChange={(e) => updateFormField('retailPrice', parseFloat(e.target.value))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lastProduced">Last Produced</Label>
              <Input
                id="lastProduced"
                type="date"
                value={formData.lastProduced || ''}
                onChange={(e) => updateFormField('lastProduced', e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="totalProduced">Total Produced</Label>
              <Input
                id="totalProduced"
                type="number"
                value={formData.totalProduced || 0}
                onChange={(e) => updateFormField('totalProduced', parseInt(e.target.value))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="totalSold">Total Sold</Label>
              <Input
                id="totalSold"
                type="number"
                value={formData.totalSold || 0}
                onChange={(e) => updateFormField('totalSold', parseInt(e.target.value))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status">Status</Label>
              <div className="col-span-3">
                <Select
                                  value={formData.status || ''}
                  onValueChange={(value) => updateFormField('status', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in-stock">In Stock</SelectItem>
                    <SelectItem value="low-stock">Low Stock</SelectItem>
                    <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                    <SelectItem value="discontinued">Discontinued</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={saveProduct}>
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Product Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product from the inventory.
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