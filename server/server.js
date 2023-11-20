const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors());

const todoSchema = new mongoose.Schema({
  day: { type: Date},
  todos: { type: [String] },
});

const Todo = mongoose.model('Todo', todoSchema);


mongoose.connect('mongodb://0.0.0.0:27017/to-do-app', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const connection = mongoose.connection;
connection.once('open', () => {
    console.log('MongoDB database connection established successfully');
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});

app.post('/todos/save', async (req, res) => {
  const { todos } = req.body;

  try {

    if (Array.isArray(todos)) {
 
      const day = todos.day; 

      // const tasks = todos.map(todo => todo.todos);
      const tasks = "dddd"

      const savedTodo = await Todo.create({ day: day, todos: tasks });

      res.json(savedTodo);
    }  else {
      throw new Error('Invalid data format');
    }
  } catch (error) {
    console.error('Error saving to-do items:', error);
    res.status(500).json({ error: 'Error saving to-do items' });
  }
});

