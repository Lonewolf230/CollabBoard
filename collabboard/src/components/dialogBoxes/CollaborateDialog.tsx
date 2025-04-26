import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Send, X, Edit, Eye, Check } from 'lucide-react';
import './CollaborateDialog.css';
import { useAuth } from '../../providers/AuthProvider';
import { arrayUnion, doc,getDoc,updateDoc,arrayRemove } from 'firebase/firestore';
import { firestore } from '../../utils/firebase';
import axios from 'axios';
import { useToast } from '../../utils/ToastManager';

interface User {
  email: string;
  access: 'view' | 'edit';
  invited: boolean;
  status?: 'pending' | 'sent' ;
}

interface CollaborateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  whiteboardId?: string;
  whiteboardName?:string
}

const CollaborateDialog: React.FC<CollaborateDialogProps> = ({
  isOpen,
  onClose,
  whiteboardId ,
  whiteboardName
}) => {
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [selectedAccess, setSelectedAccess] = useState<'view' | 'edit'>('view');
  const [users, setUsers] = useState<User[]>([

  ]);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSendingStatus, setEmailSendingStatus] = useState<{
    success: string[];
    failed: string[];
  }>({success:[],failed:[]});

  const {user}=useAuth()
  const toast=useToast()
  const currentUserEmail=user?.email || ''
  const EMAILJS_SERVICE_ID=import.meta.env.VITE_EMAILJS_SERVICE_ID as string
  const EMAILJS_TEMPLATE_ID=import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string
  const EMAILJS_PUBLIC_KEY=import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string


  useEffect(() => {
    if (isOpen) {
      const fetchUsers=async()=>{
        if(!whiteboardId) return
        try {
          const boardRef = doc(firestore, 'boards', whiteboardId);
          const boardSnap = await getDoc(boardRef)
    
          if (boardSnap.exists()) {
            const data = boardSnap.data();
            console.log('Board data loaded:', data);
            const additionalUsers= data.additionalUsers || [];
            setUsers(additionalUsers.map((user:{username:string,access:string})=>{
              return {
                email:user.username,
                access:user.access,
                status:'sent'
              }
            }))
          } else {
          
          }
        } catch (error) {
          console.error('Error fetching board:', error);
        } 
      }
      fetchUsers()
      setInviteEmail('');
      setEmailError(null);
      setEmailSendingStatus({success:[],failed:[]});
    }
  }, [isOpen]);

  useEffect(() => {
    console.log('Location:', window.location.href);
    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
      console.error('EmailJS environment variables are missing');
    }
  }, []);  



  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAddUser = () => {
    if (!inviteEmail) {
      setEmailError('Email is required');
      return;
    }
    
    if (!validateEmail(inviteEmail)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    if (users.some(user => user.email === inviteEmail)) {
      setEmailError('This user is already invited');
      return;
    }

    if (inviteEmail === currentUserEmail) {
      setEmailError('You cannot invite yourself');
      return;
    }

    const newUser: User = {
      email: inviteEmail,
      access: selectedAccess,
      invited: false,
      status: 'pending',
    };

    setUsers([...users, newUser]);
    setInviteEmail('');
    setEmailError(null);
  };

  const handleRemoveUser = async (userId: string,access:string) => {

    const status=users.find(user => user.email === userId)?.status
    if(status==='sent'){
      const docRef=doc(firestore,'boards',whiteboardId as string)
      await updateDoc(docRef,{
        additionalUsers:arrayRemove({
          username:userId,
          access
        })
      })
    }

    setUsers(users.filter(user => user.email !== userId));
  };

  const handleChangeAccess = (userId: string, access: 'view' | 'edit') => {
    setUsers(users.map(user => 
      user.email === userId ? { ...user, access } : user
    ));
  };

  const sendInviteEmail=async(userEmail:string,accessType:'view'|'edit')=>{
    try{

        if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
          console.error('EmailJS environment variables are missing');
        }
      const inviteLink=`${window.location.origin}/board/${whiteboardId}?shared=${userEmail}&mode=${accessType}`
      console.log('Invite link:', inviteLink);
      
      // const templateParams={
      //   to_email:userEmail,
      //   from_name:currentUserEmail,
      //   whiteboard_name:whiteboardName,
      //   access_type:accessType==='edit'?'Edit':'View',
      //   invite_link:inviteLink
      // }

      // await emailjs.send(
      //   EMAILJS_SERVICE_ID,
      //   EMAILJS_TEMPLATE_ID,
      //   templateParams,
      //   EMAILJS_PUBLIC_KEY
      // )
      const response=await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/send-invite`,{
        fromName:currentUserEmail,
        toEmail:userEmail,
        inviteLink,
        boardName:whiteboardName,
        accessType:accessType==='edit'?'Edit':'View'
      })
      if(response.data.success==false){
        toast.error('Failed to send email',{duration:2000,position:'top-right'})
      }

      const docRef=doc(firestore,'boards',whiteboardId as string)
      const boardSnap=await getDoc(docRef)
      if(!boardSnap.exists()){
        return false
      }
      
      await updateDoc(docRef,{
        additionalUsers:arrayUnion({
          username:userEmail,
          access:accessType,
        })
      })

      return true
    }
    catch(err){
      return false
    }
  }

  const handleSendInvites = async () => {
    const pendingUsers = users.filter(user => user.status === 'pending' && !user.invited);
    if (pendingUsers.length === 0) return;
    
    setIsInviting(true);
    const successfulEmails: string[] = [];
    const failedEmails: string[] = [];
    
    for (const user of pendingUsers) {
      // console.log(`Sending invite to ${user.email} with access ${user.access}`);
      
      try {
        const success = await sendInviteEmail(user.email, user.access);
        
        if (success) {
          successfulEmails.push(user.email);
          
          setUsers(currentUsers => {
            return currentUsers.map(u => 
              u.email === user.email 
                ? {...u, invited: true, status: 'sent' as const} 
                : u
            );
          });
          
          await new Promise(resolve => setTimeout(resolve, 50));
        } else {
          failedEmails.push(user.email);
        }
      } catch (error) {
        failedEmails.push(user.email);
        // console.error(`Error sending to ${user.email}:`, error);
      }
    }
    
    setEmailSendingStatus({
      success: successfulEmails,
      failed: failedEmails
    });
    
    setIsInviting(false);
  };

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
            <h3>Whiteboard: {whiteboardName}</h3>
            <p className="owner-info">Created by: {currentUserEmail} </p>
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
              <>
                <table className="collaborators-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Access</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody className='table-body'>
                  {users.map(user => (
                    <tr key={user.email} className={user.invited ? 'invited' : 'pending'}>
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
                          onChange={(e) => handleChangeAccess(user.email, e.target.value as 'view' | 'edit')}
                          className="access-select"
                          disabled={user.status==='sent'}
                        >
                          <option value="view">View</option>
                          <option value="edit">Edit</option>
                        </select>
                      </td>
                      <td className="status-cell">
                        <div className={`status-badge ${user.status}`}>
                          {user.status === 'sent' ? (
                            <>
                              <Check size={14} />
                              <span>Sent</span>
                            </>
                          ) : (
                            <>
                              <span>Pending</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="actions-cell">
                        <button 
                          className="remove-button" 
                          onClick={() => handleRemoveUser(user.email,user.access)}
                          aria-label="Remove user"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {emailSendingStatus.success.length > 0 && (
                <div className="success-message">
                  Successfully sent invitations to: {emailSendingStatus.success.join(', ')}
                </div>
              )}

              {emailSendingStatus.failed.length > 0 && (
                <div className="error-message">
                  Failed to send invitations to: {emailSendingStatus.failed.join(', ')}
                </div>
              )}
            </>
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