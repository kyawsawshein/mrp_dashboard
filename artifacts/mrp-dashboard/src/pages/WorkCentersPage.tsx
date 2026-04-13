import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import {
  workCenters,
  routings,
  calculateWorkCenterCapacity,
  getWorkCenterUtilizationSummary,
  findBottleneckWorkCenters,
  getMaintenanceDue,
  createWorkCenter,
  updateWorkCenter,
  deleteWorkCenter,
  type WorkCenter,
  type Routing,
} from '../data/workCenters';
import {
  Settings,
  TrendingUp,
  AlertTriangle,
  Wrench,
  Activity,
  Clock,
  DollarSign,
  Users,
  Zap,
  CheckCircle2,
  Plus,
  Edit,
  Trash2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { WorkCenterDialog } from '../components/WorkCenterDialog';
import { toast } from 'sonner';

export default function WorkCentersPage() {
  const [selectedWorkCenter, setSelectedWorkCenter] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [editingWorkCenter, setEditingWorkCenter] = useState<WorkCenter | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const utilizationSummary = getWorkCenterUtilizationSummary();
  const bottlenecks = findBottleneckWorkCenters();
  const maintenanceDue = getMaintenanceDue();

  const selectedWC = selectedWorkCenter 
    ? workCenters.find(wc => wc.id === selectedWorkCenter)
    : null;

  const filteredWorkCenters = selectedDepartment === 'all'
    ? workCenters
    : workCenters.filter(wc => wc.department === selectedDepartment);

  const departments = [...new Set(workCenters.map(wc => wc.department))];

  // Calculate summary metrics
  const avgUtilization = workCenters.reduce((sum, wc) => sum + (wc.metrics?.actualUtilization || 0), 0) / workCenters.length;
  const avgOEE = workCenters.reduce((sum, wc) => sum + (wc.metrics?.oeeScore || 0), 0) / workCenters.length;
  const totalDowntime = workCenters.reduce((sum, wc) => sum + (wc.metrics?.downtimeHours || 0), 0);
  const availableWorkCenters = workCenters.filter(wc => wc.status === 'available').length;

  const getStatusColor = (status: WorkCenter['status']) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'breakdown': return 'bg-red-100 text-red-800';
      case 'offline': return 'bg-gray-100 text-gray-800';
    }
  };

  const getLoadColor = (load: number, target: number) => {
    if (load > target) return '#ef4444'; // Red - over capacity
    if (load > target * 0.9) return '#f97316'; // Orange - near capacity
    if (load > target * 0.7) return '#22c55e'; // Green - good utilization
    return '#3b82f6'; // Blue - underutilized
  };

  const handleCreateWorkCenter = (data: Partial<WorkCenter>) => {
    try {
      createWorkCenter(data);
      toast.success('Work Center created successfully');
      setDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create Work Center');
    }
  };

  const handleUpdateWorkCenter = (data: Partial<WorkCenter>) => {
    if (!editingWorkCenter) return;
    try {
      updateWorkCenter(editingWorkCenter.id, data);
      toast.success('Work Center updated successfully');
      setDialogOpen(false);
      setSelectedWorkCenter(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update Work Center');
    }
  };

  const handleDeleteWorkCenter = (id: string) => {
    try {
      deleteWorkCenter(id);
      toast.success('Work Center deleted successfully');
      setDeleteConfirmId(null);
      if (selectedWorkCenter === id) {
        setSelectedWorkCenter(null);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete Work Center');
    }
  };

  const handleEditClick = (wc: WorkCenter, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingWorkCenter(wc);
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmId(id);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-xl sm:text-lg sm:text-xl lg:text-2xl lg:text-xl sm:text-lg sm:text-xl lg:text-2xl lg:text-3xl font-bold text-gray-900">Work Centers & Routing</h1>
        <p className="text-gray-600 mt-2">Manage manufacturing resources, capacity, and operations routing</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Utilization</p>
                <p className="text-xl sm:text-lg sm:text-xl lg:text-2xl lg:text-3xl font-bold text-blue-600 mt-1">{avgUtilization.toFixed(1)}%</p>
              </div>
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg OEE Score</p>
                <p className="text-xl sm:text-lg sm:text-xl lg:text-2xl lg:text-3xl font-bold text-green-600 mt-1">{avgOEE.toFixed(1)}%</p>
                <p className="text-xs text-gray-500 mt-1">Equipment Effectiveness</p>
              </div>
              <Zap className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Downtime</p>
                <p className="text-xl sm:text-lg sm:text-xl lg:text-2xl lg:text-3xl font-bold text-orange-600 mt-1">{totalDowntime}h</p>
                <p className="text-xs text-gray-500 mt-1">This Period</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Available / Total</p>
                <p className="text-xl sm:text-lg sm:text-xl lg:text-2xl lg:text-xl sm:text-lg sm:text-xl lg:text-2xl lg:text-3xl font-bold text-gray-900 mt-1">
                  {availableWorkCenters}/{workCenters.length}
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {(bottlenecks.length > 0 || maintenanceDue.length > 0) && (
        <div className="grid grid-cols-2 gap-4 mb-8">
          {bottlenecks.length > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800">
                  <AlertTriangle className="w-5 h-5" />
                  Bottleneck Work Centers ({bottlenecks.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {bottlenecks.slice(0, 3).map(wc => (
                    <div key={wc.id} className="flex items-center justify-between p-2 bg-white rounded">
                      <span className="font-medium text-gray-900">{wc.name}</span>
                      <Badge className="bg-orange-100 text-orange-800">
                        {wc.currentLoad}% loaded
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {maintenanceDue.length > 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-800">
                  <Wrench className="w-5 h-5" />
                  Maintenance Due ({maintenanceDue.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {maintenanceDue.slice(0, 3).map(wc => (
                    <div key={wc.id} className="flex items-center justify-between p-2 bg-white rounded">
                      <span className="font-medium text-gray-900">{wc.name}</span>
                      <span className="text-sm text-gray-600">
                        {wc.nextMaintenance ? new Date(wc.nextMaintenance).toLocaleDateString() : 'TBD'}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Department Filter */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={selectedDepartment === 'all' ? 'default' : 'outline'}
          onClick={() => setSelectedDepartment('all')}
        >
          All Departments
        </Button>
        {departments.map(dept => (
          <Button
            key={dept}
            variant={selectedDepartment === dept ? 'default' : 'outline'}
            onClick={() => setSelectedDepartment(dept)}
          >
            {dept}
          </Button>
        ))}
      </div>

      {/* Utilization by Department */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Department Utilization & OEE</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={utilizationSummary}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="avgUtilization" fill="#3b82f6" name="Utilization %" />
              <Bar dataKey="avgOEE" fill="#22c55e" name="OEE Score %" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Work Centers Grid */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Work Centers ({filteredWorkCenters.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {filteredWorkCenters.map(wc => {
              const capacity = calculateWorkCenterCapacity(wc, 7);
              
              return (
                <div
                  key={wc.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedWorkCenter === wc.id ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-400'
                  }`}
                  onClick={() => setSelectedWorkCenter(wc.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{wc.name}</h3>
                        <Badge className={getStatusColor(wc.status)}>
                          {wc.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{wc.code} - {wc.department}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => handleEditClick(wc, e)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="w-4 h-4 text-blue-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => handleDeleteClick(wc.id, e)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>

                  {/* Current Load */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Current Load</span>
                      <span className="font-medium">{wc.currentLoad}%</span>
                    </div>
                    <Progress 
                      value={wc.currentLoad} 
                      className="h-2"
                      style={{ '--progress-background': getLoadColor(wc.currentLoad, wc.capacity.utilizationTarget) } as React.CSSProperties}
                    />
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-gray-600">Utilization</p>
                      <p className="font-medium text-gray-900">
                        {wc.metrics?.actualUtilization || 0}%
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">OEE</p>
                      <p className="font-medium text-gray-900">
                        {wc.metrics?.oeeScore || 0}%
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Cost/hr</p>
                      <p className="font-medium text-gray-900">
                        ${wc.costPerHour}
                      </p>
                    </div>
                  </div>

                  {/* Capacity Info */}
                  <div className="mt-3 pt-3 border-t text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>{wc.capacity.hoursPerDay}h/day × {wc.capacity.daysPerWeek} days</span>
                      <span>{wc.operatorsRequired} operator(s)</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Work Center Details */}
      {selectedWC && (
        <Card>
          <CardHeader>
            <CardTitle>Work Center Details: {selectedWC.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">General Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Code:</span>
                      <span className="font-medium">{selectedWC.code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <Badge>{selectedWC.type}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Department:</span>
                      <span className="font-medium">{selectedWC.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Skill Level:</span>
                      <Badge className={
                        selectedWC.skillLevel === 'expert' ? 'bg-purple-100 text-purple-800' :
                        selectedWC.skillLevel === 'advanced' ? 'bg-blue-100 text-blue-800' :
                        selectedWC.skillLevel === 'intermediate' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }>
                        {selectedWC.skillLevel}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Capacity</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hours per Day:</span>
                      <span className="font-medium">{selectedWC.capacity.hoursPerDay}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Days per Week:</span>
                      <span className="font-medium">{selectedWC.capacity.daysPerWeek}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Efficiency:</span>
                      <span className="font-medium">{selectedWC.capacity.efficiency}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Target Utilization:</span>
                      <span className="font-medium">{selectedWC.capacity.utilizationTarget}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Operators Required:</span>
                      <span className="font-medium">{selectedWC.operatorsRequired}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Costing</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cost per Hour:</span>
                      <span className="font-medium text-green-600">${selectedWC.costPerHour}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Setup Cost per Hour:</span>
                      <span className="font-medium text-green-600">${selectedWC.setupCostPerHour}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Performance Metrics</h4>
                  {selectedWC.metrics ? (
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Actual Utilization</span>
                          <span className="font-medium">{selectedWC.metrics.actualUtilization}%</span>
                        </div>
                        <Progress value={selectedWC.metrics.actualUtilization} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">OEE Score</span>
                          <span className="font-medium">{selectedWC.metrics.oeeScore}%</span>
                        </div>
                        <Progress value={selectedWC.metrics.oeeScore} className="h-2" />
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm pt-2">
                        <div>
                          <p className="text-gray-600">Avg Setup Time</p>
                          <p className="font-medium text-gray-900">{selectedWC.metrics.avgSetupTime}h</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Avg Cycle Time</p>
                          <p className="font-medium text-gray-900">{selectedWC.metrics.avgCycleTime}h</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-gray-600">Downtime (This Period)</p>
                          <p className="font-medium text-red-600">{selectedWC.metrics.downtimeHours}h</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No metrics available</p>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Maintenance</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Interval:</span>
                      <span className="font-medium">Every {selectedWC.maintenanceIntervalDays} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Maintenance:</span>
                      <span className="font-medium">
                        {selectedWC.lastMaintenance 
                          ? new Date(selectedWC.lastMaintenance).toLocaleDateString()
                          : 'N/A'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Next Maintenance:</span>
                      <span className="font-medium text-orange-600">
                        {selectedWC.nextMaintenance 
                          ? new Date(selectedWC.nextMaintenance).toLocaleDateString()
                          : 'N/A'
                        }
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Description</h4>
                  <p className="text-sm text-gray-600">{selectedWC.description}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Routings Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Product Routings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {routings.map(routing => (
              <div key={routing.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{routing.productName}</h3>
                    <p className="text-sm text-gray-600">
                      {routing.id} - Version {routing.version}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Total Lead Time</p>
                      <p className="font-medium text-gray-900">{routing.totalLeadTime}h</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Total Cost</p>
                      <p className="font-medium text-green-600">${routing.totalCost.toFixed(2)}</p>
                    </div>
                    <Badge className={
                      routing.status === 'active' ? 'bg-green-100 text-green-800' :
                      routing.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {routing.status}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  {routing.operations.map(op => (
                    <div key={op.operationNumber} className="flex items-center gap-4 p-3 bg-gray-50 rounded">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                        {op.operationNumber}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{op.operationName}</p>
                        <p className="text-sm text-gray-600">{op.workCenterName}</p>
                      </div>
                      <div className="text-right text-sm">
                        <p className="text-gray-600">Setup: {op.setupTime}h</p>
                        <p className="text-gray-600">Run: {op.runTimePerUnit}h/unit</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">${(op.setupCost + op.runCost).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Work Center Dialog */}
      <WorkCenterDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        workCenter={editingWorkCenter}
        onSave={dialogMode === 'create' ? handleCreateWorkCenter : handleUpdateWorkCenter}
      />

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <Card className="bg-white p-8 rounded-lg shadow-lg">
            <CardHeader>
              <CardTitle className="text-red-600">Confirm Delete</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Are you sure you want to delete this work center?</p>
            </CardContent>
            <div className="flex justify-end mt-4">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmId(null)}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                className="bg-red-600 text-white"
                onClick={() => handleDeleteWorkCenter(deleteConfirmId)}
              >
                Delete
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Add Work Center Button */}
      <div className="mt-8">
        <Button
          variant="default"
          className="bg-green-600 text-white"
          onClick={() => {
            setDialogOpen(true);
            setDialogMode('create');
            setEditingWorkCenter(null);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Work Center
        </Button>
      </div>
    </div>
  );
}