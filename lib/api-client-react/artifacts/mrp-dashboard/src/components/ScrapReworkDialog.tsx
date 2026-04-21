import { useState } from 'react';
import { ManufacturingOrder, OrderModification } from '../data/mockData';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface ScrapReworkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  order: ManufacturingOrder;
  onSave: (updatedOrder: ManufacturingOrder) => void;
  type: 'scrap' | 'rework';
}

export function ScrapReworkDialog({ isOpen, onClose, order, onSave, type }: ScrapReworkDialogProps) {
  const [quantity, setQuantity] = useState<number>(0);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    if (quantity <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    if (!reason) {
      toast.error('Please select a reason');
      return;
    }

    // Create modification record
    const prevVal = (type === 'scrap' ? order.scrapQuantity || 0 : order.reworkQuantity || 0);
    const newVal = prevVal + quantity;
    const modification: OrderModification = {
      id: `MOD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: type === 'scrap' ? 'scrap' : 'rework',
      description: `${reason}${notes ? ': ' + notes : ''}`,
      changedBy: 'Current User',
      previousValue: String(prevVal),
      newValue: String(newVal),
    };

    // Update order
    const updatedOrder: ManufacturingOrder = {
      ...order,
      scrapQuantity: type === 'scrap' ? (order.scrapQuantity || 0) + quantity : order.scrapQuantity,
      reworkQuantity: type === 'rework' ? (order.reworkQuantity || 0) + quantity : order.reworkQuantity,
      defectNotes: notes || order.defectNotes,
      modificationHistory: [...(order.modificationHistory || []), modification],
      actualQuantityProduced: order.quantity - ((order.scrapQuantity || 0) + quantity),
    };

    // If significant scrap/rework, may need to update status
    const totalDefects = (updatedOrder.scrapQuantity || 0) + (updatedOrder.reworkQuantity || 0);
    if (totalDefects > order.quantity * 0.1 && order.status === 'in-progress') {
      updatedOrder.status = 'delayed';
      toast.warning(`Order status changed to Delayed due to ${type} quantity`);
    }

    onSave(updatedOrder);
    toast.success(`${type === 'scrap' ? 'Scrap' : 'Rework'} reported: ${quantity} units`);
    
    // Reset form
    setQuantity(0);
    setReason('');
    setNotes('');
    onClose();
  };

  const icon = type === 'scrap' ? <AlertTriangle className="w-5 h-5 text-red-500" /> : <RotateCcw className="w-5 h-5 text-yellow-500" />;
  const title = type === 'scrap' ? 'Report Scrap' : 'Initiate Rework';
  const description = type === 'scrap' 
    ? 'Record scrapped units that cannot be recovered'
    : 'Record units that require rework to meet quality standards';

  const scrapReasons = [
    'Material Defect',
    'Cutting Error',
    'Sewing Defect',
    'Machine Malfunction',
    'Quality Failure',
    'Measurement Error',
    'Color Mismatch',
    'Other',
  ];

  const reworkReasons = [
    'Minor Sewing Issue',
    'Thread Tension Problem',
    'Misaligned Pattern',
    'Quality Check Failed',
    'Customer Specification Change',
    'Finish Quality Issue',
    'Labeling Error',
    'Other',
  ];

  const reasons = type === 'scrap' ? scrapReasons : reworkReasons;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {icon}
            {title} - {order.id}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Current Order Status</Label>
            <div className="text-sm text-gray-600">
              <div>Original Quantity: {order.quantity} units</div>
              {order.scrapQuantity && order.scrapQuantity > 0 && (
                <div className="text-red-600">Scrapped: {order.scrapQuantity} units</div>
              )}
              {order.reworkQuantity && order.reworkQuantity > 0 && (
                <div className="text-yellow-600">In Rework: {order.reworkQuantity} units</div>
              )}
              <div className="font-medium">Expected Production: {order.actualQuantityProduced || order.quantity} units</div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity *</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={order.quantity}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              placeholder="Enter quantity"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id="reason">
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                {reasons.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional details..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant={type === 'scrap' ? 'destructive' : 'default'}>
            {type === 'scrap' ? 'Report Scrap' : 'Initiate Rework'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
