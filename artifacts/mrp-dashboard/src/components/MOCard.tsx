import { ManufacturingOrder } from '../data/mockData';
import { Calendar, Package, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface MOCardProps {
  order: ManufacturingOrder;
}

export function MOCard({ order }: MOCardProps) {
  const statusConfig: Record<string, { color: string; label: string; icon: typeof Clock }> = {
    planned: { color: 'bg-blue-500', label: 'Planned', icon: Clock },
    'in-progress': { color: 'bg-yellow-500', label: 'In Progress', icon: Package },
    completed: { color: 'bg-green-500', label: 'Completed', icon: CheckCircle2 },
    delayed: { color: 'bg-red-500', label: 'Delayed', icon: AlertCircle },
    'on-hold': { color: 'bg-gray-500', label: 'On Hold', icon: Clock },
    cancelled: { color: 'bg-gray-400', label: 'Cancelled', icon: AlertCircle },
    rework: { color: 'bg-orange-500', label: 'Rework', icon: AlertCircle },
  };

  const priorityConfig = {
    high: 'bg-red-100 text-red-700 border-red-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    low: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  const config = statusConfig[order.status] || statusConfig.planned;
  const StatusIcon = config.icon;

  const hasMaterialShortage = order.materials.some(m => m.status === 'shortage');

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{order.product}</CardTitle>
            <p className="text-sm text-gray-500 mt-1">{order.id}</p>
          </div>
          <Badge
            variant="outline"
            className={priorityConfig[order.priority]}
          >
            {order.priority.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${config.color}`} />
          <StatusIcon className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium">{config.label}</span>
        </div>

        {/* Quantity */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Quantity</span>
          <span className="font-semibold">{order.quantity} units</span>
        </div>

        {/* Timeline */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>
            {new Date(order.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            {' - '}
            {new Date(order.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>

        {/* Progress */}
        {order.status !== 'planned' && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="font-semibold">{order.completion}%</span>
            </div>
            <Progress value={order.completion} className="h-2" />
          </div>
        )}

        {/* Material Status */}
        {hasMaterialShortage && (
          <div className="flex items-center gap-2 p-2 bg-orange-50 border border-orange-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-orange-600" />
            <span className="text-xs text-orange-700 font-medium">Material Shortage</span>
          </div>
        )}

        {/* Material Summary */}
        <div className="pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Materials Status</p>
          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>{order.materials.filter(m => m.status === 'sufficient').length} OK</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <span>{order.materials.filter(m => m.status === 'shortage').length} Short</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span>{order.materials.filter(m => m.status === 'ordered').length} Ordered</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
