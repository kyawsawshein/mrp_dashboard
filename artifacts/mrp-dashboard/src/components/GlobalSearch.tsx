import { useState, useMemo, useEffect } from 'react';
import { Search, FileText, Package, AlertCircle, X, Box } from 'lucide-react';
import { Input } from './ui/input';
import { Dialog, DialogContent } from './ui/dialog';
import { Badge } from './ui/badge';
import { manufacturingOrders, inventoryItems, alerts, departments, finishedProducts } from '../data/mockData';
import { useNavigate } from 'react-router';

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const searchResults = useMemo(() => {
    if (!query.trim()) return { orders: [], inventory: [], alerts: [], departments: [], products: [] };

    const q = query.toLowerCase();

    const orders = manufacturingOrders.filter(
      o => o.id.toLowerCase().includes(q) || 
           o.product.toLowerCase().includes(q) ||
           o.department.toLowerCase().includes(q)
    ).slice(0, 5);

    const inventory = inventoryItems.filter(
      i => i.id.toLowerCase().includes(q) || 
           i.name.toLowerCase().includes(q) ||
           i.category.toLowerCase().includes(q)
    ).slice(0, 5);

    const products = finishedProducts.filter(
      p => p.id.toLowerCase().includes(q) || 
           p.name.toLowerCase().includes(q) ||
           p.sku.toLowerCase().includes(q) ||
           p.category.toLowerCase().includes(q)
    ).slice(0, 5);

    const alertResults = alerts.filter(
      a => a.title.toLowerCase().includes(q) || 
           a.description.toLowerCase().includes(q)
    ).slice(0, 5);

    const deptResults = departments.filter(
      d => d.name.toLowerCase().includes(q)
    ).slice(0, 3);

    return { 
      orders, 
      inventory, 
      alerts: alertResults, 
      departments: deptResults,
      products 
    };
  }, [query]);

  const totalResults = searchResults.orders.length + 
                       searchResults.inventory.length + 
                       searchResults.alerts.length +
                       searchResults.departments.length +
                       searchResults.products.length;

  const handleOrderClick = (orderId: string) => {
    const order = manufacturingOrders.find(o => o.id === orderId);
    if (order) {
      navigate(`/department/${order.department}`);
      setOpen(false);
      setQuery('');
    }
  };

  const handleDepartmentClick = (deptId: string) => {
    navigate(`/department/${deptId}`);
    setOpen(false);
    setQuery('');
  };

  const handleProductClick = () => {
    navigate('/products');
    setOpen(false);
    setQuery('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'bg-blue-100 text-blue-700';
      case 'in-progress': return 'bg-yellow-100 text-yellow-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'delayed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Keyboard shortcut to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <div className="relative w-full max-w-xs sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search... (⌘K)"
          className="pl-9 w-full"
          onClick={() => setOpen(true)}
          readOnly
        />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[600px] p-0 gap-0">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search everything..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 pr-10 text-base border-0 focus-visible:ring-0"
                autoFocus
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="overflow-y-auto max-h-[500px]">
            {!query ? (
              <div className="p-8 text-center text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Start typing to search orders, inventory, products, alerts, and departments</p>
                <p className="text-sm mt-2 text-gray-400">Try searching for an order ID, product name, or material</p>
              </div>
            ) : totalResults === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No results found for "{query}"</p>
              </div>
            ) : (
              <div className="p-2">
                {/* Manufacturing Orders */}
                {searchResults.orders.length > 0 && (
                  <div className="mb-4">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                      Manufacturing Orders ({searchResults.orders.length})
                    </div>
                    <div className="space-y-1">
                      {searchResults.orders.map(order => (
                        <button
                          key={order.id}
                          onClick={() => handleOrderClick(order.id)}
                          className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                <span className="font-medium text-sm">{order.id}</span>
                                <Badge variant="outline" className={`text-xs ${getStatusColor(order.status)}`}>
                                  {order.status}
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-600 truncate">{order.product}</div>
                            </div>
                            <div className="text-xs text-gray-500 ml-4">
                              {order.quantity} units
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Finished Products */}
                {searchResults.products.length > 0 && (
                  <div className="mb-4">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                      Finished Products ({searchResults.products.length})
                    </div>
                    <div className="space-y-1">
                      {searchResults.products.map(product => (
                        <button
                          key={product.id}
                          onClick={handleProductClick}
                          className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Box className="w-4 h-4 text-purple-500 flex-shrink-0" />
                                <span className="font-medium text-sm">{product.name}</span>
                              </div>
                              <div className="text-xs text-gray-500">{product.sku}</div>
                            </div>
                            <div className="text-sm text-gray-700 ml-4">
                              {product.currentStock} {product.unit}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Departments */}
                {searchResults.departments.length > 0 && (
                  <div className="mb-4">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                      Departments ({searchResults.departments.length})
                    </div>
                    <div className="space-y-1">
                      {searchResults.departments.map(dept => (
                        <button
                          key={dept.id}
                          onClick={() => handleDepartmentClick(dept.id)}
                          className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-purple-500" />
                            <span className="font-medium text-sm">{dept.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Inventory */}
                {searchResults.inventory.length > 0 && (
                  <div className="mb-4">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                      Materials ({searchResults.inventory.length})
                    </div>
                    <div className="space-y-1">
                      {searchResults.inventory.map(item => (
                        <div
                          key={item.id}
                          className="px-3 py-2 rounded hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Package className="w-4 h-4 text-green-500 flex-shrink-0" />
                                <span className="font-medium text-sm">{item.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {item.category}
                                </Badge>
                              </div>
                              <div className="text-xs text-gray-500">{item.id}</div>
                            </div>
                            <div className="text-sm text-gray-700 ml-4">
                              {item.currentStock} {item.unit}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Alerts */}
                {searchResults.alerts.length > 0 && (
                  <div className="mb-4">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                      Alerts ({searchResults.alerts.length})
                    </div>
                    <div className="space-y-1">
                      {searchResults.alerts.map(alert => (
                        <div
                          key={alert.id}
                          className="px-3 py-2 rounded hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-start gap-2">
                            <AlertCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                              alert.type === 'critical' ? 'text-red-500' :
                              alert.type === 'warning' ? 'text-yellow-500' : 'text-blue-500'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm mb-1">{alert.title}</div>
                              <div className="text-xs text-gray-600 line-clamp-2">{alert.description}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {totalResults > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 text-center">
              Found {totalResults} result{totalResults !== 1 ? 's' : ''}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}