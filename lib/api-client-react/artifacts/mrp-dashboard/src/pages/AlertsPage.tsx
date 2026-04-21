import { useState } from 'react';
import { alerts, Alert } from '../data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { AlertCircle, AlertTriangle, Info, Clock, Package, ShieldAlert, TrendingUp, Check, X, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';

export default function AlertsPage() {
  const [alertList, setAlertList] = useState<Alert[]>(alerts);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const criticalAlerts = alertList.filter(a => a.type === 'critical');
  const warningAlerts = alertList.filter(a => a.type === 'warning');
  const infoAlerts = alertList.filter(a => a.type === 'info');

  // Alert Management Actions
  const handleResolveAlert = (alertId: string) => {
    setAlertList(alertList.filter(a => a.id !== alertId));
    toast.success('Alert resolved and removed from the list');
  };

  const handleDismissAlert = (alertId: string) => {
    setAlertList(alertList.filter(a => a.id !== alertId));
    toast.info('Alert dismissed');
  };

  const handleViewDetails = (alert: Alert) => {
    setSelectedAlert(alert);
    setIsDetailDialogOpen(true);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertCircle className="w-5 h-5" />;
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      case 'info': return <Info className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'material': return <Package className="w-4 h-4" />;
      case 'schedule': return <Clock className="w-4 h-4" />;
      case 'quality': return <ShieldAlert className="w-4 h-4" />;
      case 'capacity': return <TrendingUp className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'critical': return 'border-red-500 bg-red-50';
      case 'warning': return 'border-yellow-500 bg-yellow-50';
      case 'info': return 'border-blue-500 bg-blue-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'info': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return '';
    }
  };

  const AlertCard = ({ alert }: { alert: Alert }) => (
    <Card className={`border-l-4 ${getTypeColor(alert.type)}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className={`mt-0.5 ${
            alert.type === 'critical' ? 'text-red-600' :
            alert.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'
          }`}>
            {getIcon(alert.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
              </div>
              <Badge variant="outline" className={getTypeBadge(alert.type)}>
                {alert.type}
              </Badge>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-3">
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  {getCategoryIcon(alert.category)}
                  <span className="capitalize">{alert.category}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}</span>
                </div>
                {alert.relatedTo && (
                  <div className="text-blue-600 font-medium">{alert.relatedTo}</div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => handleViewDetails(alert)}>
                  <Eye className="w-3 h-3 mr-1" />
                  View
                </Button>
                {alert.actionable && (
                  <Button size="sm" onClick={() => handleResolveAlert(alert.id)}>
                    <Check className="w-3 h-3 mr-1" />
                    Resolve
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => handleDismissAlert(alert.id)}>
                  <X className="w-3 h-3 mr-1" />
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Alerts & Notifications</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">Real-time system alerts and manufacturing notifications</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Critical Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-8 h-8 text-red-500" />
              <span className="text-2xl sm:text-xl sm:text-lg sm:text-xl lg:text-2xl lg:text-3xl font-bold text-red-600">{criticalAlerts.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Warnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
              <span className="text-2xl sm:text-xl sm:text-lg sm:text-xl lg:text-2xl lg:text-3xl font-bold text-yellow-600">{warningAlerts.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Info className="w-8 h-8 text-blue-500" />
              <span className="text-2xl sm:text-xl sm:text-lg sm:text-xl lg:text-2xl lg:text-3xl font-bold text-blue-600">{infoAlerts.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">
            All Alerts ({alertList.length})
          </TabsTrigger>
          <TabsTrigger value="critical">
            Critical ({criticalAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="warning">
            Warnings ({warningAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="info">
            Info ({infoAlerts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          {alertList.length > 0 ? (
            alertList.map((alert) => <AlertCard key={alert.id} alert={alert} />)
          ) : (
            <Card>
              <CardContent className="p-12 text-center text-gray-500">
                <Info className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No alerts at this time</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="critical" className="space-y-4 mt-6">
          {criticalAlerts.length > 0 ? (
            criticalAlerts.map((alert) => <AlertCard key={alert.id} alert={alert} />)
          ) : (
            <Card>
              <CardContent className="p-12 text-center text-gray-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No critical alerts</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="warning" className="space-y-4 mt-6">
          {warningAlerts.length > 0 ? (
            warningAlerts.map((alert) => <AlertCard key={alert.id} alert={alert} />)
          ) : (
            <Card>
              <CardContent className="p-12 text-center text-gray-500">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No warning alerts</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="info" className="space-y-4 mt-6">
          {infoAlerts.length > 0 ? (
            infoAlerts.map((alert) => <AlertCard key={alert.id} alert={alert} />)
          ) : (
            <Card>
              <CardContent className="p-12 text-center text-gray-500">
                <Info className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No info alerts</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Alert Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedAlert && getIcon(selectedAlert.type)}
              {selectedAlert?.title}
            </DialogTitle>
            <DialogDescription>
              Alert Details and Information
            </DialogDescription>
          </DialogHeader>

          {selectedAlert && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-1">Description</h4>
                <p className="text-sm text-gray-600">{selectedAlert.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">Type</h4>
                  <Badge variant="outline" className={getTypeBadge(selectedAlert.type)}>
                    {selectedAlert.type}
                  </Badge>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">Category</h4>
                  <div className="flex items-center gap-1 text-sm capitalize">
                    {getCategoryIcon(selectedAlert.category)}
                    {selectedAlert.category}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-1">Timestamp</h4>
                <p className="text-sm text-gray-600">
                  {new Date(selectedAlert.timestamp).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDistanceToNow(new Date(selectedAlert.timestamp), { addSuffix: true })}
                </p>
              </div>

              {selectedAlert.relatedTo && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">Related To</h4>
                  <p className="text-sm text-blue-600 font-medium">{selectedAlert.relatedTo}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                {selectedAlert.actionable && (
                  <Button 
                    className="flex-1" 
                    onClick={() => {
                      handleResolveAlert(selectedAlert.id);
                      setIsDetailDialogOpen(false);
                    }}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Resolve Alert
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    handleDismissAlert(selectedAlert.id);
                    setIsDetailDialogOpen(false);
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Dismiss
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
