import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { v4 as uuidv4 } from 'uuid';
dotenv.config();

const app = express();
// app.use(cors({
//     origin: 'https://to-do-roan-theta.vercel.app', // your frontend origin
//     credentials: true               // allow cookies
//   }));
// app.use(cors({
//     origin: 'http://localhost:5173', // your frontend origin
//     credentials: true               // allow cookies
//   }));
// app.use(cors());
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://to-do-roan-theta.vercel.app']  // Production URL
  : ['http://localhost:5173'];  // Local development URL

app.use(cors({
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {  // Allow non-browser requests like Postman
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,  // Allow cookies to be sent with requests
}));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Credentials", "true");
    next();
  });
  

const mongoDBUri = 'mongodb+srv://monga1807:smonga%40123@cluster0-todo.ovrfpat.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0-todo';
mongoose.connect(mongoDBUri)
    .then(() => console.log("Connected"))
    .catch((err) => console.error("MongoDB connection error:", err));

import { Schema, model } from 'mongoose';

const todoSchema = new Schema({
    userId: String,
    text: String,
    completed: Boolean
});
const Todo = model('Todo', todoSchema);



// Middleware to assign anonymous user ID
app.use((req, res, next) => {
    if (!req.cookies.anon_user_id) {
        const anonId = uuidv4();
        res.cookie('anon_user_id', anonId, {
            httpOnly: false, // accessible by frontend JS if needed
            maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
        });
        req.anonId = anonId;
    } else {
        req.anonId = req.cookies.anon_user_id;
    }
    next();
});



app.get('/todos', async (req, res) => {
    try {
        const todos = await Todo.find({ userId: req.anonId });
        res.json(todos);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch todos" });
    }
});

app.post('/todos', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: 'Text is required' });

        const newTodo = new Todo({ text, completed: false, userId: req.anonId  });
        const saved = await newTodo.save();
        res.status(201).json(saved);
    } catch (err) {
        console.error('Error in POST /todos:', err.message);
        res.status(500).json({ error: 'Server error' });
    };
});

app.put('/todos/:id', async (req, res) => {
    try {
        const updated = await Todo.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update todo' });
    }
});

app.delete('/todos/:id', async (req, res) => {
    try {
        await Todo.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete todo' });
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(` Server in running on http://Localhost:${PORT}`)
})
