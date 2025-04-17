import { useState, useEffect, useRef } from "react";
import * as fabric from "fabric";
import Sidebar from "../components/Sidebar";
import ToolBar from "../components/ToolBar";
import FabricCanvas from "../components/FabricCanvas";
import SaveBoard from "../components/SaveBoard";
import { FabricContext } from "../context/FabricContext";
import "./WhiteBoard.css";
import { useAuth } from "../providers/AuthProvider";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { firestore } from "../utils/firebase";

export default function WhiteBoard() {
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [boardData, setBoardData] = useState<any>(null);
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  const {boardId}=useParams<{boardId:string}>()

  const socket=io('http://localhost:3000')
  // This effect runs when the canvas is initialized in FabricCanvas
  useEffect(() => {
    if (fabricCanvasRef.current && !canvas) {
      setCanvas(fabricCanvasRef.current);
    }
  }, [canvas, fabricCanvasRef.current]);

  useEffect(()=>{
    socket.on('connect',()=>{
      console.log('Connected to server:',socket.id);
      
    })

    socket.on('welcome',(message)=>{
      console.log('Server says :',message);
    })

    socket.on('disconnect',()=>{
      console.log('Disconnected from server');
    })
    return ()=>{
      socket.off('connect');
      socket.off('welcome');
      socket.off('disconnect');
    }
  },[])

  useEffect(()=>{

    async function checkAndCreateBoard(){
      if(!boardId || !user){
        setLoading(false)
        setError('Board ID or user is not defined')
        return
      }
      setLoading(true)
      setError(null)
      try {
        const boardRef=doc(firestore,'boards',boardId)

        const boardSnap=await getDoc(boardRef)

        if(boardSnap.exists()){
          const data=boardSnap.data()
          setBoardData(data)
          console.log('Board data:',data);

          const isOwner=data.ownerName===user.email
          const additionalUser=data.additionalUsers?.find(
            (u:{username:string,access:string})=>u.username===user.email
          )
          if(!isOwner && !additionalUser){
            setError('You do not have access to this board')
            setLoading(false)
            return
          }
          else{
            if(canvas && data.canvasState){
              canvas.loadFromJSON(data.canvasState,canvas.renderAll.bind(canvas))
            }
          }
        }
        else{
          setShowNamePrompt(true)
        }
      } catch (error) {
        console.error('Error fetching board:',error);
        setError('Failed to create or fetch board')
      }
      finally{
        setLoading(false)
      }
    }
    checkAndCreateBoard()
  },[boardId,user,canvas])

  const saveCanvasState=async()=>{
    if(!canvas || !boardId || !user) return
    try {
      const canvasJSON=JSON.stringify(canvas.toJSON())
      const boardRef=doc(firestore,'boards',boardId)

      await setDoc(boardRef,{
        canvasState:canvasJSON,
        lastUpdatedAt:serverTimestamp()
      },{merge:true})
    } catch (error) {
      console.error('Error saving canvas state:',error);
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
      console.log('New board created:',newBoard);
    } catch (error) {
      console.error('Error creating new board:',error);
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
            />
          <main className="whiteboard-content">
            <FabricCanvas canvasRef={fabricCanvasRef} />
          </main>
          <ToolBar />
        </div>
      </FabricContext.Provider>
    </>
  );
}