import React, { useState } from 'react';
import './SaveBoard.css';
import { useNavigate } from 'react-router-dom';

interface SaveBoardProps {
  onCreate: (boardName: string) => void;
  initialName?: string;
  isLoading?: boolean;
  handleDialog: (value: boolean) => void;
}

const SaveBoard: React.FC<SaveBoardProps> = ({ 
  onCreate, 
  initialName = '', 
  isLoading = false,
  handleDialog ,
  
}) => {
  const [boardName, setBoardName] = useState(initialName);
  const [isValid, setIsValid] = useState(true);
  const navigate = useNavigate();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate board name
    if (!boardName.trim()) {
      setIsValid(false);
      return;
    }
    
    onCreate(boardName);
    handleDialog(false); // Close the dialog after saving
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBoardName(value);
    setIsValid(value.trim() !== '');
  };

  const handleCancel=(e:React.MouseEvent)=>{
    e.preventDefault()
    handleDialog(false)
    navigate('/dashboard')
  }

  return (
    <div className="save-board-container">
      <form onSubmit={handleSubmit} className="save-board-form">
        <h3 className="save-board-title">Save Board</h3>
        
        <div className="save-board-input-group">
          <label htmlFor="boardName" className="save-board-label">
            Board Name
          </label>
          <input
            id="boardName"
            type="text"
            value={boardName}
            onChange={handleChange}
            placeholder="Enter board name"
            className={`save-board-input ${!isValid ? 'save-board-input-error' : ''}`}
            disabled={isLoading}
            autoFocus
          />
          {!isValid && (
            <p className="save-board-error-text">Board name is required</p>
          )}
        </div>
        
        <div className="save-board-buttons">
          <button 
            type="submit" 
            className="save-board-button" 
            disabled={isLoading || !boardName.trim()}
          >
            {isLoading ? (
              <span className="save-board-spinner"></span>
            ) : (
              'Save'
            )}
          </button>
          <button 
             className='cancel-board-button'
             onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default SaveBoard;