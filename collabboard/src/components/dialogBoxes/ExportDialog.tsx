import React, { useState } from 'react';
import { Download, X } from 'lucide-react';
import * as fabric from 'fabric'
import {jsPDF} from 'jspdf'
import './ExportDialog.css'
interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  canvas: fabric.Canvas | null;
}

const ExportDialog: React.FC<ExportDialogProps> = ({ isOpen, onClose, canvas }) => {
  const [format, setFormat] = useState<'jpeg' | 'pdf'>('jpeg');
  const [fileName, setFileName] = useState('my-canvas');
  const [quality, setQuality] = useState(0.8);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    if (!canvas) return;
    
    setIsExporting(true);
    
    try {
      if (format === 'jpeg') {
        const dataURL = canvas.toDataURL({
          format: 'jpeg',
          quality: quality,
          multiplier: 1
        });
        
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = `${fileName}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const dataURL = canvas.toDataURL({
          format: 'png',
          multiplier:1
        });
        
        const pdf=new jsPDF({
            orientation:"landscape",
            unit:'px',
            format:[canvas.getWidth(),canvas.getHeight()]
        })
        pdf.addImage(dataURL,'PNG',0,0,canvas.getWidth(),canvas.getHeight())
        pdf.save(`${fileName}.pdf`)
        
      }
    } catch (error) {
      // console.error('Export failed:', error);
      alert('Export failed: ' + error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="export-dialog-overlay">
      <div className="export-dialog">
        <div className="export-dialog-header">
          <h2>Export Canvas</h2>
          <button className="close-button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        
        <div className="export-dialog-content">
          <div className="form-group">
            <label htmlFor="fileName">File name:</label>
            <input
              id="fileName"
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="file-name-input"
            />
          </div>
          
          <div className="form-group">
            <label>Export format:</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="format"
                  checked={format === 'jpeg'}
                  onChange={() => setFormat('jpeg')}
                />
                JPEG Image
              </label>
              
              <label className="radio-label">
                <input
                  type="radio"
                  name="format"
                  checked={format === 'pdf'}
                  onChange={() => setFormat('pdf')}
                />
                PDF Document
              </label>
            </div>
          </div>
          
          {format === 'jpeg' && (
            <div className="form-group">
              <label htmlFor="quality">Quality: {Math.round(quality * 100)}%</label>
              <input
                id="quality"
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                className="quality-slider"
              />
            </div>
          )}
          
          <div className="preview-container">
            <h3>Preview</h3>
            <div className="canvas-preview">
              {canvas ? (
                <img 
                  src={canvas.toDataURL(
                                { format: 'jpeg', quality: 0.3,multiplier:1 })} 
                  alt="Canvas preview" 
                />
              ) : (
                <div className="no-canvas">No canvas available</div>
              )}
            </div>
          </div>
        </div>
        
        <div className="export-dialog-footer">
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="export-button" 
            onClick={handleExport} 
            disabled={isExporting || !canvas}
          >
            <Download size={16} />
            {isExporting ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportDialog;