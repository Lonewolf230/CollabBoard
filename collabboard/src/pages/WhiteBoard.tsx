
import { useState, useEffect, useRef } from "react";
import * as fabric from "fabric";
import Sidebar from "../components/Sidebar";
import ToolBar from "../components/ToolBar";
import FabricCanvas from "../components/FabricCanvas";
import SaveBoard from "../components/SaveBoard";
import { FabricContext } from "../context/FabricContext";
import "./WhiteBoard.css";
import { useAuth } from "../providers/AuthProvider";
import { io, Socket } from "socket.io-client";
import { useParams,useSearchParams } from "react-router-dom";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { firestore } from "../utils/firebase";
import { useToast } from "../utils/ToastManager";

export default function WhiteBoard() {
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [_loading, setLoading] = useState(true);
  const [_error, setError] = useState<string | null>(null);
  const [boardData, setBoardData] = useState<any>(null);
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasEditAccess, setHasEditAccess] = useState(false);
  const { user } = useAuth();
  const {boardId}=useParams<{boardId:string}>()
  const [searchParams]=useSearchParams()
  const toast=useToast()
  const isNewBoard=useRef(false)
  const socketRef=useRef<Socket|null>(null);
  const socketInitialized = useRef(false);

  useEffect(()=>{
    if(socketInitialized.current) return
    const socket=io(import.meta.env.VITE_BACKEND_URL)
    socketRef.current=socket
    socket.on('connect',()=>{
      // console.log('Connected to socket server ',socket.id)
      socket.emit('join-room',{
        roomId:boardId,
        userId:user?.email      
      })

      toast.success('Connected to whiteboard',{duration:2000,position:'top-right'})
    })

    socket.on('room-joined',()=>{
      // console.log('Joined room:',data.roomId)
    })

    socket.on('user-joined',(data)=>{
      // console.log('User joined:',data.userId)
      toast.info(`User ${data.userId} joined`,{duration:2000,position:'top-right'})
    })

    socket.on('user-left',(data)=>{
      // console.log('User left:',data.userId)
      toast.info(`${data.userId} left`,{duration:2000,position:'top-right'})
    })

    socket.on('save-response',(data)=>{
      // console.log('Save response:',data.message)
      toast.info(data.message,{duration:2000,position:'top-right'})
    })

    socketInitialized.current=true

    return ()=>{
      if(socket){
        socket.emit('leave-room',{roomId:boardId,userId:user?.email})
        socket.disconnect()
        socketInitialized.current=false
        console.log('Disconnected from socket server')
      }
    }
  },[])

  useEffect(() => {
    if (fabricCanvasRef.current && !canvas) {
      setCanvas(fabricCanvasRef.current);
    }
  }, [canvas, fabricCanvasRef.current]);


useEffect(() => {
  async function checkAndCreateBoard() {
    // console.log('Search params: ',searchParams.get('shared'));
    
    if (!boardId || !user) {
      setLoading(false);
      setError('Board ID or user is not defined');
      return;
    }

    const sharedEmail= searchParams.get('shared')
    if(sharedEmail!=null && sharedEmail!==user.email){
      // console.error('Fishy');
      
      setError('You do not have access to this board')
      return
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const boardRef = doc(firestore, 'boards', boardId);
      const boardSnap = await getDoc(boardRef);

      if (boardSnap.exists()) {
        const data = boardSnap.data();
        // console.log('Board data loaded:', data);

        const isOwner = data.ownerName === user.email;
        const additionalUser = data.additionalUsers?.find(
          (u: {username: string, access: string}) => u.username === user.email
        );
        
        if (!isOwner && !additionalUser) {
          setError('You do not have access to this board');
        } else {
          if (isOwner) {
            setHasEditAccess(true);
          } else if (additionalUser) {
            setHasEditAccess(additionalUser.access === 'edit');
          }
          else{
            setHasEditAccess(false)
          }
          setBoardData(data);
        }
      } else {
        isNewBoard.current=true
        setShowNamePrompt(true);
      }
    } catch (error) {
      // console.error('Error fetching board:', error);
      setError('Failed to create or fetch board');
    } finally {
      setLoading(false);
    }
  }
  
  checkAndCreateBoard();
}, [boardId, user]); 

  const saveCanvasState=async()=>{
    if(!canvas || !boardId || !user) return
    try {
      const canvasJSON=JSON.stringify(canvas.toJSON())
      const boardRef=doc(firestore,'boards',boardId)

      await setDoc(boardRef,{
        canvasState:canvasJSON,
        lastUpdatedAt:serverTimestamp()
      },{merge:true})
      toast.success('Canvas state saved successfully',{duration:2000,position:'top-right'})
      if(socketRef.current?.connected ){
        // console.log('Emiting save message');
        
        socketRef.current.emit('save-message',{
          message:`Canvas saved by ${user.email}`,
          roomId:boardId
        })
      }
      else{
        // console.error('Socket not connected')
      }
    } catch (error) {
      // console.error('Error saving canvas state:',error);
      setError('Failed to save canvas state')
    }
  }

  const createNewBoard=async(boardName:string)=>{
    if(!boardId || !user) return
    setIsSaving(true)
    try {
      const boardRef=doc(firestore,'boards',boardId)
      const newBoard={
        boardId,
        createdAt: serverTimestamp(),
        ownerName: user.email,
        boardName,
        canvasState: "",
        lastUpdatedAt: serverTimestamp(),
        additionalUsers:[]
      }
      await setDoc(boardRef,newBoard)
      setBoardData(newBoard)
      setHasEditAccess(true)
      if(isNewBoard.current){
        setTimeout(()=>{
          window.location.reload()
        },500)
      }
      // console.log('New board created:',newBoard);
    } catch (error) {
      // console.error('Error creating new board:',error);
      setError('Failed to create new board')
    }
    finally{
      setIsSaving(false)
    }
  }

  return (
    <>
      {showNamePrompt && (
        <SaveBoard 
          onCreate={createNewBoard} 
          isLoading={isSaving}
          initialName=""
          handleDialog={(setValue:boolean)=>setShowNamePrompt(setValue)}
          />
      )}

      <FabricContext.Provider value={canvas}>
        <div className="whiteboard-container">
          <Sidebar 
            currentUserEmail={user?.email} 
            whiteboardId={boardId}
            onSaveBoard={saveCanvasState}
            hasEditAccess={hasEditAccess}
            whiteboardName={boardData?.boardName}
            />
          <main className="whiteboard-content">
            <FabricCanvas 
                canvasRef={fabricCanvasRef}
                initialCanvasState={boardData?.canvasState || undefined}
                hasEditAccess={hasEditAccess}
                boardId={boardId || ""}
                 />
          </main>
          {hasEditAccess && <ToolBar/>}
        </div>
      </FabricContext.Provider>
    </>
  );
}