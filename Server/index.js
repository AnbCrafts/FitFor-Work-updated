import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url'; 
import { dirname } from 'path';
import connectDB from './src/DB/ConnectDB.js';
import UserRouter from './src/Routes/User.Routes.js';
import SeekerRouter from './src/Routes/Seeker.Routes.js';
import AuthorityRouter from './src/Routes/Authority.Routes.js';
import JobRouter from './src/Routes/Job.Routes.js';
import AdminRoutes from './src/Routes/Admin.Routes.js';
import ApplicantRouter from './src/Routes/Applicant.Routes.js';
import EmployeeRouter from './src/Routes/Employee.Routes.js';
import notificationRouter from './src/Routes/Notification.Routes.js';
import GraphRouter from './src/Routes/Graph.Routes.js';
import DashboardRouter from './src/Routes/Dashboard.Routes.js';
import OllamaRouter from './src/Routes/Ollama.Routes.js';
import http from 'http';
import { Server } from 'socket.io';
import MessageRouter from './src/Routes/Message.Routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config(); 

connectDB();

const app = express();
const port = process.env.PORT || 9000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', 
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('✅ A user connected:', socket.id);

  // Receive message
  socket.on('sendMessage', ({ sender, receiver, text }) => {
    console.log(`📨 Message from ${sender} to ${receiver}: ${text}`);
    io.emit('receiveMessage', { sender, receiver, text }); // Broadcast to all
  });

  socket.on('disconnect', () => {
    console.log('❌ A user disconnected:', socket.id);
  });
}) 

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use('/resumes', express.static(path.join(__dirname, 'public/resumes')));

app.use("/api/user", UserRouter);
app.use("/api/notification", notificationRouter);
app.use("/api/applicant", SeekerRouter);
app.use("/api/authority", AuthorityRouter);
app.use("/api/job", JobRouter); 
app.use("/api/admin", AdminRoutes);
app.use("/api/job-applicant", ApplicantRouter);
app.use("/api/employee", EmployeeRouter);
app.use("/api/graph", GraphRouter);
app.use("/api/dashboard", DashboardRouter);
app.use("/api/AI-tools", OllamaRouter);
app.use("/api/message", MessageRouter);
    
app.get('/', (req, res) => {
  res.send("Server Started Successfully, you are in the homepage...");
});

app.listen(port, () => {
  console.log(`✅ Server running on: http://localhost:${port}`);
});
