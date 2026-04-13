import { useParams } from 'react-router';
import { manufacturingOrders, ManufacturingOrder, departments as allDepartments } from '../data/mockData';
import { MOCard } from '../components/MOCard';
import { MaterialRequirements } from '../components/MaterialRequirements';
import { OrderHistory } from '../components/OrderHistory';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useState } from 'react';
import { AlertCircle, CheckCircle2, Clock, Package, Pencil, AlertTriangle, RotateCcw, Ban, Play, Pause } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { ScrapReworkDialog } from '../components/ScrapReworkDialog';
import { toast } from 'sonner';

const departmentNames: Record<string, string> = {
  'cnc-cutting': 'CNC Cutting',
  'sewing-1': 'Sewing Dept 1',
  'sewing-2': 'Sewing Dept 2',
  'sewing-3': 'Sewing Dept 3',
  'sewing-4': 'Sewing Dept 4',
  'airbag': 'Airbag Section',
  'embroidery': 'Embroidery',
  'qc': 'Quality Control',
  'packing': 'Packing',
};

export default function DepartmentPlanning() {
  const { departmentId } = useParams<{ departmentId: string }>();
  const [orders, setOrders] = useState<ManufacturingOrder[]>(manufacturingOrders);
  const [selectedMO, setSelectedMO] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isScrapDialogOpen, setIsScrapDialogOpen] = useState(false);
  const [isReworkDialogOpen, setIsReworkDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<ManufacturingOrder>>({});

  const departmentOrders = orders.filter(
    (order) => order.department === departmentId
  );

  const departmentName = departmentNames[departmentId || ''] || 'Department';

  const stats = {
    total: departmentOrders.length,
    planned: departmentOrders.filter(o => o.status === 'planned').length,
    inProgress: departmentOrders.filter(o => o.status === 'in-progress').length,
    delayed: departmentOrders.filter(o => o.status === 'delayed').length,
    completed: departmentOrders.filter(o => o.status === 'completed').length,
    onHold: departmentOrders.filter(o => o.status === 'on-hold').length,
    rework: departmentOrders.filter(o => o.status === 'rework').length,
  };

  const selectedOrder = selectedMO 
    ? departmentOrders.find(o => o.id === selectedMO)
    : null;

  // CRUD Operations
  const handleEdit = () => {
    if (selectedOrder) {
      setFormData({ ...selectedOrder });
      setIsEditDialogOpen(true);
    }
  };

  const handleStatusChange = (newStatus: ManufacturingOrder['status']) => {
    if (!selectedOrder) return;

    const updatedOrder = { ...selectedOrder, status: newStatus };
    updateOrder(updatedOrder);
    
    const statusLabels = {
      'planned': 'Planned',
      'in-progress': 'In Progress',
      'completed': 'Completed',
      'delayed': 'Delayed',
      'on-hold': 'On Hold',
      'cancelled': 'Cancelled',
      'rework': 'Rework',
    };
    
    toast.success(`Order ${selectedOrder.id} status updated to ${statusLabels[newStatus]}`);
  };

  const handleCancelOrder = () => {
    setIsCancelDialogOpen(true);
  };

  const confirmCancel = () => {
    if (!selectedOrder) return;

    const cancelReason = (document.getElementById('cancel-reason') as HTMLTextAreaElement)?.value;
    
    const updatedOrder: ManufacturingOrder = {
      ...selectedOrder,
      status: 'cancelled',
      cancellationReason: cancelReason,
    };

    updateOrder(updatedOrder);
    toast.success(`Order ${selectedOrder.id} has been cancelled`);
    setIsCancelDialogOpen(false);
  };

  const saveEdit = () => {
    if (!formData.product || !formData.quantity || !formData.startDate || !formData.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (selectedOrder) {
      const updatedOrder: ManufacturingOrder = {
        ...selectedOrder,
        ...formData as ManufacturingOrder,
      };
      updateOrder(updatedOrder);
      toast.success(`Order ${selectedOrder.id} updated successfully`);
      setIsEditDialogOpen(false);
    }
  };

  const updateOrder = (updatedOrder: ManufacturingOrder) => {
    setOrders(orders.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    setSelectedMO(updatedOrder.id); // Keep selection
  };

  const updateFormField = (field: keyof ManufacturingOrder, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      'planned': 'bg-blue-100 text-blue-700 border-blue-200',
      'in-progress': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'completed': 'bg-green-100 text-green-700 border-green-200',
      'delayed': 'bg-red-100 text-red-700 border-red-200',
      'on-hold': 'bg-gray-100 text-gray-700 border-gray-200',
      'cancelled': 'bg-red-200 text-red-800 border-red-300',
      'rework': 'bg-orange-100 text-orange-700 border-orange-200',
    };
    return variants[status] || '';
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-xl sm:text-lg sm:text-xl lg:text-2xl lg:text-xl sm:text-lg sm:text-xl lg:text-2xl lg:text-3xl font-bold text-gray-900">{departmentName} Planning</h1>
        <p className="text-gray-600 mt-2">Manufacturing orders and material requirements</p>
      </div>

      {/* Department Stats */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-600">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-gray-500" />
              <span className="text-xl sm:text-lg sm:text-xl lg:text-2xl font-bold">{stats.total}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-600">Planned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <span className="text-xl sm:text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">{stats.planned}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-600">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-yellow-500" />
              <span className="text-xl sm:text-lg sm:text-xl lg:text-2xl font-bold text-yellow-600">{stats.inProgress}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-600">Delayed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-xl sm:text-lg sm:text-xl lg:text-2xl font-bold text-red-600">{stats.delayed}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-600">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="text-xl sm:text-lg sm:text-xl lg:text-2xl font-bold text-green-600">{stats.completed}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-3 gap-6">
        {/* Manufacturing Orders List */}
        <div className="col-span-1 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Manufacturing Orders</h2>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="planned">Planned</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-3 mt-4">
              {departmentOrders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => setSelectedMO(order.id)}
                  className={`cursor-pointer transition-all ${
                    selectedMO === order.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <MOCard order={order} />
                </div>
              ))}
            </TabsContent>
            
            <TabsContent value="active" className="space-y-3 mt-4">
              {departmentOrders
                .filter(o => o.status === 'in-progress' || o.status === 'delayed' || o.status === 'rework')
                .map((order) => (
                  <div
                    key={order.id}
                    onClick={() => setSelectedMO(order.id)}
                    className={`cursor-pointer transition-all ${
                      selectedMO === order.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <MOCard order={order} />
                  </div>
                ))}
            </TabsContent>
            
            <TabsContent value="planned" className="space-y-3 mt-4">
              {departmentOrders
                .filter(o => o.status === 'planned')
                .map((order) => (
                  <div
                    key={order.id}
                    onClick={() => setSelectedMO(order.id)}
                    className={`cursor-pointer transition-all ${
                      selectedMO === order.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <MOCard order={order} />
                  </div>
                ))}
            </TabsContent>
          </Tabs>
        </div>

        {/* Details Panel */}
        <div className="col-span-2">
          {selectedOrder ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{selectedOrder.product}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">{selectedOrder.id}</p>
                    <Badge className={`mt-2 ${getStatusBadge(selectedOrder.status)}`}>
                      {selectedOrder.status.replace('-', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Quantity</p>
                    <p className="text-xl sm:text-lg sm:text-xl lg:text-2xl font-bold">{selectedOrder.quantity}</p>
                    <p className="text-xs text-gray-500">units</p>
                    {(selectedOrder.scrapQuantity || selectedOrder.reworkQuantity) && (
                      <div className="mt-2 text-xs">
                        {selectedOrder.scrapQuantity && selectedOrder.scrapQuantity > 0 && (
                          <p className="text-red-600">Scrap: {selectedOrder.scrapQuantity}</p>
                        )}
                        {selectedOrder.reworkQuantity && selectedOrder.reworkQuantity > 0 && (
                          <p className="text-yellow-600">Rework: {selectedOrder.reworkQuantity}</p>
                        )}
                        <p className="font-medium mt-1">Net: {selectedOrder.actualQuantityProduced || selectedOrder.quantity}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Action Buttons */}
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" onClick={handleEdit}>
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit Order
                  </Button>
                  
                  {selectedOrder.status === 'planned' && (
                    <Button size="sm" variant="outline" onClick={() => handleStatusChange('in-progress')}>
                      <Play className="w-4 h-4 mr-2" />
                      Start Order
                    </Button>
                  )}
                  
                  {selectedOrder.status === 'in-progress' && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => handleStatusChange('on-hold')}>
                        <Pause className="w-4 h-4 mr-2" />
                        Put On Hold
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleStatusChange('completed')}>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Complete
                      </Button>
                    </>
                  )}
                  
                  {selectedOrder.status === 'on-hold' && (
                    <Button size="sm" variant="outline" onClick={() => handleStatusChange('in-progress')}>
                      <Play className="w-4 h-4 mr-2" />
                      Resume
                    </Button>
                  )}
                  
                  {(selectedOrder.status === 'in-progress' || selectedOrder.status === 'delayed') && (
                    <>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => setIsScrapDialogOpen(true)}
                      >
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Report Scrap
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-orange-300 text-orange-700 hover:bg-orange-50"
                        onClick={() => setIsReworkDialogOpen(true)}
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Initiate Rework
                      </Button>
                    </>
                  )}
                  
                  {selectedOrder.status !== 'completed' && selectedOrder.status !== 'cancelled' && (
                    <Button size="sm" variant="destructive" onClick={handleCancelOrder}>
                      <Ban className="w-4 h-4 mr-2" />
                      Cancel Order
                    </Button>
                  )}
                </div>

                {/* Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-semibold">{selectedOrder.completion}%</span>
                  </div>
                  <Progress value={selectedOrder.completion} />
                </div>

                {/* Timeline Info */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Start Date</p>
                    <p className="font-semibold">
                      {new Date(selectedOrder.startDate).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">End Date</p>
                    <p className="font-semibold">
                      {new Date(selectedOrder.endDate).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {/* Material Requirements */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Material Requirements</h3>
                  <MaterialRequirements materials={selectedOrder.materials} />
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-sm text-gray-600">Priority Level</p>
                    <p className="font-semibold capitalize mt-1">{selectedOrder.priority}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Current Status</p>
                    <p className="font-semibold capitalize mt-1">
                      {selectedOrder.status.replace('-', ' ')}
                    </p>
                  </div>
                </div>

                {/* Defect Notes */}
                {selectedOrder.defectNotes && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm font-semibold text-yellow-800 mb-1">Defect Notes</p>
                    <p className="text-sm text-yellow-700">{selectedOrder.defectNotes}</p>
                  </div>
                )}

                {/* Cancellation Reason */}
                {selectedOrder.status === 'cancelled' && selectedOrder.cancellationReason && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm font-semibold text-red-800 mb-1">Cancellation Reason</p>
                    <p className="text-sm text-red-700">{selectedOrder.cancellationReason}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Select a manufacturing order to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Order Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Manufacturing Order</DialogTitle>
            <DialogDescription>Update order details and schedule</DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="product">Product Name *</Label>
              <Input
                id="product"
                value={formData.product || ''}
                onChange={(e) => updateFormField('product', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity || 0}
                onChange={(e) => updateFormField('quantity', parseInt(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priority">Priority *</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => updateFormField('priority', value)}
              >
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate || ''}
                onChange={(e) => updateFormField('startDate', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate || ''}
                onChange={(e) => updateFormField('endDate', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="completion">Completion %</Label>
              <Input
                id="completion"
                type="number"
                min="0"
                max="100"
                value={formData.completion || 0}
                onChange={(e) => updateFormField('completion', parseInt(e.target.value))}
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
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="delayed">Delayed</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                  <SelectItem value="rework">Rework</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Order Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Manufacturing Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel order {selectedOrder?.id}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-2">
            <Label htmlFor="cancel-reason">Cancellation Reason</Label>
            <Textarea
              id="cancel-reason"
              placeholder="Please provide a reason for cancellation..."
              rows={4}
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
              Keep Order
            </Button>
            <Button variant="destructive" onClick={confirmCancel}>
              Cancel Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Scrap Dialog */}
      {selectedOrder && (
        <ScrapReworkDialog
          isOpen={isScrapDialogOpen}
          onClose={() => setIsScrapDialogOpen(false)}
          order={selectedOrder}
          onSave={updateOrder}
          type="scrap"
        />
      )}

      {/* Rework Dialog */}
      {selectedOrder && (
        <ScrapReworkDialog
          isOpen={isReworkDialogOpen}
          onClose={() => setIsReworkDialogOpen(false)}
          order={selectedOrder}
          onSave={updateOrder}
          type="rework"
        />
      )}
    </div>
  );
}