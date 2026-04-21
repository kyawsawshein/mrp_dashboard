import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  getMaterialVarianceReport,
  getScrapReworkSummary,
  materialConsumptions,
  productionEvents,
  scrapReworkRecords,
} from '../data/shopFloorEngine';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Activity,
  FileText,
} from 'lucide-react';

export default function ProductionAnalyticsPage() {
  const varianceReport = useMemo(() => getMaterialVarianceReport(), []);
  const scrapSummary = useMemo(() => getScrapReworkSummary(), []);

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Production Analytics</h1>
        <p className="text-gray-600 mt-2">Material variance, scrap analysis, and production performance</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Variance Cost</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">
                  ${(varianceReport.totalVarianceCost / 1000).toFixed(1)}k
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Scrap Cost</p>
                <p className="text-3xl font-bold text-red-600 mt-1">
                  ${(scrapSummary.totalScrapCost / 1000).toFixed(1)}k
                </p>
                <p className="text-xs text-gray-500 mt-1">{scrapSummary.totalScrapQty} units</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rework Cost</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">
                  ${(scrapSummary.totalReworkCost / 1000).toFixed(1)}k
                </p>
                <p className="text-xs text-gray-500 mt-1">{scrapSummary.totalReworkQty} units</p>
              </div>
              <Activity className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Production Events</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{productionEvents.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Material Variance Analysis */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Material Variance Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-600">Positive Variances (Over)</p>
                <p className="text-2xl font-bold text-red-600">{varianceReport.positiveVariances}</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Negative Variances (Under)</p>
                <p className="text-2xl font-bold text-green-600">{varianceReport.negativeVariances}</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Avg Variance %</p>
                <p className="text-2xl font-bold text-blue-600">{varianceReport.avgVariancePercent.toFixed(2)}%</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left text-sm text-gray-600">
                  <th className="pb-3 font-medium">Material</th>
                  <th className="pb-3 font-medium text-right">Planned</th>
                  <th className="pb-3 font-medium text-right">Actual</th>
                  <th className="pb-3 font-medium text-right">Variance</th>
                  <th className="pb-3 font-medium text-right">Variance %</th>
                  <th className="pb-3 font-medium text-center">Occurrences</th>
                </tr>
              </thead>
              <tbody>
                {varianceReport.byMaterial.map(mat => (
                  <tr key={mat.materialId} className="border-b hover:bg-gray-50">
                    <td className="py-3">
                      <p className="font-medium text-gray-900">{mat.materialName}</p>
                      <p className="text-xs text-gray-500">{mat.materialId}</p>
                    </td>
                    <td className="py-3 text-right font-medium">{mat.totalPlanned.toFixed(2)}</td>
                    <td className="py-3 text-right font-medium">{mat.totalActual.toFixed(2)}</td>
                    <td className="py-3 text-right">
                      <span className={mat.totalVariance >= 0 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                        {mat.totalVariance >= 0 ? '+' : ''}{mat.totalVariance.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Badge className={
                        Math.abs(mat.variancePercent) > 10 
                          ? 'bg-red-100 text-red-800' 
                          : Math.abs(mat.variancePercent) > 5
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-green-100 text-green-800'
                      }>
                        {mat.variancePercent >= 0 ? '+' : ''}{mat.variancePercent.toFixed(2)}%
                      </Badge>
                    </td>
                    <td className="py-3 text-center">{mat.occurrences}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Scrap & Rework Analysis */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Scrap & Rework by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={scrapSummary.byDepartment}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="scrapQty" fill="#ef4444" name="Scrap Qty" />
                <Bar dataKey="reworkQty" fill="#eab308" name="Rework Qty" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Scrap/Rework Reasons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scrapSummary.topReasons.map((reason, idx) => (
                <div key={idx} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{reason.reason}</span>
                    <Badge className="bg-red-100 text-red-800">
                      ${reason.totalCost.toFixed(2)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{reason.count} occurrences</span>
                    <span>•</span>
                    <span>Avg: ${(reason.totalCost / reason.count).toFixed(2)} per occurrence</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Material Consumption Log */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Recent Material Consumption</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left text-sm text-gray-600">
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Order</th>
                  <th className="pb-3 font-medium">Material</th>
                  <th className="pb-3 font-medium text-right">Planned</th>
                  <th className="pb-3 font-medium text-right">Actual</th>
                  <th className="pb-3 font-medium text-right">Scrap</th>
                  <th className="pb-3 font-medium text-right">Variance</th>
                  <th className="pb-3 font-medium">Operator</th>
                </tr>
              </thead>
              <tbody>
                {materialConsumptions.slice().reverse().slice(0, 10).map(consumption => (
                  <tr key={consumption.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 text-sm">
                      {new Date(consumption.consumedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <p className="text-sm font-medium">{consumption.orderId}</p>
                      <p className="text-xs text-gray-500">{consumption.orderName}</p>
                    </td>
                    <td className="py-3">
                      <p className="text-sm font-medium">{consumption.materialName}</p>
                    </td>
                    <td className="py-3 text-right text-sm">
                      {consumption.plannedQty} {consumption.unit}
                    </td>
                    <td className="py-3 text-right text-sm font-medium">
                      {consumption.actualQty} {consumption.unit}
                    </td>
                    <td className="py-3 text-right text-sm text-red-600">
                      {consumption.scrapQty} {consumption.unit}
                    </td>
                    <td className="py-3 text-right">
                      <span className={consumption.variance >= 0 ? 'text-red-600 text-sm font-medium' : 'text-green-600 text-sm font-medium'}>
                        {consumption.variance >= 0 ? '+' : ''}{consumption.variance.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 text-sm">{consumption.consumedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Scrap & Rework Records */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Scrap & Rework Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {scrapReworkRecords.slice().reverse().slice(0, 5).map(record => (
              <div key={record.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Badge className={record.type === 'scrap' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                      {record.type.toUpperCase()}
                    </Badge>
                    <span className="font-medium text-gray-900">{record.orderName}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={
                      record.status === 'resolved' ? 'bg-green-100 text-green-800' :
                      record.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {record.status}
                    </Badge>
                    <span className="font-medium text-red-600">${record.cost.toFixed(2)}</span>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 text-sm mb-2">
                  <div>
                    <p className="text-gray-600">Quantity</p>
                    <p className="font-medium">{record.quantity} {record.unit}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Department</p>
                    <p className="font-medium">{record.department}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Reported By</p>
                    <p className="font-medium">{record.reportedBy}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Date</p>
                    <p className="font-medium">{new Date(record.reportedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-sm">
                  <p className="text-gray-600">Reason:</p>
                  <p className="text-gray-900">{record.reason}</p>
                  {record.actionTaken && (
                    <>
                      <p className="text-gray-600 mt-2">Action Taken:</p>
                      <p className="text-gray-900">{record.actionTaken}</p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
