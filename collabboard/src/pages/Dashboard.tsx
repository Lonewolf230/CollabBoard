import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Trash2, 
  LogOut,
  Clock,
  User,
  Link
} from 'lucide-react';
import './Dashboard.css';
import { useAuth } from '../providers/AuthProvider';
import JoinBoard from '../components/dialogBoxes/JoinBoard';
import { v4 as uuidv4 } from 'uuid';

interface Whiteboard {
  id: string;
  name: string;
  createdAt: string;
  owner: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logOut } = useAuth();
  const currentUser = user?.email || "User";
  const [showJoinBoard, setShowJoinBoard] = useState(false);
  
  const [whiteboards] = useState<Whiteboard[]>([
    { id: '1', name: 'Project Brainstorm', createdAt: '2025-04-10T14:30:00', owner: currentUser },
    { id: '2', name: 'Weekly Team Meeting', createdAt: '2025-04-12T09:15:00', owner: currentUser },
    { id: '3', name: 'Product Roadmap', createdAt: '2025-04-13T16:45:00', owner: currentUser },
    { id: '4', name: 'UI/UX Design Ideas', createdAt: '2025-04-14T11:20:00', owner: currentUser },
    { id: '5', name: 'Sprint Planning', createdAt: '2025-04-14T13:00:00', owner: currentUser },
    { id: '6', name: 'Client Presentation', createdAt: '2025-04-15T10:30:00', owner: currentUser },
    { id: '7', name: 'Research Notes', createdAt: '2025-04-15T14:45:00', owner: currentUser },
    { id: '8', name: 'Feature Planning', createdAt: '2025-04-16T09:00:00', owner: currentUser },
    { id: '9', name: 'Competitor Analysis', createdAt: '2025-04-16T11:30:00', owner: currentUser },
    { id: '10', name: 'Marketing Strategy', createdAt: '2025-04-16T15:20:00', owner: currentUser },
  ]);

  const handleCreateWhiteboard = () => {
    const newBoardId = uuidv4();
    navigate(`/board/${newBoardId}`);
  };

  const handleOpenWhiteboard = (id: string) => {
    navigate(`/board/${id}`);
  };

  const handleDeleteWhiteboard = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); 
    console.log(`Delete whiteboard ${id}`);
  };

  const handleJoinWhiteboard = () => {
    setShowJoinBoard(true)
  }

  const onLogout = async () => {
    await logOut();
    navigate('/');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar expanded">
        <div className="sidebar-header">
          <h6>{currentUser}</h6>
        </div>
        
        <div className="sidebar-content">
          <div className="sidebar-item create-new" onClick={handleCreateWhiteboard}>
            <Plus size={20} />
            <span>New Whiteboard</span>
          </div>
          <div className="sidebar-item create-new" onClick={handleJoinWhiteboard}>
            <Link size={20} />
            <span>Join using Link</span>
          </div>
        </div>
        
        <div className="sidebar-footer">
          <div className="sidebar-item logout" onClick={onLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </div>
        </div>
      </div>
      
      <main className="dashboard-content">
        <div className="dashboard-header">
          <h1>My Whiteboards</h1>
        </div>
        
        <div className="whiteboard-grid">
          {whiteboards.map(whiteboard => (
            <div 
              key={whiteboard.id} 
              className="whiteboard-card"
              onClick={() => handleOpenWhiteboard(whiteboard.id)}
            >
              <div className="whiteboard-preview">
                {/* In a real app, this could be a thumbnail preview of the whiteboard */}
              </div>
              <div className="whiteboard-details">
                <h3>{whiteboard.name}</h3>
                <div className="whiteboard-meta">
                  <div className="meta-item">
                    <Clock size={14} />
                    <span>{formatDate(whiteboard.createdAt)}</span>
                  </div>
                  <div className="meta-item">
                    <User size={14} />
                    <span>{whiteboard.owner}</span>
                  </div>
                </div>
              </div>
              <button 
                className="delete-button"
                onClick={(e) => handleDeleteWhiteboard(whiteboard.id, e)}
                aria-label="Delete whiteboard"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </main>
      {showJoinBoard && <JoinBoard onClose={() => setShowJoinBoard(false)} />}

    </div>

    
  );
}