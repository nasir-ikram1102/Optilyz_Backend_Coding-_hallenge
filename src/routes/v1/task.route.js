const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { taskValidation } = require('../../validations');
const { taskController } = require('../../controllers');

const router = express.Router();

router.route('/createTask')
  .post(auth(), validate(taskValidation.createTask), taskController.createTask);

router.route('/getTasks')
  .post(auth(), validate(taskValidation.getTasks), taskController.getTasks);

router.route('/getTaskById/:taskId')
  .get(auth(), validate(taskValidation.getTask), taskController.getTask);

router.route('/updateTask/:taskId')
  .patch(auth(), validate(taskValidation.updateTask), taskController.updateTask);

router.route('/deleteTask/:taskId')
  .delete(auth(), validate(taskValidation.deleteTask), taskController.deleteTask);

module.exports = router;