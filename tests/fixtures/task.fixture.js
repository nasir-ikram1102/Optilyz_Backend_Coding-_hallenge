const mongoose = require('mongoose');
const { Task } = require('../../src/models');

const taskOne = {
  id: mongoose.Types.ObjectId(),
  title: 'Task 1',
  description: 'description',
  taskDateTime: new Date(),
  reminderDateTime:  new Date(),
  isCompleted: false
};

const taskTwo = {
  id: mongoose.Types.ObjectId(),
  title: 'Task 2',
  description: '',
  taskDateTime:  new Date(),
  reminderDateTime:  new Date(),
  isCompleted: true
};

const insertTasks = async (tasks) => {
  await Task.insertMany(tasks.map((task) => ({ ...task })));
};

module.exports = {
  taskOne,
  taskTwo,
  insertTasks
};
