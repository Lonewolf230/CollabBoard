import { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Trash2, 
  LogOut,
  User,
  Link
} from 'lucide-react';
import './Dashboard.css';
import { useAuth } from '../providers/AuthProvider';
import JoinBoard from '../components/dialogBoxes/JoinBoard';
import { v4 as uuidv4 } from 'uuid';
import { firestore  } from '../utils/firebase';
import { collection, getDocs, query, Timestamp, where,doc, deleteDoc } from 'firebase/firestore';
import Loader from '../components/Loader';

interface Whiteboard {
  boardId: string;
  canvasState: string;
  createdAt: string;
  ownerName: string;
  boardName: string;
  lastUpdatedAt: string;
  additionalUsers: string[];
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logOut } = useAuth();
  const currentUser = user?.email || "User";
  const [showJoinBoard, setShowJoinBoard] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [whiteboards, setWhiteboards] = useState<Whiteboard[]>([]);

  useEffect(() => {
    setIsLoading(true);
    const fetchWhiteboards=async()=>{
      if(!user){
        console.error('User not found');
        return
      }
      const email=user.email
      setError(null);
      try {
        const ownerSearch=query(
          collection(firestore,'boards'),
          where('ownerName','==',email)
        )

        const ownerSnapshots=await getDocs(ownerSearch)

        const allBoardsQuery=query(collection(firestore,'boards'))
        const allBoardsSnapshots=await getDocs(allBoardsQuery)

        const boards:Whiteboard[]=[]

        ownerSnapshots.forEach((doc)=>{
          const data=doc.data()
          boards.push({
            boardId:doc.id,
            canvasState:data.canvasState,
            createdAt:data.createdAt,
            ownerName:data.ownerName,
            boardName:data.boardName,
            lastUpdatedAt:data.lastUpdatedAt,
            additionalUsers:data.additionalUsers
          })
        })

        allBoardsSnapshots.forEach((doc)=>{
          if(boards.some(board=>board.boardId===doc.id)){
            return
          }
          const data=doc.data()
          const additionalUsers=data.additionalUsers || []
          const userHasAccess=additionalUsers.some(
            (user:{username:string,access:string})=>user.username===email
          )
          if(userHasAccess){
            boards.push({
              boardId:doc.id,
              canvasState:data.canvasState,
              createdAt:data.createdAt,
              ownerName:data.ownerName,
              lastUpdatedAt:data.lastUpdatedAt,
              boardName:data.boardName,
              additionalUsers:data.additionalUsers
            })
          }
        })

        boards.sort((a,b)=>{
          const dateA=a.createdAt? new Date(a.createdAt):new Date(0)
          const dateB=b.createdAt? new Date(b.createdAt):new Date(0)
          return dateB.getTime()-dateA.getTime()
        })

        setWhiteboards(boards)
      } catch (error) {
        console.error('Error fetching whiteboards:',error);
        setError('Failed to fetch whiteboards')
      }
      finally{
        setIsLoading(false)
      }
    }
    fetchWhiteboards()
  },[user])
  


  const handleCreateWhiteboard = () => {
    const newBoardId = uuidv4();
    navigate(`/board/${newBoardId}`);
  };

  const handleOpenWhiteboard = (id: string) => {
    navigate(`/board/${id}`);
  };

  const handleDeleteWhiteboard = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); 

    const confirmDelete = window.confirm("Are you sure you want to delete this whiteboard?");
    if (!confirmDelete) return;

    try{
      setIsLoading(true)
      const boardRef=doc(firestore,'boards',id)
      await deleteDoc(boardRef)
      const updatedWhiteboards=whiteboards.filter(board=>board.boardId!==id)
      setWhiteboards(updatedWhiteboards)
    }
    catch(error){
      console.error('Error deleting whiteboard:',error);
      setError('Failed to delete whiteboard')
    }
    finally{
      setIsLoading(false)
    }

    console.log(`Delete whiteboard ${id}`);
  };

  const handleJoinWhiteboard = () => {
    setShowJoinBoard(true)
  }

  const onLogout = async () => {
    await logOut();
    navigate('/');
  };

  const formatDate = (dateInput: any) => {
    const date = typeof dateInput?.toDate === 'function' ? dateInput.toDate() : new Date(dateInput);
  
    return date.toLocaleString('en-US', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).replace(',', ' at');
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
      
      {isLoading?(
        <Loader/>
      ):(
          <main className="dashboard-content">
          <div className="dashboard-header">
            <h1>My Whiteboards</h1>
          </div>
          
          <div className="whiteboard-grid">
            {whiteboards.map(whiteboard => (
              <div 
                key={whiteboard.boardId} 
                className="whiteboard-card"
                onClick={() => handleOpenWhiteboard(whiteboard.boardId)}
              >
                <div className="whiteboard-preview">
                  {/* In a real app, this could be a thumbnail preview of the whiteboard */}
                </div>
                <div className="whiteboard-details">
                  <h3>{whiteboard.boardName}</h3>
                  <div className="whiteboard-meta">
                    <div className="meta-item">
                      <b>Created At : </b>
                      <span>{formatDate(whiteboard.createdAt)}</span>
                    </div>
                    <div className="meta-item">
                      <b>Last Updated on : </b>
                      <span> {formatDate(whiteboard.lastUpdatedAt)}</span>
                    </div>
                    <div className="meta-item">
                      <User size={14} />
                      <span>{whiteboard.ownerName}</span>
                    </div>
                  </div>
                </div>
                <button 
                  className="delete-button"
                  onClick={(e) => handleDeleteWhiteboard(whiteboard.boardId, e)}
                  aria-label="Delete whiteboard"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </main>
      )}

      {showJoinBoard && <JoinBoard onClose={() => setShowJoinBoard(false)} />}

    </div>

    
  );
}