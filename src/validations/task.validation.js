const Joi = require('joi');
const {objectId } = require('./custom.validation');

const createTask = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    description: Joi.string(),
    taskDateTime: Joi.date().required(),
    reminderDateTime: Joi.date().required(),
    isCompleted: Joi.boolean().default(false),
  }).options({allowUnknown: true}),
};

const getTasks = {
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getTask = {
  params: Joi.object().keys({
    taskId: Joi.string().custom(objectId),
  }),
};

const updateTask = {
  params: Joi.object().keys({
    taskId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      title: Joi.string().required(),
      description: Joi.string(),
      taskDateTime: Joi.date().required(),
      reminderDateTime: Joi.date().required(),
      isCompleted: Joi.boolean().invalid(false),
    })
    .min(1),
};

const deleteTask = {
  params: Joi.object().keys({
    taskId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
};
