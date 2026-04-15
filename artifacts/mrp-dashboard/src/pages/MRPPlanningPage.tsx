import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
  calculateMultiLevelMRP,
  generatePlannedOrders,
  generateMRPExceptions,
  getMaterialsByLevel,
  getPeggingInfo,
  type MRPResult,
  type PlannedOrder,
  type MRPException,
} from '../engines/mrpEngine';
import { 
  getMaterialForecast,
} from '../data/mockData';
import { 
  ShoppingCart, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingDown, 
  Package, 
  Calendar,
  DollarSign,
  Search,
  Download,
  RefreshCw,
  Layers,
  GitBranch,
} from 'lucide-react';
import { Progress } from '../components/ui/progress';
import { toast } from 'sonner';

export default function MRPPlanningPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [forecastDays, setForecastDays] = useState(30);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'flat' | 'by-level'>('flat');

  // Calculate Multi-Level MRP
  const mrpResults = useMemo(() => calculateMultiLevelMRP(), [lastRefresh]);
  const plannedOrders = useMemo(() => generatePlannedOrders(mrpResults), [mrpResults]);
  const exceptions = useMemo(() => generateMRPExceptions(mrpResults), [mrpResults]);
  const materialsByLevel = useMemo(() => getMaterialsByLevel(mrpResults), [mrpResults]);
  const forecast = useMemo(() => getMaterialForecast(forecastDays), [forecastDays, lastRefresh]);

  // Filter results
  const filteredResults = mrpResults.filter(mrp => {
    const matchesSearch = mrp.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mrp.materialSKU.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || mrp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate summary stats
  const criticalCount = mrpResults.filter(m => m.status === 'critical').length;
  const shortageCount = mrpResults.filter(m => m.status === 'shortage').length;
  const lowCount = mrpResults.filter(m => m.status === 'low').length;
  const totalPurchaseValue = plannedOrders.reduce((sum, po) => sum + (po.totalCost ?? 0), 0);
  const urgentPurchases = plannedOrders.filter(po => po.notes?.includes('URGENT')).length;

  const handleRefresh = () => {
    setLastRefresh(new Date());
  };

  const getStatusColor = (status: MRPResult['status']) => {
    switch (status) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'shortage': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getStatusIcon = (status: MRPResult['status']) => {
    switch (status) {
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      case 'shortage': return <TrendingDown className="w-4 h-4" />;
      case 'low': return <Package className="w-4 h-4" />;
      default: return <CheckCircle2 className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">MRP Planning Dashboard</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Material Requirements Planning & Purchase Recommendations</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Last updated: {lastRefresh.toLocaleString()}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critical Shortages</p>
                <p className="text-xl sm:text-lg sm:text-xl lg:text-2xl lg:text-3xl font-bold text-red-600 mt-1">{criticalCount}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Material Shortages</p>
                <p className="text-xl sm:text-lg sm:text-xl lg:text-2xl lg:text-3xl font-bold text-orange-600 mt-1">{shortageCount}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Low Stock Items</p>
                <p className="text-xl sm:text-lg sm:text-xl lg:text-2xl lg:text-3xl font-bold text-yellow-600 mt-1">{lowCount}</p>
              </div>
              <Package className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Purchase Orders</p>
                <p className="text-xl sm:text-lg sm:text-xl lg:text-2xl lg:text-3xl font-bold text-blue-600 mt-1">{plannedOrders.length}</p>
                <p className="text-xs text-red-600 mt-1">{urgentPurchases} urgent</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total PO Value</p>
                <p className="text-xl sm:text-lg sm:text-xl lg:text-2xl lg:text-3xl font-bold text-green-600 mt-1">
                  ${(totalPurchaseValue / 1000).toFixed(1)}k
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search materials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="shortage">Shortage</SelectItem>
            <SelectItem value="low">Low Stock</SelectItem>
            <SelectItem value="sufficient">Sufficient</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Material Requirements Table */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Material Requirements Planning (MRP)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left text-sm text-gray-600">
                  <th className="pb-3 font-medium">Material</th>
                  <th className="pb-3 font-medium text-right">Current Stock</th>
                  <th className="pb-3 font-medium text-right">Allocated</th>
                  <th className="pb-3 font-medium text-right">Available</th>
                  <th className="pb-3 font-medium text-right">Net Req.</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-center">Allocations</th>
                  <th className="pb-3 font-medium text-right">Recommend Order</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((mrp) => (
                  <tr key={mrp.materialSKU} className="border-b hover:bg-gray-50">
                    <td className="py-4">
                      <div>
                        <p className="font-medium text-gray-900">{mrp.materialName}</p>
                        <p className="text-sm text-gray-500">{mrp.materialSKU}</p>
                        {mrp.bomLevels.length > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <Layers className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              Levels: {mrp.bomLevels.join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      <span className="font-medium">{mrp.onHand}</span>
                      <span className="text-gray-500 text-sm ml-1">{mrp.unitOfMeasure}</span>
                    </td>
                    <td className="py-4 text-right">
                      <span className="font-medium text-orange-600">{mrp.grossRequirement.toFixed(2)}</span>
                      <span className="text-gray-500 text-sm ml-1">{mrp.unitOfMeasure}</span>
                    </td>
                    <td className="py-4 text-right">
                      <span className={`font-medium ${mrp.available < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {mrp.available.toFixed(2)}
                      </span>
                      <span className="text-gray-500 text-sm ml-1">{mrp.unitOfMeasure}</span>
                    </td>
                    <td className="py-4 text-right">
                      {mrp.netRequirement > 0 ? (
                        <>
                          <span className="font-medium text-red-600">{mrp.netRequirement.toFixed(2)}</span>
                          <span className="text-gray-500 text-sm ml-1">{mrp.unitOfMeasure}</span>
                        </>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-4">
                      <Badge className={`${getStatusColor(mrp.status)} flex items-center gap-1 w-fit`}>
                        {getStatusIcon(mrp.status)}
                        <span className="capitalize">{mrp.status}</span>
                      </Badge>
                    </td>
                    <td className="py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-medium">{mrp.allocations.length}</span>
                        <button 
                          className="text-xs text-blue-600 hover:underline"
                          onClick={() => setSelectedMaterial(mrp.materialSKU)}
                        >
                          View details
                        </button>
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      {mrp.plannedOrderQty && mrp.plannedOrderQty > 0 ? (
                        <div className="flex flex-col items-end">
                          <span className="font-medium text-blue-600">
                            {mrp.plannedOrderQty} {mrp.unitOfMeasure}
                          </span>
                          {mrp.plannedOrderDate && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {mrp.plannedOrderDate}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredResults.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No material requirements found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Purchase Recommendations */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Purchase Order Recommendations</CardTitle>
            <Button>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Create All POs ({plannedOrders.length})
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {plannedOrders.map((po) => (
              <div key={po.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium text-gray-900">{po.materialName}</h4>
                    {po.notes?.includes('URGENT') && (
                      <Badge className="bg-red-100 text-red-800">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        URGENT
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <span>Supplier: <span className="font-medium">{po.supplier}</span></span>
                    <span>Qty: <span className="font-medium">{po.quantity} {po.unit}</span></span>
                    <span>Cost: <span className="font-medium">${(po.totalCost ?? 0).toFixed(2)}</span></span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Order by: <span className="font-medium">{po.orderDate}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Delivery: <span className="font-medium">{po.expectedDelivery}</span>
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{po.notes}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Review</Button>
                  <Button size="sm">
                    <ShoppingCart className="w-4 h-4 mr-1" />
                    Create PO
                  </Button>
                </div>
              </div>
            ))}
            
            {plannedOrders.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500" />
                <p>No purchase orders needed at this time</p>
                <p className="text-sm mt-1">All materials are sufficiently stocked</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Material Forecast */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Material Consumption Forecast ({forecastDays} days)</CardTitle>
            <Select value={String(forecastDays)} onValueChange={(v) => setForecastDays(Number(v))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="14">14 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="60">60 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {forecast.map((item) => (
              <div key={item.materialId} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.materialName}</h4>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                      <span>Current: <span className="font-medium">{item.currentStock} {item.unit}</span></span>
                      <span>Usage: <span className="font-medium text-orange-600">{item.forecastedUsage.toFixed(2)} {item.unit}</span></span>
                      <span>Projected: <span className={`font-medium ${item.willRunOut ? 'text-red-600' : 'text-green-600'}`}>
                        {item.projectedStock.toFixed(2)} {item.unit}
                      </span></span>
                    </div>
                  </div>
                  {item.willRunOut && (
                    <Badge className="bg-red-100 text-red-800">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Will run out: {item.runOutDate}
                    </Badge>
                  )}
                </div>
                <Progress 
                  value={Math.max(0, Math.min(100, (item.projectedStock / item.currentStock) * 100))} 
                  className="h-2"
                />
              </div>
            ))}
            
            {forecast.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No material consumption forecast available</p>
                <p className="text-sm mt-1">No upcoming manufacturing orders in selected period</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}