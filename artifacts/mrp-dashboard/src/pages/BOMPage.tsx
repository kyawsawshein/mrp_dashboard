import { useState } from 'react';
import { useNavigate } from 'react-router';
import { boms, BOM, BOMItem, inventoryItems } from '../data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Plus, Pencil, Trash2, Copy, FileText, DollarSign, Package, Search, Eye } from 'lucide-react';
import { toast } from 'sonner';

export default function BOMPage() {
  const navigate = useNavigate();
  const [bomList, setBomList] = useState<BOM[]>(boms);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBOM, setSelectedBOM] = useState<BOM | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<BOM>>({});
  const [itemFormData, setItemFormData] = useState<Partial<BOMItem>>({});

  // Filter BOMs
  const filteredBOMs = bomList.filter(bom => {
    const matchesSearch = bom.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bom.productSKU.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bom.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || bom.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // CRUD Operations
  const handleCreate = () => {
    setFormData({
      version: '1.0',
      status: 'draft',
      effectiveDate: new Date().toISOString().split('T')[0],
      createdBy: 'Current User',
      createdDate: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0],
      items: [],
      totalMaterialCost: 0,
      laborCost: 0,
      overheadCost: 0,
      totalCost: 0,
    });
    setIsCreateDialogOpen(true);
  };

  const handleView = (bom: BOM) => {
    setSelectedBOM(bom);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (bom: BOM) => {
    setSelectedBOM(bom);
    setFormData({ ...bom });
    setIsEditDialogOpen(true);
  };

  const handleCopy = (bom: BOM) => {
    const newVersion = `${parseInt(bom.version) + 0.1}`;
    const newBOM: BOM = {
      ...bom,
      id: `BOM-${String(bomList.length + 1).padStart(3, '0')}`,
      version: newVersion,
      status: 'draft',
      createdDate: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0],
    };
    setBomList([...bomList, newBOM]);
    toast.success(`BOM copied as version ${newVersion}`);
  };

  const handleDelete = (bom: BOM) => {
    setSelectedBOM(bom);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedBOM) {
      setBomList(bomList.filter(b => b.id !== selectedBOM.id));
      toast.success(`BOM "${selectedBOM.id}" deleted successfully`);
      setIsDeleteDialogOpen(false);
      setSelectedBOM(null);
    }
  };

  const saveBOM = () => {
    if (!formData.productName || !formData.productSKU) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Calculate totals
    const items = formData.items || [];
    const totalMaterialCost = items.reduce((sum, item) => sum + (item.quantity * item.costPerUnit * (1 + item.scrapFactor / 100)), 0);
    const totalCost = totalMaterialCost + (formData.laborCost || 0) + (formData.overheadCost || 0);

    if (isEditDialogOpen && selectedBOM) {
      // Update existing BOM
      const updatedBOM: BOM = {
        ...selectedBOM,
        ...formData as BOM,
        totalMaterialCost,
        totalCost,
        lastModified: new Date().toISOString().split('T')[0],
      };
      setBomList(bomList.map(b => b.id === selectedBOM.id ? updatedBOM : b));
      toast.success(`BOM "${selectedBOM.id}" updated successfully`);
      setIsEditDialogOpen(false);
    } else {
      // Create new BOM
      const newBOM: BOM = {
        ...formData as BOM,
        id: `BOM-${String(bomList.length + 1).padStart(3, '0')}`,
        productId: `FP-${String(bomList.length + 1).padStart(3, '0')}`,
        items: formData.items || [],
        totalMaterialCost,
        totalCost,
      };
      setBomList([...bomList, newBOM]);
      toast.success(`BOM "${newBOM.id}" created successfully`);
      setIsCreateDialogOpen(false);
    }
    
    setFormData({});
    setSelectedBOM(null);
  };

  const updateFormField = (field: keyof BOM, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  // BOM Item Management
  const handleAddItem = () => {
    setItemFormData({
      quantity: 0,
      scrapFactor: 5,
    });
    setIsAddItemDialogOpen(true);
  };

  const saveItem = () => {
    if (!itemFormData.materialId || !itemFormData.quantity) {
      toast.error('Please fill in all required fields');
      return;
    }

    const inventory = inventoryItems.find(i => i.id === itemFormData.materialId);
    if (!inventory) {
      toast.error('Invalid material selected');
      return;
    }

    const newItem: BOMItem = {
      id: `${formData.id || 'BOM-NEW'}-${String((formData.items?.length || 0) + 1).padStart(2, '0')}`,
      materialId: itemFormData.materialId!,
      materialName: inventory.name,
      quantity: itemFormData.quantity!,
      unit: inventory.unit,
      scrapFactor: itemFormData.scrapFactor || 5,
      costPerUnit: inventory.costPerUnit,
      notes: itemFormData.notes,
    };

    setFormData({
      ...formData,
      items: [...(formData.items || []), newItem],
    });
    
    setItemFormData({});
    setIsAddItemDialogOpen(false);
    toast.success('Material added to BOM');
  };

  const removeItem = (itemId: string) => {
    setFormData({
      ...formData,
      items: (formData.items || []).filter(item => item.id !== itemId),
    });
    toast.info('Material removed from BOM');
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      'active': 'bg-green-100 text-green-700 border-green-200',
      'draft': 'bg-blue-100 text-blue-700 border-blue-200',
      'obsolete': 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return variants[status] || '';
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-lg sm:text-xl lg:text-2xl lg:text-xl sm:text-lg sm:text-xl lg:text-2xl lg:text-3xl font-bold text-gray-900">Bill of Materials (BOM)</h1>
          <p className="text-gray-600 mt-2">Manage product BOMs and material requirements</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Create BOM
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-600">Total BOMs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-lg sm:text-xl lg:text-2xl font-bold">{bomList.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-600">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-lg sm:text-xl lg:text-2xl font-bold text-green-600">
              {bomList.filter(b => b.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-600">Draft</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">
              {bomList.filter(b => b.status === 'draft').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-600">Obsolete</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-lg sm:text-xl lg:text-2xl font-bold text-gray-600">
              {bomList.filter(b => b.status === 'obsolete').length}
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
                placeholder="Search by product name, SKU, or BOM ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="obsolete">Obsolete</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* BOMs Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 text-xs font-semibold text-gray-600">BOM ID</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-600">Product</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-600">SKU</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-600">Version</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-600">Status</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-600">Materials</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-600">Total Cost</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-600">Last Modified</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBOMs.map((bom, index) => (
                  <tr key={bom.id} className={`border-b border-gray-200 hover:bg-gray-50 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                  }`}>
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{bom.id}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{bom.productName}</div>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="text-xs">
                        {bom.productSKU}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-medium">{bom.version}</span>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className={getStatusBadge(bom.status)}>
                        {bom.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{bom.items.length} items</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium">${bom.totalCost.toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-xs text-gray-500">
                        {new Date(bom.lastModified).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button size="sm" variant="default" onClick={() => navigate(`/bom/${bom.id}`)}>
                          <Eye className="w-4 h-4 mr-1" />
                          Details
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEdit(bom)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleCopy(bom)}>
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(bom)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* View BOM Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>BOM Details - {selectedBOM?.id}</DialogTitle>
            <DialogDescription>
              {selectedBOM?.productName} ({selectedBOM?.productSKU})
            </DialogDescription>
          </DialogHeader>

          {selectedBOM && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs text-gray-600">Version</Label>
                  <p className="font-medium">{selectedBOM.version}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Status</Label>
                  <Badge variant="outline" className={getStatusBadge(selectedBOM.status)}>
                    {selectedBOM.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Effective Date</Label>
                  <p className="font-medium">{new Date(selectedBOM.effectiveDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-3">Bill of Materials</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Material</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead className="text-right">Scrap %</TableHead>
                      <TableHead className="text-right">Cost/Unit</TableHead>
                      <TableHead className="text-right">Total Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedBOM.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.materialName}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell className="text-right">{item.scrapFactor}%</TableCell>
                        <TableCell className="text-right">${item.costPerUnit.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          ${(item.quantity * item.costPerUnit * (1 + item.scrapFactor / 100)).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Material Cost:</span>
                    <span className="font-medium">${selectedBOM.totalMaterialCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Labor Cost:</span>
                    <span className="font-medium">${selectedBOM.laborCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Overhead Cost:</span>
                    <span className="font-medium">${selectedBOM.overheadCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold border-t pt-2">
                    <span>Total Cost:</span>
                    <span>${selectedBOM.totalCost.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {selectedBOM.notes && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <Label className="text-xs text-gray-600">Notes</Label>
                  <p className="text-sm mt-1">{selectedBOM.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit BOM Dialog */}
      <Dialog open={isEditDialogOpen || isCreateDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        setIsCreateDialogOpen(open);
      }}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditDialogOpen ? 'Edit BOM' : 'Create New BOM'}</DialogTitle>
            <DialogDescription>
              {isEditDialogOpen ? 'Update BOM details' : 'Create a new Bill of Materials'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="productName">Product Name *</Label>
                <Input
                  id="productName"
                  value={formData.productName || ''}
                  onChange={(e) => updateFormField('productName', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="productSKU">Product SKU *</Label>
                <Input
                  id="productSKU"
                  value={formData.productSKU || ''}
                  onChange={(e) => updateFormField('productSKU', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="version">Version</Label>
                <Input
                  id="version"
                  value={formData.version || ''}
                  onChange={(e) => updateFormField('version', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => updateFormField('status', value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="obsolete">Obsolete</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="effectiveDate">Effective Date</Label>
                <Input
                  id="effectiveDate"
                  type="date"
                  value={formData.effectiveDate || ''}
                  onChange={(e) => updateFormField('effectiveDate', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="laborCost">Labor Cost ($)</Label>
                <Input
                  id="laborCost"
                  type="number"
                  step="0.01"
                  value={formData.laborCost || 0}
                  onChange={(e) => updateFormField('laborCost', parseFloat(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="overheadCost">Overhead Cost ($)</Label>
                <Input
                  id="overheadCost"
                  type="number"
                  step="0.01"
                  value={formData.overheadCost || 0}
                  onChange={(e) => updateFormField('overheadCost', parseFloat(e.target.value))}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Materials</Label>
                <Button size="sm" variant="outline" onClick={handleAddItem}>
                  <Plus className="w-3 h-3 mr-1" />
                  Add Material
                </Button>
              </div>
              
              {formData.items && formData.items.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Material</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Scrap %</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formData.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.materialName}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell>{item.scrapFactor}%</TableCell>
                        <TableCell>${(item.quantity * item.costPerUnit).toFixed(2)}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost" onClick={() => removeItem(item.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center p-4 border border-dashed rounded text-gray-500 text-sm">
                  No materials added yet. Click "Add Material" to start building the BOM.
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => updateFormField('notes', e.target.value)}
                rows={3}
                placeholder="Add any special instructions or notes..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false);
              setIsCreateDialogOpen(false);
            }}>
              Cancel
            </Button>
            <Button onClick={saveBOM}>
              {isEditDialogOpen ? 'Save Changes' : 'Create BOM'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Material Dialog */}
      <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Material to BOM</DialogTitle>
            <DialogDescription>Select material and specify quantity</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="material">Material *</Label>
              <Select
                value={itemFormData.materialId}
                onValueChange={(value) => setItemFormData({ ...itemFormData, materialId: value })}
              >
                <SelectTrigger id="material">
                  <SelectValue placeholder="Select material" />
                </SelectTrigger>
                <SelectContent>
                  {inventoryItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} - ${item.costPerUnit}/{item.unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.1"
                  value={itemFormData.quantity || 0}
                  onChange={(e) => setItemFormData({ ...itemFormData, quantity: parseFloat(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scrapFactor">Scrap Factor (%)</Label>
                <Input
                  id="scrapFactor"
                  type="number"
                  step="1"
                  value={itemFormData.scrapFactor || 5}
                  onChange={(e) => setItemFormData({ ...itemFormData, scrapFactor: parseFloat(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="itemNotes">Notes</Label>
              <Textarea
                id="itemNotes"
                value={itemFormData.notes || ''}
                onChange={(e) => setItemFormData({ ...itemFormData, notes: e.target.value })}
                rows={2}
                placeholder="Optional notes for this material..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddItemDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveItem}>Add Material</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete BOM</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete BOM "{selectedBOM?.id}" for {selectedBOM?.productName}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}