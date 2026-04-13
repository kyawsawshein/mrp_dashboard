import { manufacturingOrders } from '../data/mockData';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, isWithinInterval } from 'date-fns';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { toast } from 'sonner';

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 1)); // April 2026
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get starting day of week (0 = Sunday)
  const startingDayOfWeek = monthStart.getDay();

  // Create array with empty slots for days before month starts
  const calendarDays = Array(startingDayOfWeek).fill(null).concat(daysInMonth);

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleExport = () => {
    toast.success('Calendar exported', {
      description: `${format(currentDate, 'MMMM yyyy')} schedule exported`,
    });
  };

  const getOrdersForDay = (day: Date) => {
    return manufacturingOrders.filter(order => {
      const orderStart = parseISO(order.startDate);
      const orderEnd = parseISO(order.endDate);
      return isWithinInterval(day, { start: orderStart, end: orderEnd });
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'bg-blue-500';
      case 'in-progress': return 'bg-yellow-500';
      case 'completed': return 'bg-green-500';
      case 'delayed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityBorder = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-gray-400';
      default: return 'border-l-gray-300';
    }
  };

  const today = new Date();

  const selectedDayOrders = selectedDay ? getOrdersForDay(selectedDay) : [];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Calendar View</h1>
            <p className="text-gray-600 mt-2">Manufacturing orders timeline</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" onClick={previousMonth}>
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <h2 className="text-xl font-semibold min-w-[180px] text-center">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <Button variant="outline" onClick={nextMonth}>
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-6 flex gap-6 items-center">
        <span className="text-sm font-medium text-gray-700">Status:</span>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500" />
            <span className="text-sm text-gray-600">Planned</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-yellow-500" />
            <span className="text-sm text-gray-600">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span className="text-sm text-gray-600">Delayed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span className="text-sm text-gray-600">Completed</span>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <Card>
        <CardContent className="p-0">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-gray-200">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-3 text-center font-semibold text-sm text-gray-700 border-r border-gray-200 last:border-r-0">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, index) => {
              const orders = day ? getOrdersForDay(day) : [];
              const isToday = day && isSameDay(day, today);

              return (
                <div
                  key={index}
                  className={`min-h-[140px] border-r border-b border-gray-200 last:border-r-0 p-2 ${
                    !day ? 'bg-gray-50' : ''
                  } ${isToday ? 'bg-blue-50' : ''} ${day ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                  onClick={() => day && orders.length > 0 && setSelectedDay(day)}
                >
                  {day && (
                    <>
                      <div className={`text-sm font-medium mb-2 ${
                        isToday ? 'text-blue-600' : 'text-gray-700'
                      }`}>
                        {format(day, 'd')}
                      </div>
                      <div className="space-y-1">
                        {orders.slice(0, 3).map(order => (
                          <div
                            key={order.id}
                            className={`text-xs p-1.5 rounded border-l-2 ${getPriorityBorder(order.priority)} bg-white shadow-sm hover:shadow-md transition-shadow`}
                            title={`${order.product} - ${order.id}`}
                          >
                            <div className="flex items-center gap-1 mb-0.5">
                              <div className={`w-2 h-2 rounded-full ${getStatusColor(order.status)}`} />
                              <span className="font-medium text-gray-900 truncate">
                                {order.id}
                              </span>
                            </div>
                            <div className="text-gray-600 truncate text-[10px]">
                              {order.product}
                            </div>
                          </div>
                        ))}
                        {orders.length > 3 && (
                          <div className="text-[10px] text-gray-500 text-center py-0.5">
                            +{orders.length - 3} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Day Details Dialog */}
      <Dialog open={!!selectedDay} onOpenChange={() => setSelectedDay(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Orders for {selectedDay && format(selectedDay, 'MMMM d, yyyy')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {selectedDayOrders.map(order => (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-lg">{order.id}</span>
                        <Badge
                          variant="outline"
                          className={
                            order.status === 'in-progress'
                              ? 'bg-yellow-100 text-yellow-700'
                              : order.status === 'delayed'
                              ? 'bg-red-100 text-red-700'
                              : order.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-blue-100 text-blue-700'
                          }
                        >
                          {order.status}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={
                            order.priority === 'high'
                              ? 'bg-red-100 text-red-700'
                              : order.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-700'
                          }
                        >
                          {order.priority} priority
                        </Badge>
                      </div>
                      <p className="text-gray-700">{order.product}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">{order.quantity}</p>
                      <p className="text-xs text-gray-500">units</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Start:</span>{' '}
                      <span className="font-medium">{format(parseISO(order.startDate), 'MMM d, yyyy')}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">End:</span>{' '}
                      <span className="font-medium">{format(parseISO(order.endDate), 'MMM d, yyyy')}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Completion:</span>{' '}
                      <span className="font-medium">{order.completion}%</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Department:</span>{' '}
                      <span className="font-medium capitalize">{order.department.replace('-', ' ')}</span>
                    </div>
                  </div>

                  {order.materials.some(m => m.status === 'shortage') && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                      ⚠️ Material shortages detected
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}