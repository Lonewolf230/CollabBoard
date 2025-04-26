import { useState } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Save, 
  FileText, 
  Image, 
  LogOut,
  Edit,
  Users,
  Eye
} from 'lucide-react';
import './Sidebar.css';
import ExportDialog from './dialogBoxes/ExportDialog';
import { useFabric } from '../context/FabricContext';
import CollaborateDialog from './dialogBoxes/CollaborateDialog';
import { useAuth } from '../providers/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

interface SidebarProps {
  whiteboardId?: string;
  currentUserEmail?: string | undefined | null;
  onSaveBoard?:()=>void;
  hasEditAccess:boolean;
  whiteboardName?:string
}

export default function Sidebar({ whiteboardId,currentUserEmail,onSaveBoard,hasEditAccess,whiteboardName }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  const canvas=useFabric()
  const {logOut}=useAuth()
  const navigate=useNavigate()

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const handleOptionClick=(dialogName:string)=>{
    setActiveDialog(dialogName)
  }

  const createNewBoard=() =>{
    const newBoardId=uuidv4()
    navigate(`/board/${newBoardId}`)
  }

  const closeDialog=()=>{
    setActiveDialog(null)
  }

  const onLogout=async()=>{
    // console.log(user)
    await logOut()
    navigate('/')
  }

  return (
    <>
  <div className={`sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="sidebar-header">
        {isExpanded && (
            <div>
              <h6>{currentUserEmail}</h6>
              {!hasEditAccess && <div className="view-only-badge"><Eye size={12} /> View Only</div>}
              {hasEditAccess && <div className="edit-badge"><Edit size={12} /> Edit</div>}
            </div>
          )}
        <button className="toggle-btn" onClick={toggleSidebar}>
          {isExpanded ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
        </button>
      </div>
      
      <div className="sidebar-content">
        <div className="sidebar-item" onClick={()=>createNewBoard()}>
          <FileText size={20} />
          {isExpanded && <span>New Whiteboard</span>}
        </div>
          {hasEditAccess && (
            <div className="sidebar-item" onClick={() => onSaveBoard?.()}>
              <Save size={20} />
              {isExpanded && <span>Save</span>}
            </div>
          )}
        
        <div className="sidebar-item" onClick={()=>handleOptionClick('exportImage')}>
          <Image size={20} />
          {isExpanded && <span>Export Canvas</span>}
        </div>

        {hasEditAccess && (
         <div className="sidebar-item" onClick={()=>handleOptionClick('collaborate')}>
          <Users size={20} />
          {isExpanded && <span>Collaborate</span>}
          </div>         
        )}

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

    {activeDialog === 'collaborate' && (
      <CollaborateDialog isOpen={activeDialog==='collaborate'}
        onClose={closeDialog}
        whiteboardId={whiteboardId}
        whiteboardName={whiteboardName}
      />
    )}
    </>
  );
}