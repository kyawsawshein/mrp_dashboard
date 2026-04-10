import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { WorkCenter } from '../data/workCenters';
import { departments } from '../data/mockData';

interface WorkCenterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workCenter?: WorkCenter | null;
  onSave: (workCenter: Partial<WorkCenter>) => void;
  mode: 'create' | 'edit';
}

export function WorkCenterDialog({
  open,
  onOpenChange,
  workCenter,
  onSave,
  mode,
}: WorkCenterDialogProps) {
  const [formData, setFormData] = useState<Partial<WorkCenter>>({
    code: '',
    name: '',
    type: 'manual',
    department: '',
    description: '',
    capacity: {
      hoursPerDay: 8,
      daysPerWeek: 5,
      efficiency: 85,
      utilizationTarget: 80,
    },
    costPerHour: 0,
    setupCostPerHour: 0,
    status: 'available',
    currentLoad: 0,
    operatorsRequired: 1,
    skillLevel: 'intermediate',
    maintenanceIntervalDays: 30,
  });

  useEffect(() => {
    if (workCenter && mode === 'edit') {
      setFormData(workCenter);
    } else if (mode === 'create') {
      setFormData({
        code: '',
        name: '',
        type: 'manual',
        department: '',
        description: '',
        capacity: {
          hoursPerDay: 8,
          daysPerWeek: 5,
          efficiency: 85,
          utilizationTarget: 80,
        },
        costPerHour: 0,
        setupCostPerHour: 0,
        status: 'available',
        currentLoad: 0,
        operatorsRequired: 1,
        skillLevel: 'intermediate',
        maintenanceIntervalDays: 30,
      });
    }
  }, [workCenter, mode, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.code?.trim()) {
      toast.error('Work Center code is required');
      return;
    }
    if (!formData.name?.trim()) {
      toast.error('Work Center name is required');
      return;
    }
    if (!formData.department) {
      toast.error('Department is required');
      return;
    }
    if (!formData.capacity || formData.capacity.hoursPerDay <= 0) {
      toast.error('Hours per day must be greater than 0');
      return;
    }

    onSave(formData);
    onOpenChange(false);
  };

  const updateField = (field: keyof WorkCenter, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateCapacity = (field: keyof WorkCenter['capacity'], value: number) => {
    setFormData(prev => ({
      ...prev,
      capacity: { ...prev.capacity!, [field]: value },
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create New Work Center' : 'Edit Work Center'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code">Work Center Code *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => updateField('code', e.target.value)}
                    placeholder="e.g., CNC-01"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="name">Work Center Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="e.g., CNC Cutting Machine #1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="type">Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: any) => updateField('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="machine">Machine</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="assembly">Assembly</SelectItem>
                      <SelectItem value="inspection">Inspection</SelectItem>
                      <SelectItem value="packaging">Packaging</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="department">Department *</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => updateField('department', value)}
                  >
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
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => updateField('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="busy">Busy</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="breakdown">Breakdown</SelectItem>
                      <SelectItem value="offline">Offline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="currentLoad">Current Load (%)</Label>
                  <Input
                    id="currentLoad"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.currentLoad}
                    onChange={(e) => updateField('currentLoad', parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    placeholder="Detailed description of work center capabilities..."
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Capacity Settings */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Capacity Settings</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hoursPerDay">Hours per Day *</Label>
                  <Input
                    id="hoursPerDay"
                    type="number"
                    min="0"
                    max="24"
                    step="0.5"
                    value={formData.capacity?.hoursPerDay}
                    onChange={(e) => updateCapacity('hoursPerDay', parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="daysPerWeek">Days per Week *</Label>
                  <Input
                    id="daysPerWeek"
                    type="number"
                    min="0"
                    max="7"
                    step="0.5"
                    value={formData.capacity?.daysPerWeek}
                    onChange={(e) => updateCapacity('daysPerWeek', parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="efficiency">Efficiency (%) *</Label>
                  <Input
                    id="efficiency"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.capacity?.efficiency}
                    onChange={(e) => updateCapacity('efficiency', parseFloat(e.target.value) || 0)}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Expected efficiency rate (typically 70-95%)</p>
                </div>

                <div>
                  <Label htmlFor="utilizationTarget">Target Utilization (%) *</Label>
                  <Input
                    id="utilizationTarget"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.capacity?.utilizationTarget}
                    onChange={(e) => updateCapacity('utilizationTarget', parseFloat(e.target.value) || 0)}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Desired utilization target (typically 70-85%)</p>
                </div>
              </div>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resource Requirements</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="operatorsRequired">Operators Required *</Label>
                  <Input
                    id="operatorsRequired"
                    type="number"
                    min="0"
                    value={formData.operatorsRequired}
                    onChange={(e) => updateField('operatorsRequired', parseInt(e.target.value) || 0)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="skillLevel">Skill Level *</Label>
                  <Select
                    value={formData.skillLevel}
                    onValueChange={(value: any) => updateField('skillLevel', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Costing */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Costing</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="costPerHour">Cost per Hour ($) *</Label>
                  <Input
                    id="costPerHour"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.costPerHour}
                    onChange={(e) => updateField('costPerHour', parseFloat(e.target.value) || 0)}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Regular operating cost</p>
                </div>

                <div>
                  <Label htmlFor="setupCostPerHour">Setup Cost per Hour ($) *</Label>
                  <Input
                    id="setupCostPerHour"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.setupCostPerHour}
                    onChange={(e) => updateField('setupCostPerHour', parseFloat(e.target.value) || 0)}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Cost during setup/changeover</p>
                </div>
              </div>
            </div>

            {/* Maintenance */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Maintenance Schedule</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="maintenanceIntervalDays">Maintenance Interval (days) *</Label>
                  <Input
                    id="maintenanceIntervalDays"
                    type="number"
                    min="0"
                    value={formData.maintenanceIntervalDays}
                    onChange={(e) => updateField('maintenanceIntervalDays', parseInt(e.target.value) || 0)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="lastMaintenance">Last Maintenance</Label>
                  <Input
                    id="lastMaintenance"
                    type="date"
                    value={formData.lastMaintenance || ''}
                    onChange={(e) => updateField('lastMaintenance', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="nextMaintenance">Next Maintenance</Label>
                  <Input
                    id="nextMaintenance"
                    type="date"
                    value={formData.nextMaintenance || ''}
                    onChange={(e) => updateField('nextMaintenance', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {mode === 'create' ? 'Create Work Center' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}