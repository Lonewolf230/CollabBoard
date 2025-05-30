import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, X } from 'lucide-react';
import './JoinBoard.css'; 

interface JoinBoardProps {
  onClose: () => void;
}

export default function JoinBoard({ onClose }: JoinBoardProps) {
  const [boardLink, setBoardLink] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!boardLink.trim()) {
      setError('Please enter a valid board link');
      return;
    }
    
    try {
      const boardId = new URL(boardLink).searchParams.get('id') || 'shared';
      
      navigate(`/board/${boardId}`);
    } catch (err) {
      setError('Invalid URL format. Please enter a valid board link.');
    }
  };

  return (
    <div className="join-board-overlay">
      <div className="join-board-modal">
        <div className="join-header">
          <h2>Join Whiteboard</h2>
          <button className="close-button" onClick={onClose} aria-label="Close">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleJoin}>
          <div className="input-group">
            <label htmlFor="board-link">Enter board link or ID:</label>
            <input
              id="board-link"
              type="text"
              value={boardLink}
              onChange={(e) => {
                setBoardLink(e.target.value);
                setError('');
              }}
              placeholder="https://whiteboard.com/board?id=abc123"
              autoFocus
            />
            {error && <p className="error-message">{error}</p>}
          </div>
          
          <div className="modal-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="join-button">
              Join <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}