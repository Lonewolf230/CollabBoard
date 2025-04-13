import { useState } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Settings, 
  Save, 
  FileText, 
  Share2, 
  Image, 
  LogOut,
  Users
} from 'lucide-react';
import './Sidebar.css';
import ExportDialog from './dialogBoxes/ExportDialog';
import { useFabric } from '../context/FabricContext';
import ShareDialog from './dialogBoxes/ShareDialog';
import CollaborateDialog from './dialogBoxes/CollaborateDialog';

interface SidebarProps {
  onLogout?: () => void;
  whiteboardId?: string;
  currentUserEmail?: string;
}

export default function Sidebar({ 
      onLogout = () => console.log('Logout clicked'),
      whiteboardId='default',
      currentUserEmail='manish2306j@gmail.com' }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  const canvas=useFabric()
  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const handleOptionClick=(dialogName:string)=>{
    setActiveDialog(dialogName)
  }

  const closeDialog=()=>{
    setActiveDialog(null)
  }
  return (
    <>
  <div className={`sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="sidebar-header">
        {isExpanded && <h3>Options</h3>}
        <button className="toggle-btn" onClick={toggleSidebar}>
          {isExpanded ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
        </button>
      </div>
      
      <div className="sidebar-content">
        <div className="sidebar-item" onClick={()=>handleOptionClick('newDocument')}>
          <FileText size={20} />
          {isExpanded && <span>New Document</span>}
        </div>
        <div className="sidebar-item" onClick={()=>handleOptionClick('save')}>
          <Save size={20} />
          {isExpanded && <span>Save</span>}
        </div>
        <div className="sidebar-item" onClick={()=>handleOptionClick('exportImage')}>
          <Image size={20} />
          {isExpanded && <span>Export Canvas</span>}
        </div>
        <div className="sidebar-item" onClick={()=>handleOptionClick('share')}>
          <Share2 size={20} />
          {isExpanded && <span>Share</span>}
        </div>
        <div className="sidebar-item" onClick={()=>handleOptionClick('collaborate')}>
          <Users size={20} />
          {isExpanded && <span>Collaborate</span>}
        </div>

        <div className="sidebar-item" onClick={()=>handleOptionClick('settings')}>
          <Settings size={20} />
          {isExpanded && <span>Settings</span>}
        </div>
      </div>
      
      <div className="sidebar-footer">
        <div className="sidebar-item logout" onClick={onLogout}>
          <LogOut size={20} />
          {isExpanded && <span>Logout</span>}
        </div>
      </div>
    </div>
    {activeDialog === 'newDocument' && <div className="dialog">New Document Dialog</div>}
    {activeDialog === 'save' && <div className="dialog">Save Dialog</div>}
    {activeDialog === 'exportImage' && (
      <ExportDialog isOpen={activeDialog === 'exportImage'}
            onClose={closeDialog}
            canvas={canvas}
      />
    )}
    {activeDialog === 'share' && (
      <ShareDialog isOpen={activeDialog==='share'}
        onClose={closeDialog}
        whiteboardId={whiteboardId}/>
    )}
    {activeDialog === 'collaborate' && (
      <CollaborateDialog isOpen={activeDialog==='collaborate'}
        onClose={closeDialog}
        whiteboardId={whiteboardId}
        currentUserEmail={currentUserEmail}/>
    )}
    {activeDialog === 'settings' && <div className="dialog">Settings Dialog</div>}
    {/* {activeDialog && <div className="overlay" onClick={() => setActiveDialog(null)}></div>} */}

    </>
  );
}