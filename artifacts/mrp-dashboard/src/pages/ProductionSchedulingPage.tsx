import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import {
  calculateDepartmentCapacity,
  detectScheduleConflicts,
  suggestLoadBalancing,
  generateOrderRouting,
  getProductionScheduleOverview,
  optimizeProductionSequence,
  DepartmentCapacity,
} from '../data/schedulingEngine';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import {
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Users,
  Clock,
  Zap,
  ArrowRight,
  RefreshCw,
  Download,
  Lightbulb,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

export default function ProductionSchedulingPage() {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [timelineView, setTimelineView] = useState<number>(14);

  // Calculate all scheduling data
  const capacities = useMemo(() => calculateDepartmentCapacity(), []);
  const conflicts = useMemo(() => detectScheduleConflicts(), []);
  const loadBalancing = useMemo(() => suggestLoadBalancing(), []);
  const scheduleOverview = useMemo(() => getProductionScheduleOverview(timelineView), [timelineView]);

  // Filter capacities based on selection
  const filteredCapacities = selectedDepartment === 'all'
    ? capacities
    : capacities.filter(c => c.departmentId === selectedDepartment);

  const getStatusColor = (status: DepartmentCapacity['status']) => {
    switch (status) {
      case 'overloaded': return 'text-red-600 bg-red-50';
      case 'near-capacity': return 'text-orange-600 bg-orange-50';
      case 'optimal': return 'text-green-600 bg-green-50';
      case 'underutilized': return 'text-blue-600 bg-blue-50';
    }
  };

  const getUtilizationColor = (percent: number) => {
    if (percent >= 100) return 'bg-red-500';
    if (percent >= 85) return 'bg-orange-500';
    if (percent >= 50) return 'bg-green-500';
    return 'bg-blue-500';
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-lg sm:text-xl lg:text-2xl lg:text-xl sm:text-lg sm:text-xl lg:text-2xl lg:text-3xl font-bold text-gray-900">Production Scheduling & Capacity Planning</h1>
            <p className="text-gray-600 mt-2">Optimize workload, detect conflicts, and balance department capacity</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Recalculate
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Schedule
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Utilization</p>
                <p className="text-xl sm:text-lg sm:text-xl lg:text-2xl lg:text-3xl font-bold text-blue-600 mt-1">{scheduleOverview.avgUtilization}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Orders</p>
                <p className="text-xl sm:text-lg sm:text-xl lg:text-2xl lg:text-3xl font-bold text-green-600 mt-1">{scheduleOverview.scheduledOrders}</p>
                <p className="text-xs text-gray-500 mt-1">of {scheduleOverview.totalOrders} total</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Conflicts</p>
                <p className="text-xl sm:text-lg sm:text-xl lg:text-2xl lg:text-3xl font-bold text-red-600 mt-1">{conflicts.conflicts.length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Bottleneck</p>
                <p className="text-lg font-bold text-orange-600 mt-1">
                  {scheduleOverview.bottleneckDepartment || 'None'}
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Suggestions</p>
                <p className="text-xl sm:text-lg sm:text-xl lg:text-2xl lg:text-3xl font-bold text-purple-600 mt-1">{loadBalancing.suggestions.length}</p>
              </div>
              <Lightbulb className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Schedule Conflicts Alert */}
      {conflicts.hasConflicts && (
        <Card className="mb-8 border-red-200 bg-red-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <CardTitle className="text-red-900">Scheduling Conflicts Detected</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {conflicts.conflicts.map((conflict, idx) => (
                <div key={idx} className="bg-white p-4 rounded-lg border border-red-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{conflict.departmentName}</h4>
                    <Badge className="bg-red-100 text-red-800">
                      Overloaded by {conflict.overload.toFixed(1)}h
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Capacity</p>
                      <p className="font-medium">{conflict.capacity}h</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Planned Load</p>
                      <p className="font-medium text-red-600">{conflict.plannedLoad.toFixed(1)}h</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Affected Orders</p>
                      <p className="font-medium">{conflict.affectedOrders.length}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Load Balancing Suggestions */}
      {loadBalancing.suggestions.length > 0 && (
        <Card className="mb-8 border-purple-200 bg-purple-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-purple-600" />
                <CardTitle className="text-purple-900">Load Balancing Recommendations</CardTitle>
              </div>
              <Button size="sm" className="bg-purple-600">
                <Zap className="w-4 h-4 mr-2" />
                Apply All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loadBalancing.suggestions.map((suggestion, idx) => (
                <div key={idx} className="bg-white p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900">{suggestion.orderName}</span>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <Badge className="bg-green-100 text-green-800">
                        +{suggestion.estimatedImprovement}% efficiency
                      </Badge>
                    </div>
                    <Button size="sm" variant="outline">Apply</Button>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div>
                      <span className="text-red-600 font-medium">{suggestion.fromDepartment}</span>
                      <ArrowRight className="inline w-3 h-3 mx-2" />
                      <span className="text-green-600 font-medium">{suggestion.toDepartment}</span>
                    </div>
                    <div className="flex-1">
                      <p>{suggestion.reason}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Department Capacity Overview */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Department Capacity Utilization</CardTitle>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {capacities.map(c => (
                  <SelectItem key={c.departmentId} value={c.departmentId}>
                    {c.departmentName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredCapacities.map((dept) => (
              <div key={dept.departmentId} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium text-gray-900">{dept.departmentName}</h4>
                    <Badge className={getStatusColor(dept.status)}>
                      {dept.status.replace('-', ' ')}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-xl sm:text-lg sm:text-xl lg:text-2xl font-bold">{dept.utilizationPercent}%</p>
                    <p className="text-xs text-gray-500">{dept.plannedLoad}h / {dept.capacity}h capacity</p>
                  </div>
                </div>
                
                <div className="mb-3">
                  <Progress 
                    value={Math.min(100, dept.utilizationPercent)} 
                    className="h-3"
                  />
                </div>

                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Planned Load</p>
                    <p className="font-medium">{dept.plannedLoad}h</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Actual Load</p>
                    <p className="font-medium">{dept.actualLoad}h</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Available</p>
                    <p className="font-medium text-green-600">{dept.availableCapacity}h</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Assigned Orders</p>
                    <p className="font-medium">{dept.assignedOrders.length}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Capacity Utilization Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Department Capacity Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={capacities}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="departmentName" angle={-45} textAnchor="end" height={100} />
              <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="capacity" fill="#94a3b8" name="Total Capacity" />
              <Bar dataKey="plannedLoad" fill="#3b82f6" name="Planned Load" />
              <Bar dataKey="actualLoad" fill="#10b981" name="Actual Load" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Production Timeline */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Production Schedule Timeline ({timelineView} days)</CardTitle>
            <Select value={String(timelineView)} onValueChange={(v) => setTimelineView(Number(v))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="14">14 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={scheduleOverview.timeline}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis label={{ value: 'Orders Scheduled', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="ordersScheduled" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Orders Scheduled"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
