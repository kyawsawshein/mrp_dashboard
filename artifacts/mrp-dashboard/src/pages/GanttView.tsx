import { useState } from 'react';
import { manufacturingOrders, departments } from '../data/mockData';
import { parseISO, differenceInDays, startOfMonth, endOfMonth } from 'date-fns';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { Button } from '../components/ui/button';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { toast } from 'sonner';

interface GanttOrder {
  id: string;
  product: string;
  department: string;
  status: string;
  priority: string;
  startDate: string;
  endDate: string;
  completion: number;
  quantity: number;
  materials: {
    id: string;
    name: string;
    required: number;
    available: number;
    unit: string;
    status: 'sufficient' | 'shortage' | 'ordered';
  }[];
  [key: string]: unknown;
}

const ItemTypes = {
  ORDER: 'order',
};

function DraggableGanttRow({ 
  order, 
  barStyle, 
  index,
  onDrop,
}: { 
  order: GanttOrder;
  barStyle: { left: string; width: string };
  index: number;
  onDrop: (draggedOrder: GanttOrder, targetOrder: GanttOrder) => void;
}) {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.ORDER,
    item: order,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: ItemTypes.ORDER,
    drop: (draggedOrder: GanttOrder) => {
      if (draggedOrder.id !== order.id) {
        onDrop(draggedOrder, order);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'bg-blue-500 hover:bg-blue-600';
      case 'in-progress': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'completed': return 'bg-green-500 hover:bg-green-600';
      case 'delayed': return 'bg-red-500 hover:bg-red-600';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return '';
    }
  };

  const getDepartmentName = (deptId: string) => {
    return departments.find(d => d.id === deptId)?.name || deptId;
  };

  return (
    <div
      ref={(node) => { drag(drop(node)); }}
      className={`flex border-b border-gray-200 transition-all ${
        isDragging ? 'opacity-50' : ''
      } ${isOver ? 'bg-blue-50' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-gray-50 cursor-move`}
    >
      {/* Order info column */}
      <div className="w-80 shrink-0 p-3 border-r border-gray-200">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm text-gray-900 truncate">
              {order.id}
            </div>
            <div className="text-xs text-gray-600 truncate mt-0.5">
              {order.product}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {getDepartmentName(order.department)}
            </div>
          </div>
          <Badge
            variant="outline"
            className={`${getPriorityBadge(order.priority)} text-[10px] px-1.5 py-0`}
          >
            {order.priority}
          </Badge>
        </div>
      </div>

      {/* Timeline column */}
      <div className="flex-1 relative py-2">
        {/* Gantt bar */}
        <div className="relative h-full px-1">
          <div
            className={`absolute top-1/2 -translate-y-1/2 h-6 rounded ${getStatusColor(order.status)} transition-all group shadow-sm`}
            style={barStyle}
          >
            <div className="absolute inset-0 flex items-center justify-center px-2">
              <span className="text-white text-[10px] font-medium truncate">
                {order.completion > 0 ? `${order.completion}%` : order.product}
              </span>
            </div>
            
            {/* Progress indicator */}
            {order.status === 'in-progress' && order.completion > 0 && (
              <div
                className="absolute top-0 left-0 h-full bg-white/30 rounded-l"
                style={{ width: `${order.completion}%` }}
              />
            )}

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
              <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                <div className="font-medium">{order.product}</div>
                <div className="text-gray-300">
                  {new Date(order.startDate).toLocaleDateString()} - {new Date(order.endDate).toLocaleDateString()}
                </div>
                <div className="text-gray-300">{order.quantity} units</div>
                <div className="text-gray-400 text-[10px] mt-1">Drag to reorder</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GanttViewContent() {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [viewDate, setViewDate] = useState(new Date(2026, 3, 1));
  const [orders, setOrders] = useState<GanttOrder[]>(manufacturingOrders as GanttOrder[]);

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const daysInMonth = differenceInDays(monthEnd, monthStart) + 1;

  const filteredOrders = selectedDepartment === 'all'
    ? orders
    : orders.filter(o => o.department === selectedDepartment);

  const sortedOrders = [...filteredOrders].sort((a, b) => 
    parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime()
  );

  const getBarPosition = (startDate: string, endDate: string) => {
    const start = parseISO(startDate);
    const end = parseISO(endDate);

    const startDay = differenceInDays(start, monthStart);
    const duration = differenceInDays(end, start) + 1;

    const leftPercent = (startDay / daysInMonth) * 100;
    const widthPercent = (duration / daysInMonth) * 100;

    return {
      left: `${Math.max(0, leftPercent)}%`,
      width: `${Math.min(widthPercent, 100 - Math.max(0, leftPercent))}%`,
    };
  };

  const handleDrop = (draggedOrder: GanttOrder, targetOrder: GanttOrder) => {
    const dragIndex = orders.findIndex(o => o.id === draggedOrder.id);
    const targetIndex = orders.findIndex(o => o.id === targetOrder.id);

    if (dragIndex === -1 || targetIndex === -1) return;

    const newOrders = [...orders];
    newOrders.splice(dragIndex, 1);
    newOrders.splice(targetIndex, 0, draggedOrder);

    setOrders(newOrders);
    toast.success('Order reordered successfully', {
      description: `${draggedOrder.id} moved in schedule`,
    });
  };

  const previousMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleExport = () => {
    toast.success('Schedule exported', {
      description: 'Gantt chart exported to PDF',
    });
  };

  const dayLabels = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gantt Chart View</h1>
            <p className="text-gray-600 mt-2">Visual timeline with drag-and-drop scheduling</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={previousMonth}>
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <span className="text-lg font-semibold min-w-[150px] text-center">
              {viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <Button variant="outline" onClick={nextMonth}>
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Filter by Department:</label>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-6 flex gap-6 items-center">
        <span className="text-sm font-medium text-gray-700">Status:</span>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 rounded bg-blue-500" />
            <span className="text-sm text-gray-600">Planned</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 rounded bg-yellow-500" />
            <span className="text-sm text-gray-600">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 rounded bg-red-500" />
            <span className="text-sm text-gray-600">Delayed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 rounded bg-green-500" />
            <span className="text-sm text-gray-600">Completed</span>
          </div>
        </div>
        <span className="text-xs text-gray-500 ml-auto">💡 Drag rows to reorder schedule</span>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[1200px]">
              {/* Header */}
              <div className="flex border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
                <div className="w-80 shrink-0 p-4 border-r border-gray-200 font-semibold text-sm">
                  Manufacturing Orders
                </div>
                <div className="flex-1 relative">
                  <div className="flex h-full">
                    {dayLabels.map(day => (
                      <div
                        key={day}
                        className="flex-1 text-center text-xs text-gray-600 py-2 border-r border-gray-200 last:border-r-0"
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Gantt rows */}
              <div className="relative">
                {/* Grid lines */}
                <div className="absolute inset-0 flex pointer-events-none">
                  <div className="w-80 shrink-0" />
                  <div className="flex-1 flex">
                    {dayLabels.map(day => (
                      <div
                        key={day}
                        className="flex-1 border-r border-gray-100 last:border-r-0"
                      />
                    ))}
                  </div>
                </div>

                {sortedOrders.map((order, index) => {
                  const barStyle = getBarPosition(order.startDate, order.endDate);
                  return (
                    <DraggableGanttRow
                      key={order.id}
                      order={order}
                      barStyle={barStyle}
                      index={index}
                      onDrop={handleDrop}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {sortedOrders.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No orders found for the selected department
        </div>
      )}
    </div>
  );
}

export default function GanttView() {
  return (
    <DndProvider backend={HTML5Backend}>
      <GanttViewContent />
    </DndProvider>
  );
}
