const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors());

const taskSchema = new mongoose.Schema({
  date: { type: Date },
  tasks: { type: Array }
});

const Task = mongoose.model('Task', taskSchema);

const url = process.env.MONGO_URL_ATLAS;

mongoose.connect(url, {
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

app.post('/tasks/save', async (req, res) => {
  const { chosenDate, taskList, completedTasks } = req.body;
  const parsedDate = new Date(chosenDate);

  const day = parsedDate.getDate();
  const month = parsedDate.getMonth();
  const year = parsedDate.getFullYear();
  
  const startOfDay = new Date(year, month, day);
  const endOfDay = new Date(year, month, day + 1);

  try {
    const existingTask = await Task.findOne({ 
        date: {         
          $gte: startOfDay,
          $lte: endOfDay 
        } 
      });

    if (existingTask) {
      const updatedTasks = taskList.map((description, index) => ({
        description,
        completed: completedTasks[index] || false
      }));
      existingTask.tasks = updatedTasks;
      await existingTask.save();

      res.json(existingTask);
    } else {
      const newTasks = taskList.map((description, index) => ({
        description,
        completed: completedTasks[index] || false
      }));
      
      const newTask = await Task.create({ 
        date: parsedDate, 
        tasks: newTasks
      });

      res.json(newTask);
    }
  } catch (error) {
    console.error('Error when saving tasks:', error);
    res.status(500).json({ error: 'Error when saving tasks' });
  }
});

app.get('/tasks', async (req, res) => {
  const { chosenDate } = req.query;
  const parsedDate = new Date(chosenDate);

  const day = parsedDate.getDate();
  const month = parsedDate.getMonth();
  const year = parsedDate.getFullYear();
  
  const startOfDay = new Date(year, month, day);
  const endOfDay = new Date(year, month, day + 1);
  
  try {
    const tasks = await Task.find({
      date: {
        $gte:startOfDay,
        $lte:endOfDay
      },
    });

    res.json(tasks);
  } catch (error) {
    console.error('Error when fetching tasks:', error);
    res.status(500).json({ error: 'Error when fetching tasks' });
  }
});