import { ReactNode } from 'react';
import { Resizable } from 're-resizable';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Printer } from 'lucide-react';

interface ResizableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size: { width: number; height: number };
  onResize: (size: { width: number; height: number }) => void;
  onPrint?: () => void;
  printable?: boolean;
}

export function ResizableDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size,
  onResize,
  onPrint,
  printable = true,
}: ResizableDialogProps) {
  // Helper to escape HTML
  const escapeHtml = (text: string): string => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
      return;
    }

    // Default print behavior
    try {
      const printContent = document.getElementById('resizable-dialog-content');
      if (!printContent) {
        console.error('Print content not found');
        return;
      }

      // Clone the content to avoid modifying the original
      const contentClone = printContent.cloneNode(true) as HTMLElement;
      
      // Remove interactive elements that shouldn't print
      contentClone.querySelectorAll('button, [role="button"]').forEach(el => el.remove());
      
      // Convert input values to text for printing
      const inputs = contentClone.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        const element = input as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
        const value = element.value || element.getAttribute('value') || '';
        const label = element.getAttribute('placeholder') || '';
        
        // Create a span to replace the input with its value
        const span = document.createElement('span');
        span.className = 'field-value';
        span.textContent = value || '(not set)';
        
        if (element.parentNode) {
          element.parentNode.replaceChild(span, element);
        }
      });

      const printWindow = window.open('', '_blank', 'width=1200,height=800');
      if (!printWindow) {
        alert('Please allow pop-ups to print');
        return;
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>${escapeHtml(title)}</title>
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              
              @page {
                size: A4 portrait;
                margin: 15mm;
              }
              
              @media print {
                @page {
                  margin: 15mm;
                }
                
                body {
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
                
                .page-break {
                  page-break-before: always;
                }
                
                .no-break {
                  page-break-inside: avoid;
                }
              }
              
              body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                font-size: 10pt;
                line-height: 1.5;
                color: #000;
                background: #fff;
                padding: 20px;
              }
              
              .print-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 3px solid #000;
              }
              
              .print-header h1 {
                font-size: 20pt;
                font-weight: bold;
                margin-bottom: 5px;
                color: #000;
              }
              
              .print-header p {
                font-size: 9pt;
                color: #333;
                margin-top: 5px;
              }
              
              .print-meta {
                text-align: right;
                font-size: 8pt;
                color: #666;
              }
              
              .print-meta div {
                margin-bottom: 3px;
              }
              
              h2, h3, h4 {
                color: #000;
                margin-top: 15px;
                margin-bottom: 8px;
                font-weight: bold;
              }
              
              h2 {
                font-size: 14pt;
                border-bottom: 2px solid #333;
                padding-bottom: 4px;
              }
              
              h3 {
                font-size: 12pt;
                border-bottom: 1px solid #ccc;
                padding-bottom: 3px;
              }
              
              h4 {
                font-size: 11pt;
              }
              
              .grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 15px;
                margin: 12px 0;
              }
              
              .space-y-2, .space-y-4, .space-y-6 {
                margin-bottom: 12px;
              }
              
              label {
                display: block;
                font-weight: bold;
                font-size: 9pt;
                color: #333;
                margin-bottom: 3px;
              }
              
              .field-value {
                display: block;
                font-size: 10pt;
                color: #000;
                padding: 4px 8px;
                background: #f5f5f5;
                border: 1px solid #ddd;
                border-radius: 3px;
                min-height: 24px;
              }
              
              table {
                width: 100%;
                border-collapse: collapse;
                margin: 12px 0;
                page-break-inside: avoid;
              }
              
              th, td {
                border: 1px solid #333;
                padding: 6px 8px;
                text-align: left;
                font-size: 9pt;
              }
              
              th {
                background-color: #e0e0e0;
                font-weight: bold;
                color: #000;
              }
              
              tr:nth-child(even) {
                background-color: #f9f9f9;
              }
              
              .section {
                margin-bottom: 20px;
                page-break-inside: avoid;
              }
              
              .badge {
                display: inline-block;
                padding: 2px 8px;
                border-radius: 3px;
                font-size: 8pt;
                font-weight: bold;
                border: 1px solid #333;
                margin-right: 5px;
              }
              
              ul, ol {
                margin-left: 20px;
                margin-bottom: 10px;
              }
              
              li {
                margin-bottom: 4px;
              }
              
              .print-footer {
                margin-top: 30px;
                padding-top: 15px;
                border-top: 2px solid #333;
                font-size: 8pt;
                text-align: center;
                color: #666;
              }
              
              /* Hide elements that shouldn't print */
              button, 
              [role="button"],
              .no-print,
              svg {
                display: none !important;
              }
            </style>
          </head>
          <body>
            <div class="print-header">
              <div>
                <h1>${escapeHtml(title)}</h1>
                ${description ? `<p>${escapeHtml(description)}</p>` : ''}
              </div>
              <div class="print-meta">
                <div><strong>Printed:</strong> ${new Date().toLocaleString()}</div>
                <div><strong>Company:</strong> Car Seat Cover Manufacturing</div>
                <div><strong>Document Type:</strong> Material Specification</div>
              </div>
            </div>
            
            <div class="print-content">
              ${contentClone.innerHTML}
            </div>
            
            <div class="print-footer">
              <p>This is a computer-generated document from the MRP Manufacturing Dashboard</p>
              <p>Car Seat Cover Manufacturing Company - Internal Use Only</p>
            </div>
            
            <script>
              window.onload = function() {
                // Give the browser time to render before printing
                setTimeout(function() {
                  window.print();
                }, 250);
              };
              
              // Close the window after printing or canceling
              window.onafterprint = function() {
                setTimeout(function() {
                  window.close();
                }, 100);
              };
            </script>
          </body>
        </html>
      `);
      
      printWindow.document.close();
    } catch (error) {
      console.error('Print error:', error);
      alert('Unable to generate print preview. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="p-0 gap-0 overflow-hidden !max-w-none !w-auto !h-auto"
        style={{ 
          width: `${size.width}px`, 
          height: `${size.height}px`,
        }}
      >
        <div className="w-full h-full flex flex-col relative">
          <Resizable
            size={size}
            onResizeStop={(e, direction, ref, d) => {
              onResize({
                width: size.width + d.width,
                height: size.height + d.height,
              });
            }}
            minWidth={800}
            minHeight={600}
            maxWidth={window.innerWidth - 100}
            maxHeight={window.innerHeight - 100}
            enable={{
              top: false,
              right: true,
              bottom: true,
              left: true,
              topRight: false,
              bottomRight: true,
              bottomLeft: true,
              topLeft: false,
            }}
            handleStyles={{
              right: {
                width: '12px',
                right: '0',
                cursor: 'ew-resize',
                background: 'linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.1) 50%, rgba(59, 130, 246, 0.3) 100%)',
                transition: 'background 0.2s',
              },
              bottom: {
                height: '12px',
                bottom: '0',
                cursor: 'ns-resize',
                background: 'linear-gradient(180deg, transparent 0%, rgba(59, 130, 246, 0.1) 50%, rgba(59, 130, 246, 0.3) 100%)',
                transition: 'background 0.2s',
              },
              left: {
                width: '12px',
                left: '0',
                cursor: 'ew-resize',
                background: 'linear-gradient(270deg, transparent 0%, rgba(59, 130, 246, 0.1) 50%, rgba(59, 130, 246, 0.3) 100%)',
                transition: 'background 0.2s',
              },
              bottomRight: {
                width: '24px',
                height: '24px',
                right: '0',
                bottom: '0',
                cursor: 'nwse-resize',
                background: 'radial-gradient(circle at bottom right, rgba(59, 130, 246, 0.4) 0%, rgba(59, 130, 246, 0.2) 50%, transparent 100%)',
                transition: 'background 0.2s',
              },
              bottomLeft: {
                width: '24px',
                height: '24px',
                left: '0',
                bottom: '0',
                cursor: 'nesw-resize',
                background: 'radial-gradient(circle at bottom left, rgba(59, 130, 246, 0.4) 0%, rgba(59, 130, 246, 0.2) 50%, transparent 100%)',
                transition: 'background 0.2s',
              },
            }}
            handleClasses={{
              right: 'hover:bg-blue-500/20 active:bg-blue-500/30',
              bottom: 'hover:bg-blue-500/20 active:bg-blue-500/30',
              left: 'hover:bg-blue-500/20 active:bg-blue-500/30',
              bottomRight: 'hover:bg-blue-500/30 active:bg-blue-500/40',
              bottomLeft: 'hover:bg-blue-500/30 active:bg-blue-500/40',
            }}
            className="flex flex-col w-full h-full"
            style={{ position: 'relative' }}
          >
            {/* Visual resize indicators */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-16 bg-blue-400/40 rounded-l pointer-events-none z-10" />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-16 bg-blue-400/40 rounded-r pointer-events-none z-10" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-16 bg-blue-400/40 rounded-t pointer-events-none z-10" />
            <div className="absolute bottom-0 right-0 w-6 h-6 pointer-events-none z-10">
              <svg className="w-full h-full text-blue-400/60" viewBox="0 0 24 24" fill="none">
                <path d="M14 20L20 20L20 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M10 20L20 20L20 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
              </svg>
            </div>
            <div className="absolute bottom-0 left-0 w-6 h-6 pointer-events-none z-10 scale-x-[-1]">
              <svg className="w-full h-full text-blue-400/60" viewBox="0 0 24 24" fill="none">
                <path d="M14 20L20 20L20 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M10 20L20 20L20 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
              </svg>
            </div>
            
            <div className="flex-shrink-0 border-b px-6 py-4 bg-white">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <DialogTitle className="text-xl">{title}</DialogTitle>
                  {description && (
                    <DialogDescription className="mt-2">{description}</DialogDescription>
                  )}
                </div>
                {printable && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handlePrint}
                    className="ml-4"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Print
                  </Button>
                )}
              </div>
            </div>
            
            <div 
              id="resizable-dialog-content"
              className="flex-1 overflow-y-auto px-6 py-4"
              style={{ maxHeight: `${size.height - 180}px` }}
            >
              {children}
            </div>
            
            {footer && (
              <div className="flex-shrink-0 border-t px-6 py-4 bg-gray-50">
                {footer}
              </div>
            )}
          </Resizable>
        </div>
      </DialogContent>
    </Dialog>
  );
}