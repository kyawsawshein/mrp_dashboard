import { Link, useLocation, Outlet } from 'react-router';
import { LayoutDashboard, Scissors, Shirt, Shield, Sparkles, ClipboardCheck, Package, Calendar, GanttChart, Bell, TrendingUp, Warehouse, Box, ClipboardList, FileText, Calculator, GitBranch, Monitor, BarChart3, Settings } from 'lucide-react';
import { cn } from '../ui/utils';
import { GlobalSearch } from '../GlobalSearch';
import { CreateOrderDialog } from '../CreateOrderDialog';

const navigation = [
  { name: 'Overview', path: '/', icon: LayoutDashboard },
  { name: 'Manufacturing Orders', path: '/orders', icon: ClipboardList },
  { name: 'MRP Planning', path: '/mrp', icon: Calculator },
  { name: 'Production Scheduling', path: '/production-scheduling', icon: GitBranch },
  { name: 'Work Centers & Routing', path: '/work-centers', icon: Settings },
  { name: 'Shop Floor Terminal', path: '/shop-floor-terminal', icon: Monitor },
  { name: 'Production Analytics', path: '/production-analytics', icon: BarChart3 },
  { name: 'Bill of Materials', path: '/bom', icon: FileText },
  { name: 'Calendar View', path: '/calendar', icon: Calendar },
  { name: 'Gantt Chart', path: '/gantt', icon: GanttChart },
  { name: 'Analytics & KPIs', path: '/analytics', icon: TrendingUp },
  { name: 'Alerts', path: '/alerts', icon: Bell },
  { name: 'Materials', path: '/inventory', icon: Warehouse },
  { name: 'Products', path: '/products', icon: Box },
  { name: '', path: '', icon: Package, type: 'divider' },
  { name: 'CNC Cutting', path: '/department/cnc-cutting', icon: Scissors },
  { name: 'Sewing Dept 1', path: '/department/sewing-1', icon: Shirt },
  { name: 'Sewing Dept 2', path: '/department/sewing-2', icon: Shirt },
  { name: 'Sewing Dept 3', path: '/department/sewing-3', icon: Shirt },
  { name: 'Sewing Dept 4', path: '/department/sewing-4', icon: Shirt },
  { name: 'Airbag Section', path: '/department/airbag', icon: Shield },
  { name: 'Embroidery', path: '/department/embroidery', icon: Sparkles },
  { name: 'Quality Control', path: '/department/qc', icon: ClipboardCheck },
  { name: 'Packing', path: '/department/packing', icon: Package },
];

export function DashboardLayout() {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">MRP Dashboard</h1>
          <p className="text-xs text-gray-500 mt-1">Car Seat Cover Manufacturing</p>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {navigation.map((item, index) => {
              if (item.type === 'divider') {
                return <li key={`divider-${index}`} className="my-3 border-t border-gray-200" />;
              }
              
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <GlobalSearch />
            <CreateOrderDialog />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}