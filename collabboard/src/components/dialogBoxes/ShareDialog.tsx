import React, { useState, useEffect } from 'react';
import { Copy, Check} from 'lucide-react';
import { useFabric } from '../../context/FabricContext';
import './ShareDialog.css'

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  whiteboardId?: string;
}

const ShareDialog: React.FC<ShareDialogProps> = ({ isOpen, onClose, whiteboardId = 'demo-board' }) => {
  const canvas=useFabric()
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [shareOption, setShareOption] = useState<'view' | 'edit'>('view');
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const baseUrl = window.location.origin;
      const url = `${baseUrl}/shared/${whiteboardId}?mode=${shareOption}`;
      setShareUrl(url);
    }
  }, [isOpen, whiteboardId, shareOption]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const generateThumbnail = () => {
    if (!canvas) return '';
    
    return canvas.toDataURL({
      format: 'jpeg',
      quality: 0.3,
      multiplier: 0.5
    });
  };

  const regenerateLink = () => {
    setIsGeneratingLink(true);
    
    // Simulate API call to generate a new link
    setTimeout(() => {
      const randomId = Math.random().toString(36).substring(2, 10);
      const baseUrl = window.location.origin;
      const url = `${baseUrl}/shared/${whiteboardId}-${randomId}?mode=${shareOption}`;
      setShareUrl(url);
      setIsGeneratingLink(false);
    }, 1000);
  };

  // Don't render if dialog is not open
  if (!isOpen) return null;

  return (
    <div className="share-dialog-overlay">
      <div className="share-dialog">
        <div className="share-dialog-header">
          <h2>Share Whiteboard</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="share-dialog-content">
          <div className="thumbnail-container">
            <img 
              src={generateThumbnail()} 
              alt="Whiteboard preview" 
              className="whiteboard-thumbnail"
            />
          </div>
          
          <div className="share-options">
            <h3>Who can access this whiteboard?</h3>
            
            <div className="permission-options">
              <label className="permission-option">
                <input 
                  type="radio" 
                  name="permission" 
                  checked={shareOption === 'view'} 
                  onChange={() => setShareOption('view')}
                />
                <div className="permission-details">
                  <span className="permission-title">View only</span>
                  <span className="permission-description">Others can view but not edit</span>
                </div>
              </label>
              
              <label className="permission-option">
                <input 
                  type="radio" 
                  name="permission" 
                  checked={shareOption === 'edit'} 
                  onChange={() => setShareOption('edit')}
                />
                <div className="permission-details">
                  <span className="permission-title">Edit access</span>
                  <span className="permission-description">Others can view and edit</span>
                </div>
              </label>
            </div>
          </div>
          
          <div className="share-link-container">
            <div className="share-link-input">
              <input 
                type="text" 
                value={shareUrl} 
                readOnly 
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button 
                className="copy-button" 
                onClick={handleCopyLink}
                aria-label="Copy link"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
            
            <button 
              className="regenerate-link-button" 
              onClick={regenerateLink}
              disabled={isGeneratingLink}
            >
              {isGeneratingLink ? 'Generating...' : 'Generate New Link'}
            </button>
          </div>
          
         
        </div>
        
        <div className="share-dialog-footer">
          <button className="close-button-footer" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default ShareDialog;