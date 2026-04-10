import { createBrowserRouter } from 'react-router';
import { DashboardLayout } from './components/layout/DashboardLayout';
import Overview from './pages/Overview';
import DepartmentPlanning from './pages/DepartmentPlanning';
import CalendarView from './pages/CalendarView';
import GanttView from './pages/GanttView';
import AnalyticsPage from './pages/AnalyticsPage';
import AlertsPage from './pages/AlertsPage';
import InventoryPage from './pages/InventoryPage';
import ProductsPage from './pages/ProductsPage';
import ManufacturingOrdersPage from './pages/ManufacturingOrdersPage';
import BOMPage from './pages/BOMPage';
import BOMDetailPage from './pages/BOMDetailPage';
import MRPPlanningPage from './pages/MRPPlanningPage';
import ProductionSchedulingPage from './pages/ProductionSchedulingPage';
import ShopFloorTerminal from './pages/ShopFloorTerminal';
import ProductionAnalyticsPage from './pages/ProductionAnalyticsPage';
import WorkCentersPage from './pages/WorkCentersPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <Overview />,
      },
      {
        path: 'orders',
        element: <ManufacturingOrdersPage />,
      },
      {
        path: 'bom',
        element: <BOMPage />,
      },
      {
        path: 'bom/:id',
        element: <BOMDetailPage />,
      },
      {
        path: 'mrp',
        element: <MRPPlanningPage />,
      },
      {
        path: 'work-centers',
        element: <WorkCentersPage />,
      },
      {
        path: 'calendar',
        element: <CalendarView />,
      },
      {
        path: 'gantt',
        element: <GanttView />,
      },
      {
        path: 'analytics',
        element: <AnalyticsPage />,
      },
      {
        path: 'alerts',
        element: <AlertsPage />,
      },
      {
        path: 'inventory',
        element: <InventoryPage />,
      },
      {
        path: 'products',
        element: <ProductsPage />,
      },
      {
        path: 'department/:departmentId',
        element: <DepartmentPlanning />,
      },
      {
        path: 'production-scheduling',
        element: <ProductionSchedulingPage />,
      },
      {
        path: 'shop-floor-terminal',
        element: <ShopFloorTerminal />,
      },
      {
        path: 'production-analytics',
        element: <ProductionAnalyticsPage />,
      },
    ],
  },
], {
  basename: import.meta.env.BASE_URL,
});
