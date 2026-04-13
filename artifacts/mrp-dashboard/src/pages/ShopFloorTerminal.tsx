import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { manufacturingOrders, departments, inventoryItems } from '../data/mockData';
import {
  logMaterialConsumption,
  logProductionEvent,
  reportScrapRework,
  issueMaterial,
  updateProductionProgress,
  getWIPStatus,
} from '../data/shopFloorEngine';
import {
  Play,
  Pause,
  CheckCircle2,
  AlertTriangle,
  Package,
  TrendingUp,
  Clock,
  User,
} from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from '../components/ui/progress';

export default function ShopFloorTerminal() {
  const [selectedOrder, setSelectedOrder] = useState('');
  const [operatorName, setOperatorName] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [activeTab, setActiveTab] = useState<'progress' | 'materials' | 'scrap'>('progress');

  // Progress update form
  const [progressValue, setProgressValue] = useState('');
  const [progressNotes, setProgressNotes] = useState('');

  // Material consumption form
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [actualQty, setActualQty] = useState('');
  const [scrapQty, setScrapQty] = useState('');
  const [materialNotes, setMaterialNotes] = useState('');

  // Scrap/Rework form
  const [scrapType, setScrapType] = useState<'scrap' | 'rework'>('scrap');
  const [scrapQuantity, setScrapQuantity] = useState('');
  const [scrapReason, setScrapReason] = useState('');
  const [scrapAction, setScrapAction] = useState('');

  const wipStatus = getWIPStatus();
  const activeOrders = manufacturingOrders.filter(
    o => o.status === 'in-progress' || o.status === 'planned'
  );

  const selectedOrderData = manufacturingOrders.find(o => o.id === selectedOrder);

  const handleUpdateProgress = () => {
    if (!selectedOrder || !operatorName || !selectedDepartment || !progressValue) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      updateProductionProgress(
        selectedOrder,
        parseFloat(progressValue),
        operatorName,
        selectedDepartment,
        progressNotes
      );

      toast.success('Production progress updated successfully');
      setProgressValue('');
      setProgressNotes('');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleLogMaterial = () => {
    if (!selectedOrder || !operatorName || !selectedDepartment || !selectedMaterial || !actualQty) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      logMaterialConsumption(
        selectedOrder,
        selectedMaterial,
        parseFloat(actualQty),
        parseFloat(scrapQty) || 0,
        operatorName,
        selectedDepartment,
        materialNotes
      );

      toast.success('Material consumption logged successfully');
      setSelectedMaterial('');
      setActualQty('');
      setScrapQty('');
      setMaterialNotes('');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleReportScrap = () => {
    if (!selectedOrder || !operatorName || !selectedDepartment || !scrapQuantity || !scrapReason) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      reportScrapRework(
        selectedOrder,
        scrapType,
        parseFloat(scrapQuantity),
        scrapReason,
        selectedDepartment,
        operatorName,
        undefined,
        scrapAction || undefined
      );

      toast.success(`${scrapType === 'scrap' ? 'Scrap' : 'Rework'} reported successfully`);
      setScrapQuantity('');
      setScrapReason('');
      setScrapAction('');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleStartOrder = () => {
    if (!selectedOrder || !operatorName || !selectedDepartment) {
      toast.error('Please select order, enter operator name, and select department');
      return;
    }

    try {
      logProductionEvent(selectedOrder, 'start', operatorName, selectedDepartment, {
        previousStatus: 'planned',
        newStatus: 'in-progress',
        notes: 'Production started from shop floor terminal',
      });
      updateProductionProgress(selectedOrder, 1, operatorName, selectedDepartment);
      toast.success('Production started');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-xl sm:text-lg sm:text-xl lg:text-2xl lg:text-xl sm:text-lg sm:text-xl lg:text-2xl lg:text-3xl font-bold text-gray-900">Shop Floor Terminal</h1>
        <p className="text-gray-600 mt-2">Real-time production tracking and material consumption</p>
      </div>

      {/* Operator Login Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Operator Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="operator">Operator Name *</Label>
              <Input
                id="operator"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
            <div>
              <Label htmlFor="department">Department *</Label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
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
              <Label htmlFor="order">Manufacturing Order *</Label>
              <Select value={selectedOrder} onValueChange={setSelectedOrder}>
                <SelectTrigger>
                  <SelectValue placeholder="Select order" />
                </SelectTrigger>
                <SelectContent>
                  {activeOrders.map(order => (
                    <SelectItem key={order.id} value={order.id}>
                      {order.id} - {order.product}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Information */}
      {selectedOrderData && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Order Details: {selectedOrderData.id}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-600">Product</p>
                <p className="font-medium text-gray-900">{selectedOrderData.product}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Quantity</p>
                <p className="font-medium text-gray-900">{selectedOrderData.quantity} units</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <Badge className={
                  selectedOrderData.status === 'completed' ? 'bg-green-100 text-green-800' :
                  selectedOrderData.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }>
                  {selectedOrderData.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Progress</p>
                <div className="flex items-center gap-2">
                  <Progress value={selectedOrderData.completion} className="flex-1 h-2" />
                  <span className="font-medium">{selectedOrderData.completion}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      {selectedOrderData && (
        <div className="flex gap-3 mb-8">
          <Button onClick={handleStartOrder} disabled={selectedOrderData.status !== 'planned'}>
            <Play className="w-4 h-4 mr-2" />
            Start Production
          </Button>
          <Button variant="outline" disabled={selectedOrderData.status !== 'in-progress'}>
            <Pause className="w-4 h-4 mr-2" />
            Pause
          </Button>
          <Button 
            variant="outline" 
            disabled={selectedOrderData.completion < 100}
            onClick={() => {
              if (operatorName && selectedDepartment) {
                logProductionEvent(selectedOrder, 'complete', operatorName, selectedDepartment, {
                  previousStatus: 'in-progress',
                  newStatus: 'completed',
                });
                toast.success('Order marked as complete');
              }
            }}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Complete Order
          </Button>
        </div>
      )}

      {/* Tabs for different actions */}
      {selectedOrderData && (
        <Card>
          <CardHeader>
            <div className="flex gap-2">
              <Button
                variant={activeTab === 'progress' ? 'default' : 'outline'}
                onClick={() => setActiveTab('progress')}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Update Progress
              </Button>
              <Button
                variant={activeTab === 'materials' ? 'default' : 'outline'}
                onClick={() => setActiveTab('materials')}
              >
                <Package className="w-4 h-4 mr-2" />
                Log Materials
              </Button>
              <Button
                variant={activeTab === 'scrap' ? 'default' : 'outline'}
                onClick={() => setActiveTab('scrap')}
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Report Scrap/Rework
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Progress Update Form */}
            {activeTab === 'progress' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="progress">Completion Percentage *</Label>
                  <Input
                    id="progress"
                    type="number"
                    min="0"
                    max="100"
                    value={progressValue}
                    onChange={(e) => setProgressValue(e.target.value)}
                    placeholder="0-100"
                  />
                </div>
                <div>
                  <Label htmlFor="progressNotes">Notes</Label>
                  <Textarea
                    id="progressNotes"
                    value={progressNotes}
                    onChange={(e) => setProgressNotes(e.target.value)}
                    placeholder="Optional notes about progress..."
                  />
                </div>
                <Button onClick={handleUpdateProgress}>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Update Progress
                </Button>
              </div>
            )}

            {/* Material Consumption Form */}
            {activeTab === 'materials' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="material">Material *</Label>
                  <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select material" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedOrderData.materials.map(mat => (
                        <SelectItem key={mat.id} value={mat.id}>
                          {mat.name} (Planned: {mat.required} {mat.unit})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="actualQty">Actual Quantity Used *</Label>
                    <Input
                      id="actualQty"
                      type="number"
                      step="0.01"
                      value={actualQty}
                      onChange={(e) => setActualQty(e.target.value)}
                      placeholder="Actual quantity"
                    />
                  </div>
                  <div>
                    <Label htmlFor="scrapQty">Scrap Quantity</Label>
                    <Input
                      id="scrapQty"
                      type="number"
                      step="0.01"
                      value={scrapQty}
                      onChange={(e) => setScrapQty(e.target.value)}
                      placeholder="Waste/scrap"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="materialNotes">Notes</Label>
                  <Textarea
                    id="materialNotes"
                    value={materialNotes}
                    onChange={(e) => setMaterialNotes(e.target.value)}
                    placeholder="Optional notes about material usage..."
                  />
                </div>
                <Button onClick={handleLogMaterial}>
                  <Package className="w-4 h-4 mr-2" />
                  Log Material Consumption
                </Button>
              </div>
            )}

            {/* Scrap/Rework Form */}
            {activeTab === 'scrap' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="scrapType">Type *</Label>
                  <Select value={scrapType} onValueChange={(v: any) => setScrapType(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scrap">Scrap (Waste)</SelectItem>
                      <SelectItem value="rework">Rework (Fixable)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="scrapQuantity">Quantity *</Label>
                  <Input
                    id="scrapQuantity"
                    type="number"
                    step="0.01"
                    value={scrapQuantity}
                    onChange={(e) => setScrapQuantity(e.target.value)}
                    placeholder="Number of units"
                  />
                </div>
                <div>
                  <Label htmlFor="scrapReason">Reason *</Label>
                  <Textarea
                    id="scrapReason"
                    value={scrapReason}
                    onChange={(e) => setScrapReason(e.target.value)}
                    placeholder="Describe the issue..."
                  />
                </div>
                {scrapType === 'rework' && (
                  <div>
                    <Label htmlFor="scrapAction">Action Taken</Label>
                    <Textarea
                      id="scrapAction"
                      value={scrapAction}
                      onChange={(e) => setScrapAction(e.target.value)}
                      placeholder="What will be done to fix it..."
                    />
                  </div>
                )}
                <Button onClick={handleReportScrap} variant={scrapType === 'scrap' ? 'destructive' : 'default'}>
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Report {scrapType === 'scrap' ? 'Scrap' : 'Rework'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Work in Progress Status */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Work in Progress (WIP)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {wipStatus.map(wip => (
              <div key={wip.orderId} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{wip.orderName}</h4>
                    <p className="text-sm text-gray-500">{wip.orderId} - {wip.currentDepartment}</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">{wip.progress}% Complete</Badge>
                </div>
                <Progress value={wip.progress} className="mb-3" />
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Materials Issued</p>
                    <p className="font-medium">{wip.materialsIssued ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Quality Checks</p>
                    <p className="font-medium">{wip.qualityChecksPassed}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Active Operators</p>
                    <p className="font-medium">{wip.activeOperators.length}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Est. Time Remaining</p>
                    <p className="font-medium">{wip.estimatedTimeRemaining.toFixed(1)}h</p>
                  </div>
                </div>
              </div>
            ))}
            {wipStatus.length === 0 && (
              <p className="text-center py-8 text-gray-500">No orders currently in progress</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
