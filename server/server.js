const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors());

const taskSchema = new mongoose.Schema({
  day: { type: Date },
  tasks: { type: [String] }
});

const Task = mongoose.model('Task', taskSchema);


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

app.post('/tasks/save', async (req, res) => {
  const { chosenDay, taskList } = req.body;
  const parsedDate = new Date(chosenDay);

  const day = parsedDate.getDate();
  const month = parsedDate.getMonth();
  const year = parsedDate.getFullYear();
  
  const startOfDay = new Date(year, month, day);
  const endOfDay = new Date(year, month, day + 1);

  try {
    const existingTask = await Task.findOne({ 
        day: {         
          $gte: startOfDay,
          $lte: endOfDay 
        } 
      });

    if (existingTask) {
      existingTask.tasks = taskList;
      await existingTask.save();

      res.json(existingTask);
    } else {
      const newTask = await Task.create({ day: parsedDate, tasks: taskList });

      res.json(newTask);
    }
  } catch (error) {
    console.error('Error when saving tasks:', error);
    res.status(500).json({ error: 'Error when saving tasks' });
  }
});

app.get('/tasks', async (req, res) => {
  const { chosenDay } = req.query;
  const parsedDate = new Date(chosenDay);

  const day = parsedDate.getDate();
  const month = parsedDate.getMonth();
  const year = parsedDate.getFullYear();
  
  const startOfDay = new Date(year, month, day);
  const endOfDay = new Date(year, month, day + 1);
  
  try {
    const tasks = await Task.find({
      day: {
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

