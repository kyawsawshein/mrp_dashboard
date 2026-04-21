import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { productionTrends, departmentPerformance, defectsByDepartment } from '../data/mockData';
import { LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Target, AlertTriangle, Award } from 'lucide-react';

export default function AnalyticsPage() {
  const currentMonthEfficiency = productionTrends[productionTrends.length - 1].efficiency;
  const previousMonthEfficiency = productionTrends[productionTrends.length - 2].efficiency;
  const efficiencyTrend = currentMonthEfficiency - previousMonthEfficiency;

  const avgOEE = (departmentPerformance.reduce((sum, d) => sum + d.oee, 0) / departmentPerformance.length).toFixed(1);
  const avgYield = (departmentPerformance.reduce((sum, d) => sum + d.yield, 0) / departmentPerformance.length).toFixed(1);
  const totalDefects = defectsByDepartment.reduce((sum, d) => sum + d.defects, 0);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics & KPIs</h1>
        <p className="text-gray-600 mt-2">Production efficiency, OEE tracking, and performance metrics</p>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-600 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Production Efficiency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold">{currentMonthEfficiency}%</div>
                <div className={`text-xs flex items-center gap-1 mt-1 ${
                  efficiencyTrend >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {efficiencyTrend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(efficiencyTrend).toFixed(1)}% vs last month
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-600 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Overall OEE
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{avgOEE}%</div>
            <div className="text-xs text-gray-500 mt-1">Across all departments</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-600 flex items-center gap-2">
              <Award className="w-4 h-4" />
              Average Yield
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{avgYield}%</div>
            <div className="text-xs text-gray-500 mt-1">Quality rate</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-600 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Total Defects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{totalDefects}</div>
            <div className="text-xs text-gray-500 mt-1">This month</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Production Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Production Trends (6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={productionTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="planned" stroke="#3b82f6" strokeWidth={2} name="Planned" />
                <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} name="Actual" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Efficiency Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Efficiency Trend (%)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={productionTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[70, 100]} />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="efficiency" 
                  stroke="#8b5cf6" 
                  strokeWidth={3} 
                  name="Efficiency"
                  dot={{ fill: '#8b5cf6', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Department Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Department Efficiency Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={departmentPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" angle={-45} textAnchor="end" height={100} fontSize={11} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="efficiency" fill="#3b82f6" name="Efficiency %" />
                <Bar dataKey="oee" fill="#10b981" name="OEE %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Defects by Department */}
        <Card>
          <CardHeader>
            <CardTitle>Defects by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={defectsByDepartment}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="defects" fill="#ef4444" name="Defects" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Department Performance Radar */}
      <Card>
        <CardHeader>
          <CardTitle>Department Performance Radar (Top 6)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={departmentPerformance.slice(0, 6)}>
              <PolarGrid />
              <PolarAngleAxis dataKey="department" fontSize={12} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar name="Efficiency" dataKey="efficiency" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              <Radar name="OEE" dataKey="oee" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
              <Radar name="Yield" dataKey="yield" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
              <Legend />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
