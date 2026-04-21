import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { boms, BOM, BOMItem } from '../data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { ArrowLeft, Download, Printer, FileText, Upload, Plus, Pencil, Trash2, History, GitBranch, FileImage, FileCode, AlertCircle, Check, X, Clock, Save, Eye, ChevronDown, ChevronUp, Package, Layers, DollarSign, Users, Calendar, Building, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';

interface Revision {
  revisionNumber: string;
  version: string;
  date: string;
  author: string;
  description: string;
  status: 'draft' | 'approved' | 'obsolete';
  approvedBy?: string;
  approvedDate?: string;
}

interface Attachment {
  id: string;
  name: string;
  type: 'drawing' | 'cnc-file' | 'assembly' | 'photo' | 'cad' | 'spec' | 'other';
  size: string;
  uploadedBy: string;
  uploadedDate: string;
  revisionNumber?: string;
}

interface ChangeOrder {
  id: string;
  ecoNumber: string;
  title: string;
  description: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  initiatedBy: string;
  date: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface MaterialSpec {
  // Fabric specifications
  gsm?: number;
  width?: number;
  composition?: string;
  finish?: string;
  // Lamination specs
  laminationType?: string;
  adhesiveType?: string;
  foamThickness?: number;
  foamDensity?: number;
  // Thread specs
  threadType?: string;
  threadWeight?: string;
  threadColor?: string;
  // Fastener specs
  fastenerType?: string;
  fastenerSize?: string;
  fastenerMaterial?: string;
  // General specs
  color?: string;
  supplier?: string;
  supplierSKU?: string;
  moq?: number;
  leadTimeDays?: number;
  certifications?: string[];
}

interface ExtendedBOMItem extends BOMItem {
  specifications?: MaterialSpec;
  alternativeMaterials?: string[];
  processingNotes?: string;
  qualityRequirements?: string;
  storageRequirements?: string;
  shelfLife?: number;
  hazardInfo?: string;
}

export default function BOMDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const bom = boms.find(b => b.id === id);

  const [activeTab, setActiveTab] = useState('details');
  const [isEditMode, setIsEditMode] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [isNewRevisionDialogOpen, setIsNewRevisionDialogOpen] = useState(false);
  const [isAttachmentDialogOpen, setIsAttachmentDialogOpen] = useState(false);
  const [isECODialogOpen, setIsECODialogOpen] = useState(false);
  const [isPrintPreview, setIsPrintPreview] = useState(false);

  // Enhanced BOM items with specifications
  const [extendedItems, setExtendedItems] = useState<ExtendedBOMItem[]>(
    bom?.items.map((item, index) => ({
      ...item,
      specifications: index === 0 ? {
        gsm: 650,
        width: 54,
        composition: 'Top Grain Leather',
        finish: 'Aniline Dye',
        color: 'Jet Black',
        supplier: 'Premium Leather Co.',
        supplierSKU: 'PLC-LEA-650-BLK',
        moq: 50,
        leadTimeDays: 21,
        certifications: ['ISO 9001', 'REACH Compliant']
      } : index === 1 ? {
        threadType: 'Polyester Core',
        threadWeight: 'Tex 70',
        threadColor: 'Black',
        supplier: 'Industrial Threads Ltd',
        supplierSKU: 'ITL-THR-70-BLK',
        moq: 100,
        leadTimeDays: 7
      } : {
        supplier: 'General Supplies Inc',
        leadTimeDays: 14
      },
      processingNotes: index === 0 ? 'Pre-condition leather at 20°C for 24hrs before cutting' : '',
      qualityRequirements: index === 0 ? 'Visual inspection for grain consistency, no defects > 2mm' : ''
    })) || []
  );

  // Mock data for enterprise features
  const [revisions, setRevisions] = useState<Revision[]>([
    {
      revisionNumber: 'C',
      version: '1.2',
      date: '2026-04-01',
      author: 'Engineering Team',
      description: 'Updated foam thickness specification from 5mm to 8mm for improved comfort',
      status: 'approved',
      approvedBy: 'Production Manager',
      approvedDate: '2026-04-02'
    },
    {
      revisionNumber: 'B',
      version: '1.1',
      date: '2026-02-15',
      author: 'Engineering Team',
      description: 'Changed thread supplier, updated cost',
      status: 'approved',
      approvedBy: 'Quality Manager',
      approvedDate: '2026-02-16'
    },
    {
      revisionNumber: 'A',
      version: '1.0',
      date: '2026-01-01',
      author: 'Product Designer',
      description: 'Initial release',
      status: 'obsolete',
      approvedBy: 'Engineering Manager',
      approvedDate: '2026-01-05'
    }
  ]);

  const [attachments, setAttachments] = useState<Attachment[]>([
    {
      id: 'ATT-001',
      name: 'Assembly_Drawing_Rev_C.pdf',
      type: 'drawing',
      size: '2.4 MB',
      uploadedBy: 'Design Team',
      uploadedDate: '2026-04-01',
      revisionNumber: 'C'
    },
    {
      id: 'ATT-002',
      name: 'CNC_Cut_Pattern_Front_Seat.dxf',
      type: 'cnc-file',
      size: '856 KB',
      uploadedBy: 'CAD Engineer',
      uploadedDate: '2026-04-01',
      revisionNumber: 'C'
    },
    {
      id: 'ATT-003',
      name: 'Sewing_Instructions.pdf',
      type: 'assembly',
      size: '1.1 MB',
      uploadedBy: 'Production Manager',
      uploadedDate: '2026-03-28',
      revisionNumber: 'C'
    },
    {
      id: 'ATT-004',
      name: 'Product_Photo_Installed.jpg',
      type: 'photo',
      size: '3.2 MB',
      uploadedBy: 'Marketing Team',
      uploadedDate: '2026-03-15',
    },
    {
      id: 'ATT-005',
      name: 'CAD_Model_3D.step',
      type: 'cad',
      size: '12.5 MB',
      uploadedBy: 'CAD Engineer',
      uploadedDate: '2026-04-01',
      revisionNumber: 'C'
    },
  ]);

