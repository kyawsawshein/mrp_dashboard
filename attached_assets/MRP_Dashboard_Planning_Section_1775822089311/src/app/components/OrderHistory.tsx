import { ManufacturingOrder, OrderModification } from '../data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Clock, User, FileEdit, AlertTriangle, RotateCcw, Ban, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface OrderHistoryProps {
  order: ManufacturingOrder;
}

export function OrderHistory({ order }: OrderHistoryProps) {
  const modifications = order.modificationHistory || [];

  const getModificationIcon = (type: OrderModification['type']) => {
    switch (type) {
      case 'quantity-change': return <FileEdit className="w-4 h-4 text-blue-500" />;
      case 'schedule-change': return <Calendar className="w-4 h-4 text-purple-500" />;
      case 'status-change': return <FileEdit className="w-4 h-4 text-green-500" />;
      case 'scrap-reported': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'rework-initiated': return <RotateCcw className="w-4 h-4 text-orange-500" />;
      case 'cancelled': return <Ban className="w-4 h-4 text-gray-500" />;
      default: return <FileEdit className="w-4 h-4 text-gray-500" />;
    }
  };

  const getModificationLabel = (type: OrderModification['type']) => {
    switch (type) {
      case 'quantity-change': return 'Quantity Changed';
      case 'schedule-change': return 'Schedule Updated';
      case 'status-change': return 'Status Changed';
      case 'scrap-reported': return 'Scrap Reported';
      case 'rework-initiated': return 'Rework Initiated';
      case 'cancelled': return 'Order Cancelled';
      default: return 'Modified';
    }
  };

  const getModificationColor = (type: OrderModification['type']) => {
    switch (type) {
      case 'quantity-change': return 'bg-blue-50 border-blue-200';
      case 'schedule-change': return 'bg-purple-50 border-purple-200';
      case 'status-change': return 'bg-green-50 border-green-200';
      case 'scrap-reported': return 'bg-red-50 border-red-200';
      case 'rework-initiated': return 'bg-orange-50 border-orange-200';
      case 'cancelled': return 'bg-gray-50 border-gray-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  if (modifications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Order History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-4">
            No modifications recorded for this order
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Order History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {modifications.map((mod) => (
            <div
              key={mod.id}
              className={`p-3 rounded-lg border ${getModificationColor(mod.type)}`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {getModificationIcon(mod.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-gray-900">
                      {getModificationLabel(mod.type)}
                    </h4>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>
                        {formatDistanceToNow(new Date(mod.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                  </div>

                  {mod.notes && (
                    <p className="text-sm text-gray-600 mb-2">{mod.notes}</p>
                  )}

                  {(mod.previousValue !== undefined || mod.newValue !== undefined) && (
                    <div className="flex items-center gap-2 text-xs">
                      {mod.previousValue !== undefined && (
                        <>
                          <span className="text-gray-500">From:</span>
                          <Badge variant="outline" className="text-xs">
                            {JSON.stringify(mod.previousValue)}
                          </Badge>
                        </>
                      )}
                      {mod.newValue !== undefined && (
                        <>
                          <span className="text-gray-500">To:</span>
                          <Badge variant="outline" className="text-xs">
                            {JSON.stringify(mod.newValue)}
                          </Badge>
                        </>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                    <User className="w-3 h-3" />
                    <span>{mod.user}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
