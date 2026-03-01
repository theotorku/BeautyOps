'use client';

import { useRef } from 'react';

interface ExportPDFProps {
  targetRef: React.RefObject<HTMLDivElement | null>;
  filename?: string;
  label?: string;
}

export default function ExportPDF({ targetRef, filename = 'report', label = 'Export PDF' }: ExportPDFProps) {
  const handleExport = () => {
    if (!targetRef.current) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const content = targetRef.current.innerHTML;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${filename}</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
              color: #1a1018;
              padding: 2rem;
              line-height: 1.6;
              background: #fff;
            }
            h1, h2, h3, h4 { margin-bottom: 0.5rem; color: #1a1018; }
            h2 { font-size: 1.5rem; border-bottom: 2px solid #e5b9c4; padding-bottom: 0.5rem; margin-bottom: 1rem; }
            h3 { font-size: 1.15rem; color: #8a3a5c; }
            p { margin-bottom: 0.5rem; }
            ul { padding-left: 1.5rem; margin-bottom: 1rem; }
            li { margin-bottom: 0.35rem; }
            pre { white-space: pre-wrap; font-size: 0.9rem; background: #f5f0f2; padding: 1rem; border-radius: 8px; margin-top: 0.5rem; }
            .card, .report-section, .report-grid, .email-draft { margin-bottom: 1.5rem; }
            .report-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
            .report-alert, .report-success { padding: 1rem; border-radius: 8px; background: #f9f4f6; }
            .email-draft { padding: 1rem; border: 1px solid #e5b9c4; border-radius: 8px; background: #fdf8fa; }
            .card-badge, .vision-ref { font-size: 0.7rem; background: #f5e6ec; padding: 0.2rem 0.6rem; border-radius: 4px; color: #8a3a5c; }
            button, .btn-ghost, .btn-icon, .export-pdf-btn { display: none !important; }
            @media print {
              body { padding: 0; }
              @page { margin: 1.5cm; }
            }
          </style>
        </head>
        <body>
          <div style="text-align: center; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 3px solid #e5b9c4;">
            <h1 style="font-size: 1.4rem; color: #8a3a5c;">BeautyOps AI</h1>
            <p style="font-size: 0.8rem; opacity: 0.6;">${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          ${content}
        </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  };

  return (
    <button onClick={handleExport} className="btn-ghost export-pdf-btn" title="Export as PDF">
      📄 {label}
    </button>
  );
}
