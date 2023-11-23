const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors());

const todoSchema = new mongoose.Schema({
  day: { type: Date },
  todos: { type: [String] }
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
  const { day, todos } = req.body;

  try {

    const savedTodo = await Todo.create({ day: day, todos: todos });

    res.json(savedTodo);
  } catch (error) {
    console.error('Error saving to-do items:', error);
    res.status(500).json({ error: 'Error saving to-do items' });
  }
});

app.get('/todos', async (req, res) => {
  const { chosenDay } = req.query;
  const parsedDate = new Date(chosenDay);

  const day = parsedDate.getDate();
  const month = parsedDate.getMonth();
  const year = parsedDate.getFullYear();
  
  const startOfDay = new Date(year, month, day);
  const endOfDay = new Date(year, month, day + 1);
  
  try {
    const todos = await Todo.find({
      day: {
        $gte:startOfDay,
        $lte:endOfDay
      },
    });

    res.json(todos);
  } catch (error) {
    console.error('Error fetching to-do items:', error);
    res.status(500).json({ error: 'Error fetching to-do items' });
  }
});

