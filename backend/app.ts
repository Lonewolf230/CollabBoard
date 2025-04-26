import express,{Request,Response} from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import http from 'http';
import { Server,Socket } from 'socket.io';
import { configDotenv } from 'dotenv';
configDotenv()

const app = express();
const PORT=process.env.PORT;

const server=http.createServer(app);
const io=new Server(server,{
  cors:{
    origin:"*",
    methods:["GET","POST"]
  }
})

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

interface RoomUsers{
  [key:string]:string[]
}

interface UserRooms{
  [key:string]:string[]
}

interface SocketToUser{
  [key:string]:string
}

interface CanvasState{
  state:string
  timestamp:number
}

interface RoomCanvasStates{
  [key:string]:CanvasState
}

interface JoinRoomPayload{
  roomId:string
  userId:string
}

interface LeaveRoomPayload{
  roomId:string
  userId:string
}

interface MessagePayload{
  message:string
  roomId:string
}

interface CanvasUpdatePayload{
  roomId:string
  userId:string
  state:string
  timestamp:number
}

const roomUsers:RoomUsers={}
const userRooms:UserRooms={}
const socketToUser:SocketToUser={}
const roomCanvasStates:RoomCanvasStates={}

app.get('/', (req:Request, res:Response) => {
  res.send('Hello from TypeScript backend!');
});

io.on('connection',(socket:Socket)=>{
  console.log('a user connected');
  socket.emit('welcome',`Welcome user ${socket.id}`)

  socket.on('join-room',({roomId,userId})=>{

    socketToUser[socket.id]=userId
    // userRooms[socket.id]=roomId
    if(!userRooms[socket.id]){
      userRooms[socket.id]=[]
    }
    // userRooms[userId].push(roomId)
    if(!userRooms[socket.id].includes(roomId)){
      userRooms[socket.id].push(roomId)
    }
    socket.join(roomId)
    // console.log(`user ${userId} joined room ${roomId}`)

    if(!roomUsers[roomId]){
      roomUsers[roomId]=[]
    }

    if(!roomUsers[roomId].includes(userId)){
      roomUsers[roomId].push(userId)
    }

    socket.emit('room-joined',{roomId})
    socket.to(roomId).emit('user-joined',{
      userId:userId,
      userCount:roomUsers[roomId].length,
    })

    socket.to(roomId).emit('canvas-update',{
      roomId,
      requestingUserId:userId,
    })

    if(roomCanvasStates[roomId]){
      socket.emit('canvas-update',{
        roomId,
        userId:'server',
        state:roomCanvasStates[roomId].state,
        timestamp:roomCanvasStates[roomId].timestamp,
      })
      // console.log(`Sending canvas state to ${userId} for room ${roomId}`)
    }
  })

  socket.on('save-message',({message,roomId})=>{
    socket.to(roomId).emit('save-response',{
      message,
    })
  })

  socket.on('leave-room',({roomId,userId})=>{
    // console.log(`user ${userId} left room ${roomId}`)
    socket.leave(roomId)

    if(userRooms[socket.id]){
      userRooms[socket.id]=userRooms[socket.id].filter((id:string) => id!==roomId)
      if(userRooms[socket.id].length===0){
        delete userRooms[socket.id]
      }
    }

    if(roomUsers[roomId]){
      roomUsers[roomId]=roomUsers[roomId].filter((id:string) => id!==userId)
      if(roomUsers[roomId].length===0){
        delete roomUsers[roomId]
      }
      else{
        socket.to(roomId).emit('user-left',{
          userId,
          userCount:roomUsers[roomId].length,
        })
      }
    }
  })

  socket.on('canvas-update',(data)=>{
    const {roomId,userId,state,timestamp}=data
    if(!roomId || !userId || !state){
      // console.log('Invalid data received')
      return
    }
    if(!roomCanvasStates[roomId] || timestamp>roomCanvasStates[roomId].timestamp){
      roomCanvasStates[roomId]={state,timestamp}
    }

    socket.to(roomId).emit('canvas-update',{
      roomId,
      userId,
      state,
      timestamp,
    })
    // console.log(`Canvas update from ${userId} for room ${roomId}`);
    
  })

  socket.on('disconnect', () => {
    // console.log('User disconnected:', socket.id);
    const userEmail = socketToUser[socket.id];
    // const roomId = userRooms[socket.id];
    // console.log(`User ${userEmail} disconnected from room ${roomId}`);
    
    if(userEmail && userRooms[socket.id]){
      userRooms[socket.id].forEach((currentRoomId:string)=>{
        if(roomUsers[currentRoomId]){
          roomUsers[currentRoomId]=roomUsers[currentRoomId].filter((userId:string) => userId!==userEmail)
          if(roomUsers[currentRoomId].length===0){
            delete roomUsers[currentRoomId]
          }
          else{
            socket.to(currentRoomId).emit('user-left',{
              userId:userEmail,
              userCount:roomUsers[currentRoomId].length,
            })
          }
        }
      })
      delete socketToUser[socket.id]
      delete userRooms[socket.id]
  }})
})

server.listen(PORT, () => {
  console.log('Server runnning successfully')
})
