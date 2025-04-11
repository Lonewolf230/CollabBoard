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
  Moon,
  Users
} from 'lucide-react';
import './Sidebar.css';

interface SidebarProps {
  onLogout?: () => void;
}

export default function Sidebar({ onLogout = () => console.log('Logout clicked') }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="sidebar-header">
        {isExpanded && <h3>Options</h3>}
        <button className="toggle-btn" onClick={toggleSidebar}>
          {isExpanded ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
        </button>
      </div>
      
      <div className="sidebar-content">
        <div className="sidebar-item">
          <FileText size={20} />
          {isExpanded && <span>New Document</span>}
        </div>
        <div className="sidebar-item">
          <Save size={20} />
          {isExpanded && <span>Save</span>}
        </div>
        <div className="sidebar-item">
          <Image size={20} />
          {isExpanded && <span>Export Image</span>}
        </div>
        <div className="sidebar-item">
          <Share2 size={20} />
          {isExpanded && <span>Share</span>}
        </div>
        <div className="sidebar-item">
          <Users size={20} />
          {isExpanded && <span>Collaborate</span>}
        </div>
        <div className="sidebar-item">
          <Moon size={20} />
          {isExpanded && <span>Dark Mode</span>}
        </div>
        <div className="sidebar-item">
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
  );
}