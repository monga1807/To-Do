import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const mongoDBUri = 'mongodb+srv://monga1807:smonga%40123@cluster0-todo.ovrfpat.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0-todo';
mongoose.connect(mongoDBUri)
    .then(() => console.log("Connected"))
    .catch((err) => console.error("MongoDB connection error:", err));

import { Schema, model } from 'mongoose';

const todoSchema = new Schema({
    text: String,
    completed: Boolean
});
const Todo = model('Todo', todoSchema);

app.get('/todos', async (req, res) => {
    try {
        const todos = await Todo.find();
        res.json(todos);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch todos" });
    }
});

app.post('/todos', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: 'Text is required' });

        const newTodo = new Todo({ text, completed: false });
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
