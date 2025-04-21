import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const PORT = 3000;

const server=http.createServer(app);
const io=new Server(server,{
  cors:{
    origin:"http://localhost:5173",
    methods:["GET","POST"]
  }
})

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const roomUsers:{[key:string]:string[]}={}
const userRooms:{[key:string]:string[]}={}
const socketToUser:{[key:string]:string}={}

app.get('/', (req, res) => {
  res.send('Hello from TypeScript backend!');
});

io.on('connection',(socket)=>{
  console.log('a user connected');
  socket.emit('welcome',`Welcome user ${socket.id}`)

  socket.on('join-room',({roomId,userId})=>{

    socketToUser[socket.id]=userId
    if(!userRooms[userId]){
      userRooms[userId]=[]
    }
    userRooms[userId].push(roomId)

    socket.join(roomId)
    console.log(`user ${userId} joined room ${roomId}`)

    if(!roomUsers[roomId]){
      roomUsers[roomId]=[]
    }
    roomUsers[roomId].push(userId)

    socket.emit('room-joined',{roomId})
    socket.to(roomId).emit('user-joined',{
      userId:userId,
      userCount:roomUsers[roomId].length,
    })
  })

  socket.on('leave-room',({roomId,userId})=>{
    console.log(`user ${userId} left room ${roomId}`)
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

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    const userEmail = socketToUser[socket.id];
    
    if(userEmail && userRooms[socket.id]){
      userRooms[socket.id].forEach((roomId)=>{
        if(roomUsers[roomId]){
          roomUsers[roomId]=roomUsers[roomId].filter((id:string) => id!==userEmail)
          if(roomUsers[roomId].length===0){
            delete roomUsers[roomId]
          }
          else{
            socket.to(roomId).emit('user-left',{
              userId:userEmail,
              userCount:roomUsers[roomId].length,
            })
          }
        }
      })
      delete socketToUser[socket.id]
      delete userRooms[socket.id]
  }})
})


server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
})
