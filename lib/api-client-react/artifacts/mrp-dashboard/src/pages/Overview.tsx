import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { manufacturingOrders, capacityData } from '../data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle, CheckCircle2, Clock, Package, TrendingUp } from 'lucide-react';
import { Badge } from '../components/ui/badge';

export default function Overview() {
  const totalOrders = manufacturingOrders.length;
  const inProgressOrders = manufacturingOrders.filter(o => o.status === 'in-progress').length;
  const completedOrders = manufacturingOrders.filter(o => o.status === 'completed').length;
  const delayedOrders = manufacturingOrders.filter(o => o.status === 'delayed').length;
  const plannedOrders = manufacturingOrders.filter(o => o.status === 'planned').length;

  const materialShortages = manufacturingOrders.reduce((count, order) => {
    return count + order.materials.filter(m => m.status === 'shortage').length;
  }, 0);

  const highPriorityOrders = manufacturingOrders.filter(o => o.priority === 'high');

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">Manufacturing resource planning for car seat cover production</p>
      </div>

      {/* Key Metrics — 2 cols on mobile, 3 on sm, 5 on lg */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-600">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
              <span className="text-xl font-bold">{totalOrders}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-600">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
              <span className="text-xl font-bold text-yellow-600">{inProgressOrders}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-600">Planned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
              <span className="text-xl font-bold text-blue-600">{plannedOrders}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-600">Delayed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
              <span className="text-xl font-bold text-red-600">{delayedOrders}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2 sm:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-600">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
              <span className="text-xl font-bold text-green-600">{completedOrders}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart + Quick Stats — stack on mobile, side-by-side on lg */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm sm:text-base">Department Capacity Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={capacityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" angle={-45} textAnchor="end" height={80} fontSize={10} />
                <YAxis fontSize={11} />
                <Tooltip />
                <Legend />
                <Bar dataKey="planned" fill="#3b82f6" name="Planned" />
                <Bar dataKey="actual" fill="#10b981" name="Actual" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm sm:text-base">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div>
                <p className="text-xs text-gray-600">Material Shortages</p>
                <p className="text-xl font-bold text-red-600">{materialShortages}</p>
              </div>
              <AlertCircle className="w-7 h-7 text-red-500" />
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div>
                <p className="text-xs text-gray-600">High Priority</p>
                <p className="text-xl font-bold text-orange-600">{highPriorityOrders.length}</p>
              </div>
              <TrendingUp className="w-7 h-7 text-orange-500" />
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="text-xs text-gray-600">Active Departments</p>
                <p className="text-xl font-bold text-blue-600">9</p>
              </div>
              <Package className="w-7 h-7 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* High Priority Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm sm:text-base">High Priority Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {highPriorityOrders.slice(0, 5).map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0 mr-3">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{order.id}</span>
                    <Badge
                      variant="outline"
                      className={
                        order.status === 'in-progress'
                          ? 'bg-yellow-100 text-yellow-700'
                          : order.status === 'delayed'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-blue-100 text-blue-700'
                      }
                    >
                      {order.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{order.product}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-medium">{order.quantity} units</p>
                  <p className="text-xs text-gray-500">Due: {new Date(order.endDate).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