  const [changeOrders, setChangeOrders] = useState<ChangeOrder[]>([
    {
      id: 'ECO-001',
      ecoNumber: 'ECO-2026-045',
      title: 'Upgrade foam thickness for comfort improvement',
      description: 'Customer feedback indicates need for thicker padding. Increase foam from 5mm to 8mm.',
      status: 'approved',
      initiatedBy: 'Customer Service',
      date: '2026-03-25',
      priority: 'high'
    },
    {
      id: 'ECO-002',
      ecoNumber: 'ECO-2026-032',
      title: 'Alternative thread supplier qualification',
      description: 'Primary thread supplier experiencing delays. Qualify secondary supplier.',
      status: 'approved',
      initiatedBy: 'Procurement',
      date: '2026-02-10',
      priority: 'medium'
    }
  ]);

  if (!bom) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">BOM Not Found</h1>
          <Button onClick={() => navigate('/bom')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to BOM List
          </Button>
        </div>
      </div>
    );
  }

  const toggleItemExpansion = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const handlePrint = () => {
    setIsPrintPreview(true);
    setTimeout(() => {
      window.print();
      setIsPrintPreview(false);
    }, 500);
    toast.success('Print dialog opened');
  };

  const handleExportExcel = () => {
    const csvContent = generateDetailedCSV(bom, extendedItems);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BOM_${bom.id}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('BOM exported to CSV successfully');
  };

  const generateDetailedCSV = (bom: BOM, items: ExtendedBOMItem[]) => {
    const headers = [
      'Item #', 'Material Name', 'SKU', 'Quantity', 'Unit', 'Scrap %', 
      'Qty w/ Scrap', 'Unit Cost', 'Total Cost', 'Supplier', 'Supplier SKU', 
      'Lead Time (Days)', 'MOQ', 'Notes', 'Processing Notes', 'Quality Requirements'
    ];
    const rows = items.map((item, index) => {
      const qtyWithScrap = item.quantity * (1 + item.scrapFactor / 100);
      const totalCost = qtyWithScrap * item.costPerUnit;
      return [
        index + 1,
        item.materialName,
        item.materialId,
        item.quantity,
        item.unit,
        item.scrapFactor,
        qtyWithScrap.toFixed(3),
        item.costPerUnit.toFixed(2),
        totalCost.toFixed(2),
        item.specifications?.supplier || '',
        item.specifications?.supplierSKU || '',
        item.specifications?.leadTimeDays || '',
        item.specifications?.moq || '',
        item.notes || '',
        item.processingNotes || '',
        item.qualityRequirements || ''
      ];
    });
    
    return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  };

  const handleExportPDF = () => {
    toast.success('PDF export functionality would generate a formatted PDF with all specifications');
  };

  const handleNewRevision = () => {
    const newRevNumber = String.fromCharCode(revisions[0].revisionNumber.charCodeAt(0) + 1);
    toast.success(`Creating new revision ${newRevNumber}`);
    setIsNewRevisionDialogOpen(true);
  };

  const handleUploadAttachment = () => {
    setIsAttachmentDialogOpen(true);
  };

  const handleNewECO = () => {
    setIsECODialogOpen(true);
  };

  const handleSave = () => {
    toast.success('BOM changes saved successfully');
    setIsEditMode(false);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      active: 'bg-green-500 text-white',
      draft: 'bg-yellow-500 text-white',
      obsolete: 'bg-gray-500 text-white',
      approved: 'bg-green-500 text-white',
      'pending-approval': 'bg-blue-500 text-white',
      submitted: 'bg-blue-500 text-white',
      rejected: 'bg-red-500 text-white',
    };
    return badges[status as keyof typeof badges] || '';
  };

  const getAttachmentIcon = (type: string) => {
    switch (type) {
      case 'drawing': return <FileText className="w-4 h-4" />;
      case 'cnc-file': return <FileCode className="w-4 h-4" />;
      case 'photo': return <FileImage className="w-4 h-4" />;
      case 'cad': return <FileCode className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const badges = {
      low: 'bg-gray-500 text-white',
      medium: 'bg-blue-500 text-white',
      high: 'bg-orange-500 text-white',
      critical: 'bg-red-500 text-white',
    };
    return badges[priority as keyof typeof badges] || '';
  };

  // Print styles
  const printStyles = `
    @media print {
      @page {
        size: A4 landscape;
        margin: 15mm;
      }
      
      body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
      
      .no-print {
        display: none !important;
      }
      
      .print-only {
        display: block !important;
      }
      
      .print-page-break {
        page-break-after: always;
      }
      
      table {
        page-break-inside: auto;
      }
      
      tr {
        page-break-inside: avoid;
        page-break-after: auto;
      }
      
      thead {
        display: table-header-group;
      }
      
      tfoot {
        display: table-footer-group;
      }
    }
  `;

  return (
    <>
      <style>{printStyles}</style>
      
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Fixed Header */}
        <div className="bg-white border-b px-8 py-4 no-print">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => navigate('/bom')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to List
              </Button>
              <div className="h-8 w-px bg-gray-300" />
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">{bom.productName}</h1>
                  <Badge className={getStatusBadge(bom.status)}>
                    {bom.status.toUpperCase()}
                  </Badge>
                  {isEditMode && (
                    <Badge className="bg-orange-500 text-white">
                      <Pencil className="w-3 h-3 mr-1" />
                      EDITING
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                  <span className="flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    BOM #: <strong>{bom.id}</strong>
                  </span>
                  <span>•</span>
                  <span>SKU: <strong>{bom.productSKU}</strong></span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <GitBranch className="w-3 h-3" />
                    Rev: <strong>{revisions[0]?.revisionNumber || 'A'}</strong>
                  </span>
                  <span>•</span>
                  <span>Version: <strong>{bom.version}</strong></span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Modified: <strong>{new Date(bom.lastModified).toLocaleDateString()}</strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {isEditMode ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => setIsEditMode(false)}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={handlePrint}>
                    <Printer className="w-4 h-4 mr-2" />
                    Print
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportExcel}>
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportPDF}>
                    <FileText className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                  <Button size="sm" onClick={handleNewRevision}>
                    <GitBranch className="w-4 h-4 mr-2" />
                    New Revision
                  </Button>
                  <Button size="sm" onClick={() => setIsEditMode(true)}>
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit BOM
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="flex gap-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
              <Layers className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">{extendedItems.length} Items</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Total: ${bom.totalCost.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-lg">
              <FileText className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium">{attachments.length} Attachments</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 rounded-lg">
              <AlertCircle className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium">{changeOrders.length} ECOs</span>
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="no-print">
              <TabsList className="mb-6">
                <TabsTrigger value="details">
                  <Package className="w-4 h-4 mr-2" />
                  BOM Details & Materials
                </TabsTrigger>
                <TabsTrigger value="specifications">
                  <FileText className="w-4 h-4 mr-2" />
                  Material Specifications
                </TabsTrigger>
                <TabsTrigger value="revisions">
                  <History className="w-4 h-4 mr-2" />
                  Revision History ({revisions.length})
                </TabsTrigger>
                <TabsTrigger value="attachments">
                  <FileImage className="w-4 h-4 mr-2" />
                  Attachments ({attachments.length})
                </TabsTrigger>
                <TabsTrigger value="changes">
                  <GitBranch className="w-4 h-4 mr-2" />
                  Change Orders ({changeOrders.length})
                </TabsTrigger>
                <TabsTrigger value="costing">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Cost Analysis
                </TabsTrigger>
                <TabsTrigger value="production">
                  <Building className="w-4 h-4 mr-2" />
                  Production Info
                </TabsTrigger>
              </TabsList>

              {/* BOM Details Tab - Full Width Material List */}
              <TabsContent value="details" className="space-y-6">
                {/* Header Cards Row */}
                <div className="grid grid-cols-5 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-xs text-gray-500">Product Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-semibold text-lg mb-1">{bom.productName}</p>
                      <p className="text-sm text-gray-600">SKU: {bom.productSKU}</p>
                      <p className="text-xs text-gray-500 mt-2">Created by {bom.createdBy}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-xs text-gray-500">Version Control</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-semibold text-2xl mb-1">{bom.version}</p>
                      <p className="text-sm text-gray-600">Revision: {revisions[0]?.revisionNumber || 'A'}</p>
                      <p className="text-xs text-gray-500 mt-2">Effective: {new Date(bom.effectiveDate).toLocaleDateString()}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-xs text-gray-500">Material Cost</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-bold text-2xl text-green-600 mb-1">${bom.totalMaterialCost.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">{extendedItems.length} materials</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-xs text-gray-500">Labor & Overhead</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">Labor: <span className="font-semibold">${bom.laborCost.toFixed(2)}</span></p>
                      <p className="text-sm">Overhead: <span className="font-semibold">${bom.overheadCost.toFixed(2)}</span></p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-xs text-green-700">Total Cost</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-bold text-3xl text-green-700">${bom.totalCost.toFixed(2)}</p>
                      <p className="text-xs text-green-600">Per unit</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Materials Table - Full Width */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Bill of Materials - Line Items</CardTitle>
                    <div className="flex gap-2">
                      {isEditMode && (
                        <Button size="sm" onClick={() => setIsAddItemDialogOpen(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Material
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => {
                        if (expandedItems.size === extendedItems.length) {
                          setExpandedItems(new Set());
                        } else {
                          setExpandedItems(new Set(extendedItems.map(i => i.id)));
                        }
                      }}>
                        {expandedItems.size === extendedItems.length ? 'Collapse All' : 'Expand All'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-100 border-b-2 border-gray-300">
                          <tr>
                            <th className="text-left p-4 text-xs font-bold text-gray-700 w-12">#</th>
                            <th className="text-left p-4 text-xs font-bold text-gray-700">Material Name / Description</th>
                            <th className="text-left p-4 text-xs font-bold text-gray-700 w-32">SKU</th>
                            <th className="text-right p-4 text-xs font-bold text-gray-700 w-24">Quantity</th>
                            <th className="text-left p-4 text-xs font-bold text-gray-700 w-20">Unit</th>
                            <th className="text-right p-4 text-xs font-bold text-gray-700 w-24">Scrap %</th>
                            <th className="text-right p-4 text-xs font-bold text-gray-700 w-28">Qty w/ Scrap</th>
                            <th className="text-right p-4 text-xs font-bold text-gray-700 w-28">Unit Cost</th>
                            <th className="text-right p-4 text-xs font-bold text-gray-700 w-32">Extended Cost</th>
                            <th className="text-left p-4 text-xs font-bold text-gray-700 w-32">Supplier</th>
                            {isEditMode && (
                              <th className="text-center p-4 text-xs font-bold text-gray-700 w-24">Actions</th>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {extendedItems.map((item, index) => {
                            const qtyWithScrap = item.quantity * (1 + item.scrapFactor / 100);
                            const totalCost = qtyWithScrap * item.costPerUnit;
                            const isExpanded = expandedItems.has(item.id);
                            
                            return (
                              <>
                                <tr key={item.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => toggleItemExpansion(item.id)}>
                                  <td className="p-4">
                                    <div className="flex items-center gap-2">
                                      {isExpanded ? (
                                        <ChevronUp className="w-4 h-4 text-gray-400" />
                                      ) : (
                                        <ChevronDown className="w-4 h-4 text-gray-400" />
                                      )}
                                      <span className="font-semibold text-gray-700">{index + 1}</span>
                                    </div>
                                  </td>
                                  <td className="p-4">
                                    <div className="font-semibold text-gray-900">{item.materialName}</div>
                                    {item.notes && (
                                      <div className="text-xs text-gray-500 mt-1">{item.notes}</div>
                                    )}
                                  </td>
                                  <td className="p-4">
                                    <span className="text-sm font-mono text-gray-600">{item.materialId}</span>
                                  </td>
                                  <td className="p-4 text-right">
                                    {isEditMode ? (
                                      <Input
                                        type="number"
                                        value={item.quantity}
                                        className="w-20 text-right"
                                        step="0.1"
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                    ) : (
                                      <span className="font-semibold">{item.quantity}</span>
                                    )}
                                  </td>
                                  <td className="p-4">
                                    <span className="text-sm">{item.unit}</span>
                                  </td>
                                  <td className="p-4 text-right">
                                    {isEditMode ? (
                                      <Input
                                        type="number"
                                        value={item.scrapFactor}
                                        className="w-20 text-right"
                                        step="0.1"
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                    ) : (
                                      <span className="text-orange-600 font-medium">{item.scrapFactor}%</span>
                                    )}
                                  </td>
                                  <td className="p-4 text-right">
                                    <span className="font-semibold text-orange-700">{qtyWithScrap.toFixed(3)}</span>
                                  </td>
                                  <td className="p-4 text-right">
                                    <span className="font-medium">${item.costPerUnit.toFixed(2)}</span>
                                  </td>
                                  <td className="p-4 text-right">
                                    <span className="font-bold text-green-600 text-base">${totalCost.toFixed(2)}</span>
                                  </td>
                                  <td className="p-4">
                                    <span className="text-sm text-gray-700">{item.specifications?.supplier || '-'}</span>
                                  </td>
                                  {isEditMode && (
                                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                                      <div className="flex gap-1 justify-center">
                                        <Button size="sm" variant="ghost">
                                          <Pencil className="w-3 h-3" />
                                        </Button>
                                        <Button size="sm" variant="ghost">
                                          <Trash2 className="w-3 h-3 text-red-600" />
                                        </Button>
                                      </div>
                                    </td>
                                  )}
                                </tr>
                                
                                {/* Expanded Details Row */}
                                {isExpanded && (
                                  <tr className="bg-gray-50 border-b">
                                    <td colSpan={isEditMode ? 11 : 10} className="p-6">
                                      <div className="grid grid-cols-3 gap-6">
                                        {/* Column 1: Specifications */}
                                        <div>
                                          <h4 className="font-semibold text-sm mb-3 text-gray-700 flex items-center gap-2">
                                            <FileText className="w-4 h-4" />
                                            Material Specifications
                                          </h4>
                                          <div className="space-y-2 text-sm">
                                            {item.specifications?.gsm && (
                                              <div className="flex justify-between">
                                                <span className="text-gray-600">GSM:</span>
                                                <span className="font-medium">{item.specifications.gsm}</span>
                                              </div>
                                            )}
                                            {item.specifications?.width && (
                                              <div className="flex justify-between">
                                                <span className="text-gray-600">Width:</span>
                                                <span className="font-medium">{item.specifications.width} inches</span>
                                              </div>
                                            )}
                                            {item.specifications?.composition && (
                                              <div className="flex justify-between">
                                                <span className="text-gray-600">Composition:</span>
                                                <span className="font-medium">{item.specifications.composition}</span>
                                              </div>
                                            )}
                                            {item.specifications?.finish && (
                                              <div className="flex justify-between">
                                                <span className="text-gray-600">Finish:</span>
                                                <span className="font-medium">{item.specifications.finish}</span>
                                              </div>
                                            )}
                                            {item.specifications?.color && (
                                              <div className="flex justify-between">
                                                <span className="text-gray-600">Color:</span>
                                                <span className="font-medium">{item.specifications.color}</span>
                                              </div>
                                            )}
                                            {item.specifications?.threadType && (
                                              <div className="flex justify-between">
                                                <span className="text-gray-600">Thread Type:</span>
                                                <span className="font-medium">{item.specifications.threadType}</span>
                                              </div>
                                            )}
                                            {item.specifications?.threadWeight && (
                                              <div className="flex justify-between">
                                                <span className="text-gray-600">Thread Weight:</span>
                                                <span className="font-medium">{item.specifications.threadWeight}</span>
                                              </div>
                                            )}
                                          </div>
                                        </div>

                                        {/* Column 2: Supplier & Procurement */}
                                        <div>
                                          <h4 className="font-semibold text-sm mb-3 text-gray-700 flex items-center gap-2">
                                            <Building className="w-4 h-4" />
                                            Supplier & Procurement
                                          </h4>
                                          <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                              <span className="text-gray-600">Supplier:</span>
                                              <span className="font-medium">{item.specifications?.supplier || '-'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-gray-600">Supplier SKU:</span>
                                              <span className="font-medium font-mono text-xs">{item.specifications?.supplierSKU || '-'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-gray-600">MOQ:</span>
                                              <span className="font-medium">{item.specifications?.moq || '-'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-gray-600">Lead Time:</span>
                                              <span className="font-medium">{item.specifications?.leadTimeDays ? `${item.specifications.leadTimeDays} days` : '-'}</span>
                                            </div>
                                            {item.specifications?.certifications && item.specifications.certifications.length > 0 && (
                                              <div>
                                                <span className="text-gray-600 block mb-1">Certifications:</span>
                                                <div className="flex flex-wrap gap-1">
                                                  {item.specifications.certifications.map((cert, i) => (
                                                    <Badge key={i} variant="outline" className="text-xs">{cert}</Badge>
                                                  ))}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        </div>

                                        {/* Column 3: Processing & Quality */}
                                        <div>
                                          <h4 className="font-semibold text-sm mb-3 text-gray-700 flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4" />
                                            Processing & Quality
                                          </h4>
                                          <div className="space-y-3 text-sm">
                                            {item.processingNotes && (
                                              <div>
                                                <span className="text-gray-600 font-medium block mb-1">Processing Notes:</span>
                                                <p className="text-xs bg-blue-50 p-2 rounded border border-blue-200">{item.processingNotes}</p>
                                              </div>
                                            )}
                                            {item.qualityRequirements && (
                                              <div>
                                                <span className="text-gray-600 font-medium block mb-1">Quality Requirements:</span>
                                                <p className="text-xs bg-green-50 p-2 rounded border border-green-200">{item.qualityRequirements}</p>
                                              </div>
                                            )}
                                            {!item.processingNotes && !item.qualityRequirements && (
                                              <p className="text-xs text-gray-400 italic">No special processing or quality requirements</p>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </>
                            );
                          })}
                        </tbody>
                        <tfoot className="bg-gray-100 border-t-2 border-gray-300">
                          <tr className="font-bold">
                            <td colSpan={8} className="p-4 text-right text-base">
                              Total Material Cost:
                            </td>
                            <td className="p-4 text-right text-xl text-green-600">
                              ${bom.totalMaterialCost.toFixed(2)}
                            </td>
                            <td colSpan={isEditMode ? 2 : 1}></td>
                          </tr>
                          <tr className="font-bold">
                            <td colSpan={8} className="p-4 text-right">
                              + Labor Cost:
                            </td>
                            <td className="p-4 text-right text-lg">
                              ${bom.laborCost.toFixed(2)}
                            </td>
                            <td colSpan={isEditMode ? 2 : 1}></td>
                          </tr>
                          <tr className="font-bold">
                            <td colSpan={8} className="p-4 text-right">
                              + Overhead Cost:
                            </td>
                            <td className="p-4 text-right text-lg">
                              ${bom.overheadCost.toFixed(2)}
                            </td>
                            <td colSpan={isEditMode ? 2 : 1}></td>
                          </tr>
                          <tr className="font-bold bg-green-50 border-t-2 border-green-300">
                            <td colSpan={8} className="p-4 text-right text-lg">
                              TOTAL MANUFACTURING COST:
                            </td>
                            <td className="p-4 text-right text-2xl text-green-700">
                              ${bom.totalCost.toFixed(2)}
                            </td>
                            <td colSpan={isEditMode ? 2 : 1}></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Notes Section */}
                {(bom.notes || isEditMode) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">BOM Notes & Special Instructions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isEditMode ? (
                        <Textarea
                          value={bom.notes || ''}
                          placeholder="Add any special notes, instructions, or requirements for this BOM..."
                          rows={4}
                        />
                      ) : (
                        <p className="text-sm text-gray-700">{bom.notes || 'No notes'}</p>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Material Specifications Tab */}
              <TabsContent value="specifications" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Detailed Material Specifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-6">
                      Complete technical specifications for all materials used in this BOM. 
                      These specifications are used for procurement, quality control, and manufacturing instructions.
                    </p>
                    
                    <div className="space-y-6">
                      {extendedItems.map((item, index) => (
                        <div key={item.id} className="border rounded-lg p-6 bg-white hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="font-bold text-lg text-gray-900">{index + 1}. {item.materialName}</h3>
                              <p className="text-sm text-gray-600">SKU: {item.materialId}</p>
                            </div>
                            {isEditMode && (
                              <Button size="sm" variant="outline">
                                <Pencil className="w-4 h-4 mr-2" />
                                Edit Specs
                              </Button>
                            )}
                          </div>

                          <div className="grid grid-cols-4 gap-6">
                            {/* Technical Specs */}
                            {item.specifications && Object.keys(item.specifications).length > 0 && (
                              <div className="col-span-2">
                                <h4 className="font-semibold text-sm mb-3 text-gray-700 border-b pb-2">Technical Specifications</h4>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  {Object.entries(item.specifications).map(([key, value]) => {
                                    if (key === 'supplier' || key === 'supplierSKU' || key === 'moq' || key === 'leadTimeDays' || key === 'certifications') return null;
                                    if (!value) return null;
                                    
                                    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                                    return (
                                      <div key={key}>
                                        <span className="text-gray-600">{label}:</span>
                                        <p className="font-medium">{Array.isArray(value) ? value.join(', ') : String(value)}</p>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Procurement Info */}
                            <div>
                              <h4 className="font-semibold text-sm mb-3 text-gray-700 border-b pb-2">Procurement</h4>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <span className="text-gray-600">Supplier:</span>
                                  <p className="font-medium">{item.specifications?.supplier || 'Not specified'}</p>
                                </div>
                                <div>
                                  <span className="text-gray-600">Supplier SKU:</span>
                                  <p className="font-medium font-mono text-xs">{item.specifications?.supplierSKU || 'N/A'}</p>
                                </div>
                                <div>
                                  <span className="text-gray-600">MOQ:</span>
                                  <p className="font-medium">{item.specifications?.moq || 'Not specified'}</p>
                                </div>
                                <div>
                                  <span className="text-gray-600">Lead Time:</span>
                                  <p className="font-medium">{item.specifications?.leadTimeDays ? `${item.specifications.leadTimeDays} days` : 'Not specified'}</p>
                                </div>
                              </div>
                            </div>

                            {/* Quality & Certifications */}
                            <div>
                              <h4 className="font-semibold text-sm mb-3 text-gray-700 border-b pb-2">Quality & Compliance</h4>
                              <div className="space-y-2 text-sm">
                                {item.specifications?.certifications && item.specifications.certifications.length > 0 ? (
                                  <div>
                                    <span className="text-gray-600 block mb-2">Certifications:</span>
                                    <div className="flex flex-wrap gap-1">
                                      {item.specifications.certifications.map((cert, i) => (
                                        <Badge key={i} variant="outline" className="text-xs">{cert}</Badge>
                                      ))}
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-gray-400 italic">No certifications specified</p>
                                )}
                                
                                {item.qualityRequirements && (
                                  <div className="mt-3">
                                    <span className="text-gray-600 block mb-1">Quality Requirements:</span>
                                    <p className="text-xs bg-green-50 p-2 rounded border border-green-200">{item.qualityRequirements}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Processing Notes */}
                          {item.processingNotes && (
                            <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                              <h4 className="font-semibold text-xs text-blue-900 mb-1">Processing Instructions</h4>
                              <p className="text-sm text-blue-800">{item.processingNotes}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Revision History Tab */}
              <TabsContent value="revisions">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Revision History</CardTitle>
                    <Button size="sm" onClick={handleNewRevision}>
                      <Plus className="w-4 h-4 mr-2" />
                      New Revision
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {revisions.map((revision, index) => (
                        <div key={index} className="border rounded-lg p-5 hover:bg-gray-50 hover:shadow-md transition-all">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Badge className={getStatusBadge(revision.status)}>
                                {revision.status === 'approved' && <Check className="w-3 h-3 mr-1" />}
                                {revision.status === 'draft' && <Clock className="w-3 h-3 mr-1" />}
                                {revision.status === 'obsolete' && <X className="w-3 h-3 mr-1" />}
                                {revision.status.toUpperCase()}
                              </Badge>
                              <div>
                                <h3 className="font-bold text-lg">Revision {revision.revisionNumber} - Version {revision.version}</h3>
                                <p className="text-sm text-gray-600">
                                  Created by {revision.author} on {new Date(revision.date).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </Button>
                              <Button size="sm" variant="outline">
                                <Download className="w-4 h-4 mr-2" />
                                Export
                              </Button>
                            </div>
                          </div>
                          <div className="bg-gray-50 p-4 rounded mb-3">
                            <h4 className="font-semibold text-sm mb-2">Change Description:</h4>
                            <p className="text-sm">{revision.description}</p>
                          </div>
                          {revision.approvedBy && (
                            <div className="text-xs text-gray-500 flex items-center gap-4 border-t pt-3">
                              <span className="flex items-center gap-1">
                                <Check className="w-3 h-3 text-green-600" />
                                Approved by: <strong>{revision.approvedBy}</strong>
                              </span>
                              <span>•</span>
                              <span>Approved on: <strong>{revision.approvedDate && new Date(revision.approvedDate).toLocaleDateString()}</strong></span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Attachments Tab */}
              <TabsContent value="attachments">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Attachments & Documents</CardTitle>
                    <Button size="sm" onClick={handleUploadAttachment}>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Attachment
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {attachments.map((attachment) => (
                        <div key={attachment.id} className="border rounded-lg p-4 hover:bg-gray-50 hover:shadow-md transition-all">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="p-3 bg-blue-100 rounded-lg">
                                {getAttachmentIcon(attachment.type)}
                              </div>
                              <div>
                                <h4 className="font-semibold">{attachment.name}</h4>
                                <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                                  <span>{attachment.size}</span>
                                  <span>•</span>
                                  <span>{new Date(attachment.uploadedDate).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                            <span>Uploaded by {attachment.uploadedBy}</span>
                            {attachment.revisionNumber && (
                              <Badge variant="outline" className="text-xs">Rev {attachment.revisionNumber}</Badge>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="flex-1">
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1">
                              <Download className="w-3 h-3 mr-1" />
                              Download
                            </Button>
                            {isEditMode && (
                              <Button size="sm" variant="outline">
                                <Trash2 className="w-3 h-3 text-red-600" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Change Orders Tab */}
              <TabsContent value="changes">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Engineering Change Orders (ECO)</CardTitle>
                    <Button size="sm" onClick={handleNewECO}>
                      <Plus className="w-4 h-4 mr-2" />
                      New ECO
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {changeOrders.map((eco) => (
                        <div key={eco.id} className="border rounded-lg p-5 hover:bg-gray-50 hover:shadow-md transition-all">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={getStatusBadge(eco.status)}>
                                  {eco.status.toUpperCase()}
                                </Badge>
                                <Badge className={getPriorityBadge(eco.priority)}>
                                  {eco.priority.toUpperCase()}
                                </Badge>
                              </div>
                              <h3 className="font-bold text-lg mb-1">{eco.ecoNumber}: {eco.title}</h3>
                              <p className="text-sm text-gray-600">
                                Initiated by {eco.initiatedBy} on {new Date(eco.date).toLocaleDateString()}
                              </p>
                            </div>
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                          </div>
                          <div className="bg-gray-50 p-4 rounded">
                            <p className="text-sm">{eco.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Cost Analysis Tab */}
              <TabsContent value="costing">
                <div className="grid grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Cost Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center pb-3 border-b">
                          <span className="text-base">Material Costs</span>
                          <span className="font-bold text-lg">${bom.totalMaterialCost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b">
                          <span className="text-base">Labor Costs</span>
                          <span className="font-bold text-lg">${bom.laborCost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b">
                          <span className="text-base">Overhead Costs</span>
                          <span className="font-bold text-lg">${bom.overheadCost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t-2">
                          <span className="font-bold text-lg">Total Manufacturing Cost</span>
                          <span className="font-bold text-2xl text-green-600">${bom.totalCost.toFixed(2)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Material Cost Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 bg-blue-500 rounded"></div>
                              <span className="text-sm">Fabrics & Materials</span>
                            </div>
                            <span className="font-semibold">$122.85 (79%)</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div className="bg-blue-500 h-3 rounded-full" style={{width: '79%'}}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 bg-green-500 rounded"></div>
                              <span className="text-sm">Fasteners & Hardware</span>
                            </div>
                            <span className="font-semibold">$18.25 (12%)</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div className="bg-green-500 h-3 rounded-full" style={{width: '12%'}}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                              <span className="text-sm">Threads & Consumables</span>
                            </div>
                            <span className="font-semibold">$14.40 (9%)</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div className="bg-yellow-500 h-3 rounded-full" style={{width: '9%'}}></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="col-span-2">
                    <CardHeader>
                      <CardTitle>Material Cost Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="text-left p-3 text-sm font-semibold">Material</th>
                            <th className="text-right p-3 text-sm font-semibold">Quantity</th>
                            <th className="text-right p-3 text-sm font-semibold">Unit Cost</th>
                            <th className="text-right p-3 text-sm font-semibold">Scrap %</th>
                            <th className="text-right p-3 text-sm font-semibold">Extended Cost</th>
                            <th className="text-right p-3 text-sm font-semibold">% of Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {extendedItems.map((item) => {
                            const qtyWithScrap = item.quantity * (1 + item.scrapFactor / 100);
                            const totalCost = qtyWithScrap * item.costPerUnit;
                            const percentage = (totalCost / bom.totalMaterialCost * 100).toFixed(1);
                            
                            return (
                              <tr key={item.id} className="border-b">
                                <td className="p-3 text-sm">{item.materialName}</td>
                                <td className="p-3 text-sm text-right">{item.quantity} {item.unit}</td>
                                <td className="p-3 text-sm text-right">${item.costPerUnit.toFixed(2)}</td>
                                <td className="p-3 text-sm text-right">{item.scrapFactor}%</td>
                                <td className="p-3 text-sm text-right font-semibold">${totalCost.toFixed(2)}</td>
                                <td className="p-3 text-sm text-right">{percentage}%</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Production Info Tab */}
              <TabsContent value="production">
                <div className="grid grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Production Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-xs text-gray-500">Production Lead Time</Label>
                        <p className="font-medium text-lg">14-18 days</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Batch Size (Optimal)</Label>
                        <p className="font-medium text-lg">50 units</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Setup Time</Label>
                        <p className="font-medium text-lg">2.5 hours</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Cycle Time per Unit</Label>
                        <p className="font-medium text-lg">45 minutes</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Quality & Testing</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-xs text-gray-500">Inspection Points</Label>
                        <p className="font-medium">3 stages (Incoming, In-Process, Final)</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Quality Standards</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <Badge variant="outline">ISO 9001</Badge>
                          <Badge variant="outline">REACH</Badge>
                          <Badge variant="outline">OEKO-TEX</Badge>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Defect Rate Target</Label>
                        <p className="font-medium text-lg">&lt; 2%</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="col-span-2">
                    <CardHeader>
                      <CardTitle>Where Used Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">
                        This BOM is used in the following products and assemblies:
                      </p>
                      <div className="space-y-3">
                        <div className="border rounded-lg p-4 hover:bg-gray-50">
                          <h4 className="font-semibold mb-1">Premium Sedan Package - Complete Interior</h4>
                          <p className="text-sm text-gray-600">Parent Assembly: PKG-SEDAN-001</p>
                          <p className="text-sm text-gray-600">Quantity Required: 1 set</p>
                        </div>
                        <div className="border rounded-lg p-4 hover:bg-gray-50">
                          <h4 className="font-semibold mb-1">Luxury Vehicle Upgrade Kit</h4>
                          <p className="text-sm text-gray-600">Parent Assembly: KIT-LUX-005</p>
                          <p className="text-sm text-gray-600">Quantity Required: 1 set (optional component)</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            {/* Print View - Only visible when printing */}
            <div className="hidden print:block print-only">
              <div className="mb-8">
                {/* Print Header */}
                <div className="flex justify-between items-start mb-6 pb-4 border-b-2">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">Bill of Materials</h1>
                    <p className="text-lg font-semibold">{bom.productName}</p>
                  </div>
                  <div className="text-right">
                    <img src="/company-logo.png" alt="Company Logo" className="h-16 mb-2" onError={(e) => e.currentTarget.style.display = 'none'} />
                    <p className="text-sm font-semibold">Car Seat Cover Manufacturing</p>
                  </div>
                </div>

                {/* Print Info Grid */}
                <div className="grid grid-cols-4 gap-4 mb-6 text-sm">
                  <div>
                    <p className="text-gray-600 text-xs">BOM Number</p>
                    <p className="font-semibold">{bom.id}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">Product SKU</p>
                    <p className="font-semibold">{bom.productSKU}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">Revision / Version</p>
                    <p className="font-semibold">{revisions[0]?.revisionNumber || 'A'} / {bom.version}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">Print Date</p>
                    <p className="font-semibold">{new Date().toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">Status</p>
                    <p className="font-semibold">{bom.status.toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">Effective Date</p>
                    <p className="font-semibold">{new Date(bom.effectiveDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">Created By</p>
                    <p className="font-semibold">{bom.createdBy}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">Last Modified</p>
                    <p className="font-semibold">{new Date(bom.lastModified).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Print Materials Table */}
                <table className="w-full border-collapse border border-gray-300 text-xs">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border border-gray-300 p-2 text-left">#</th>
                      <th className="border border-gray-300 p-2 text-left">Material Name</th>
                      <th className="border border-gray-300 p-2 text-left">SKU</th>
                      <th className="border border-gray-300 p-2 text-right">Qty</th>
                      <th className="border border-gray-300 p-2 text-left">Unit</th>
                      <th className="border border-gray-300 p-2 text-right">Scrap%</th>
                      <th className="border border-gray-300 p-2 text-right">Qty w/ Scrap</th>
                      <th className="border border-gray-300 p-2 text-right">Unit Cost</th>
                      <th className="border border-gray-300 p-2 text-right">Total Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {extendedItems.map((item, index) => {
                      const qtyWithScrap = item.quantity * (1 + item.scrapFactor / 100);
                      const totalCost = qtyWithScrap * item.costPerUnit;
                      return (
                        <tr key={item.id}>
                          <td className="border border-gray-300 p-2">{index + 1}</td>
                          <td className="border border-gray-300 p-2">{item.materialName}</td>
                          <td className="border border-gray-300 p-2">{item.materialId}</td>
                          <td className="border border-gray-300 p-2 text-right">{item.quantity}</td>
                          <td className="border border-gray-300 p-2">{item.unit}</td>
                          <td className="border border-gray-300 p-2 text-right">{item.scrapFactor}%</td>
                          <td className="border border-gray-300 p-2 text-right">{qtyWithScrap.toFixed(3)}</td>
                          <td className="border border-gray-300 p-2 text-right">${item.costPerUnit.toFixed(2)}</td>
                          <td className="border border-gray-300 p-2 text-right font-semibold">${totalCost.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-gray-100 font-semibold">
                    <tr>
                      <td colSpan={8} className="border border-gray-300 p-2 text-right">Material Cost:</td>
                      <td className="border border-gray-300 p-2 text-right">${bom.totalMaterialCost.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td colSpan={8} className="border border-gray-300 p-2 text-right">Labor Cost:</td>
                      <td className="border border-gray-300 p-2 text-right">${bom.laborCost.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td colSpan={8} className="border border-gray-300 p-2 text-right">Overhead Cost:</td>
                      <td className="border border-gray-300 p-2 text-right">${bom.overheadCost.toFixed(2)}</td>
                    </tr>
                    <tr className="text-base">
                      <td colSpan={8} className="border border-gray-300 p-2 text-right">TOTAL COST:</td>
                      <td className="border border-gray-300 p-2 text-right">${bom.totalCost.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>

                {/* Print Footer */}
                <div className="mt-6 text-xs text-gray-600">
                  <p>This document is confidential and proprietary. Unauthorized distribution is prohibited.</p>
                  <p className="mt-2">Printed: {new Date().toLocaleString()} | Document: BOM-{bom.id}-Rev{revisions[0]?.revisionNumber || 'A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
