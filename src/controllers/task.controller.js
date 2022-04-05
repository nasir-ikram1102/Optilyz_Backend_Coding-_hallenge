const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { taskService } = require('../services');
const moment = require('moment');


/**
 * Create a task
 * @param {Object} taskBody
 * @returns {Promise<Task>}
 */
const createTask = catchAsync(async (req, res) => {
  const taskServ = await taskService.createTask(req.body);
  res.status(httpStatus.CREATED).send(taskServ);
});


/**
 * Query for tasks
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const getTasks = catchAsync(async (req, res) => {
  const titleSearch = req.body.title;
  const filter = (titleSearch) ?
    {
        title: {
          $regex: titleSearch, $options: 'i'
        }
    } : {};

  var taskFrom = req.body.taskFrom;
  var taskTo = req.body.taskTo;

  if (taskFrom && taskTo) {
    taskFrom = moment(new Date(taskFrom)).startOf('day').toDate();
    taskTo = moment(new Date(taskTo)).endOf('day').toDate();

    filter.taskDateTime = {
      $gte: taskFrom,
      $lt: taskTo
    }
  }

  const options = pick(req.body, ['sortBy', 'limit', 'page']);
  const result = await taskService.getTasks(filter, options);
  res.send(result);
});


/**
 * Get task by id
 * @param {ObjectId} id
 * @returns {Promise<Task>}
 */
const getTask = catchAsync(async (req, res) => {
  const task = await taskService.getTaskById(req.params.taskId);
  if (!task) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Task not found');
  }
  res.send(task);
});


/**
 * Update task by id
 * @param {ObjectId} taskId
 * @param {Object} updateBody
 * @returns {Promise<Task>}
 */
const updateTask = catchAsync(async (req, res) => {
  const task = await taskService.updateTaskById(req.params.taskId, req.body);
  res.send(task);
});


/**
 * Delete task by id
 * @param {ObjectId} taskId
 * @returns {Promise<Task>}
 */
const deleteTask = catchAsync(async (req, res) => {
  await taskService.deleteTaskById(req.params.taskId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
};
