import { Material } from '../data/mockData';
import { AlertCircle, CheckCircle2, Package } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Badge } from './ui/badge';

interface MaterialRequirementsProps {
  materials: Material[];
}

export function MaterialRequirements({ materials }: MaterialRequirementsProps) {
  const getStatusConfig = (status: Material['status']) => {
    switch (status) {
      case 'sufficient':
        return {
          label: 'Sufficient',
          color: 'bg-green-100 text-green-700 border-green-200',
          icon: CheckCircle2,
        };
      case 'shortage':
        return {
          label: 'Shortage',
          color: 'bg-orange-100 text-orange-700 border-orange-200',
          icon: AlertCircle,
        };
      case 'ordered':
        return {
          label: 'On Order',
          color: 'bg-blue-100 text-blue-700 border-blue-200',
          icon: Package,
        };
      case 'critical':
        return {
          label: 'Critical',
          color: 'bg-red-100 text-red-700 border-red-200',
          icon: AlertCircle,
        };
      default:
        return {
          label: 'Unknown',
          color: 'bg-gray-100 text-gray-700 border-gray-200',
          icon: Package,
        };
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Material</TableHead>
            <TableHead className="text-right">Required</TableHead>
            <TableHead className="text-right">Available</TableHead>
            <TableHead className="text-right">Shortage</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {materials.map((material) => {
            const config = getStatusConfig(material.status);
            const StatusIcon = config.icon;
            const shortage = Math.max(0, material.required - material.available);

            return (
              <TableRow key={material.id}>
                <TableCell className="font-medium">
                  <div>
                    <p>{material.name}</p>
                    <p className="text-xs text-gray-500">{material.id}</p>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {material.required} {material.unit}
                </TableCell>
                <TableCell className="text-right">
                  {material.available} {material.unit}
                </TableCell>
                <TableCell className="text-right">
                  {shortage > 0 ? (
                    <span className="text-orange-600 font-semibold">
                      {shortage} {material.unit}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={config.color}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {config.label}
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
