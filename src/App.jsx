import { useEffect, useState } from 'react';
import './App.css';
import axios from 'axios';
import { MdDeleteForever } from "react-icons/md";
axios.defaults.withCredentials = true;


// const API = 'http://localhost:5000/todos';
const API = process.env.NODE_ENV === 'production'
  ? 'mongodb+srv://monga1807:smonga%40123@cluster0-todo.ovrfpat.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0-todo'  // Production API URL
  : 'http://localhost:5000/todos';  // Local development API URL


function App() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState('');


  const fetchTodos = async () => {
    try {
      const res = await axios.get(API);
      setTodos(res.data);
    } catch (err) {
      console.error('Error fetching todos:', err.message);
      alert('Failed to load todos. Check if server is running.');
    }
  };
  

  const addTodo = async () => {
    if (!text) return;
    await axios.post(API, { text });
    setText('');
    fetchTodos();
  };

  const toggleComplete = async (todo) => {
    await axios.put(`${API}/${todo._id}`, { completed: !todo.completed });
    fetchTodos();
  };


  const deleteTodo = async (id) => {
    await axios.delete(`${API}/${id}`);
    fetchTodos();
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  return (
    <>
      <div className="Todo">
        <h1>To-Do</h1>
        <input type="text"
          value={text}
          className="Todo-input"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTodo()}
          placeholder='New Todo' />
        <button className="Todo-submit" onClick={addTodo}>submit</button>
      </div>
      <div className="list">
        <ul>
          {todos.map((todo) => (
            <li key={todo._id}>
              <span onClick={() => toggleComplete(todo)} 
              className='list-todo'
              style={{
                textDecoration: todo.completed ? 'line-through' : 'none',
                cursor: 'pointer',
              }}>
                {todo.text}
              </span>
              <button onClick={() => deleteTodo(todo._id)}><MdDeleteForever /></button>
            </li>
          ))} 

        </ul>
      </div>
    </>
  );
};
export default App;