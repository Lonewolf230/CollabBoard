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



app.get('/', (req, res) => {
  res.send('Hello from TypeScript backend!');
});

io.on('connection',(socket)=>{
  console.log('a user connected');
  socket.emit('welcome',`Welcome user ${socket.id}`)
  socket.on('disconnect',()=>{
    console.log('user disconnected')
  })
  socket.on('message',(msg)=>{
    console.log(msg)
    io.emit('message',msg)
  })
})

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
