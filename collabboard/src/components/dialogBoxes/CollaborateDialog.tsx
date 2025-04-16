import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Send, X, Edit, Eye, Check } from 'lucide-react';
import './CollaborateDialog.css';

interface User {
  id: string;
  email: string;
  access: 'view' | 'edit';
  invited: boolean;
}

interface CollaborateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  whiteboardId?: string;
  // If you have a current user object, you could pass it here
  currentUserEmail?: string | undefined | null;
}

const CollaborateDialog: React.FC<CollaborateDialogProps> = ({
  isOpen,
  onClose,
  whiteboardId = 'demo-board',
  currentUserEmail = 'you@example.com'
}) => {
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [selectedAccess, setSelectedAccess] = useState<'view' | 'edit'>('view');
  const [users, setUsers] = useState<User[]>([
    // Mock existing collaborators - replace with actual data from your backend
    { id: '1', email: 'alice@example.com', access: 'edit', invited: true },
    { id: '2', email: 'bob@example.com', access: 'view', invited: true }
  ]);
  const [emailError, setEmailError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // You could fetch current collaborators from your API here
      setInviteEmail('');
      setEmailError(null);
    }
  }, [isOpen]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAddUser = () => {
    // Validate email
    if (!inviteEmail) {
      setEmailError('Email is required');
      return;
    }
    
    if (!validateEmail(inviteEmail)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    // Check if user is already in the list
    if (users.some(user => user.email === inviteEmail)) {
      setEmailError('This user is already invited');
      return;
    }

    // Check if it's the current user
    if (inviteEmail === currentUserEmail) {
      setEmailError('You cannot invite yourself');
      return;
    }

    // Add new user to the list
    const newUser: User = {
      id: Date.now().toString(), // temporary ID
      email: inviteEmail,
      access: selectedAccess,
      invited: false
    };

    setUsers([...users, newUser]);
    setInviteEmail('');
    setEmailError(null);
  };

  const handleRemoveUser = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId));
  };

  const handleChangeAccess = (userId: string, access: 'view' | 'edit') => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, access } : user
    ));
  };

  const handleSendInvites = () => {
    const uninvitedUsers = users.filter(user => !user.invited);

    if (uninvitedUsers.length === 0) {
      return;
    }

    setIsInviting(true);

    // Mock API call to send invites
    setTimeout(() => {
      // Mark all users as invited
      setUsers(users.map(user => ({ ...user, invited: true })));
      setIsInviting(false);
      
      // Show success message or close dialog
      alert(`Invitations sent to ${uninvitedUsers.length} user(s)`);
    }, 1000);
  };

  // If dialog is not open, don't render anything
  if (!isOpen) return null;

  return (
    <div className="collaborate-dialog-overlay">
      <div className="collaborate-dialog">
        <div className="collaborate-dialog-header">
          <h2>Collaborate</h2>
          <button className="close-button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        
        <div className="collaborate-dialog-content">
          <div className="whiteboard-info">
            <h3>Whiteboard: {whiteboardId}</h3>
            <p className="owner-info">Created by: {currentUserEmail} (you)</p>
          </div>
          
          <div className="add-collaborator">
            <h3>Invite collaborators</h3>
            <div className="add-collaborator-form">
              <div className="email-input-group">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => {
                    setInviteEmail(e.target.value);
                    setEmailError(null);
                  }}
                  placeholder="Enter email address"
                  className={emailError ? 'error' : ''}
                />
                {emailError && <div className="error-message">{emailError}</div>}
              </div>
              
              <div className="access-selector">
                <select
                  value={selectedAccess}
                  onChange={(e) => setSelectedAccess(e.target.value as 'view' | 'edit')}
                >
                  <option value="view">View access</option>
                  <option value="edit">Edit access</option>
                </select>
              </div>
              
              <button className="add-button" onClick={handleAddUser}>
                <Plus size={16} />
                Add
              </button>
            </div>
          </div>
          
          <div className="collaborators-list">
            <h3>Collaborators</h3>
            
            {users.length === 0 ? (
              <div className="no-collaborators">No collaborators added yet</div>
            ) : (
              <table className="collaborators-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Access</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className={user.invited ? 'invited' : 'pending'}>
                      <td className="email-cell">{user.email}</td>
                      <td className="access-cell">
                        <div className="access-badge">
                          {user.access === 'edit' ? (
                            <>
                              <Edit size={14} />
                              <span>Edit</span>
                            </>
                          ) : (
                            <>
                              <Eye size={14} />
                              <span>View</span>
                            </>
                          )}
                        </div>
                        <select
                          value={user.access}
                          onChange={(e) => handleChangeAccess(user.id, e.target.value as 'view' | 'edit')}
                          className="access-select"
                        >
                          <option value="view">View</option>
                          <option value="edit">Edit</option>
                        </select>
                      </td>
                      <td className="status-cell">
                        {user.invited ? (
                          <span className="status invited">
                            <Check size={14} />
                            Invited
                          </span>
                        ) : (
                          <span className="status pending">Pending</span>
                        )}
                      </td>
                      <td className="actions-cell">
                        <button 
                          className="remove-button" 
                          onClick={() => handleRemoveUser(user.id)}
                          aria-label="Remove user"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        
        <div className="collaborate-dialog-footer">
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="send-invites-button" 
            onClick={handleSendInvites}
            disabled={isInviting || !users.some(user => !user.invited)}
          >
            <Send size={16} />
            {isInviting ? 'Sending...' : 'Send Invites'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CollaborateDialog;