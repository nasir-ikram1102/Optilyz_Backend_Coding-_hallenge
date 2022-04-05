const request = require('supertest');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const { Task } = require('../../src/models');
const { taskOne, taskTwo, insertTasks } = require('../fixtures/task.fixture');
const { accessToken } = require('../fixtures/token.fixture');

setupTestDB();

describe('Task routes', () => {
  describe('POST /tasks/createTask', () => {
    let newTask;

    beforeEach(() => {
      newTask = {
        title: "Test Task 1",
        description: "Test Description 1",
        taskDateTime: new Date(),
        reminderDateTime: new Date(),
        isCompleted: true
      };
    });

    test('should return 201 and successfully create new task if data is ok', async () => {
      await insertTasks([taskOne]);

      const res = await request(app)
        .post('/tasks/createTask')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(newTask)
        .expect(httpStatus.CREATED);

      expect(res.body).toEqual({
        id: expect.anything(),
        title: newTask.title,
        description: newTask.description,
        taskDateTime: newTask.taskDateTime,
        reminderDateTime: newTask.reminderDateTime,
        isCompleted: newTask.isCompleted
      });

      const dbTask = await Task.findById(res.body.id);
      expect(dbTask).toBeDefined();
      expect(dbTask).toMatchObject({ 
        title: newTask.title,
        description: newTask.description,
        taskDateTime: newTask.taskDateTime,
        reminderDateTime: newTask.reminderDateTime,
        isCompleted: newTask.isCompleted });
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).post('/tasks/createTask').send(newTask).expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /tasks/getTasks', () => {
    test('should return 200 and apply the default query options', async () => {
      await insertTasks([taskOne, taskTwo]);

      const res = await request(app)
        .get('/tasks/getTasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(2);
      expect(res.body.results[0]).toEqual({
        id: taskOne.id.toHexString(),
        title: taskOne.title,
        description: taskOne.description,
        taskDateTime: taskOne.taskDateTime,
        reminderDateTime: taskOne.reminderDateTime,
        isCompleted: taskOne.isCompleted
      });
    });

    test('should return 401 if access token is missing', async () => {
      await insertTasks([taskOne, taskTwo]);
      await request(app).get('/tasks/getTasks').send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should correctly sort the returned array if descending sort param is specified', async () => {
      await insertTasks([taskOne, taskTwo]);

      const res = await request(app)
        .get('/tasks/getTasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .query({ sortBy: 'role:desc' })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(3);
      expect(res.body.results[0].id).toBe(taskOne.id.toHexString());
      expect(res.body.results[1].id).toBe(taskTwo.id.toHexString());
    });

    test('should correctly sort the returned array if ascending sort param is specified', async () => {
      await insertTasks([taskOne, taskTwo]);

      const res = await request(app)
        .get('/tasks/getTasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .query({ sortBy: 'role:asc' })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(3);
      expect(res.body.results[0].id).toBe(taskOne.id.toHexString());
      expect(res.body.results[1].id).toBe(taskTwo.id.toHexString());
    });

    test('should limit returned array if limit param is specified', async () => {
      await insertTasks([taskOne, taskTwo]);

      const res = await request(app)
        .get('/tasks/getTasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .query({ limit: 2 })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 2,
        totalPages: 2,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(2);
      expect(res.body.results[0].id).toBe(taskOne.id.toHexString());
      expect(res.body.results[1].id).toBe(taskTwo.id.toHexString());
    });

    test('should return the correct page if page and limit params are specified', async () => {
      await insertTasks([taskOne, taskTwo]);

      const res = await request(app)
        .get('/tasks/getTasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .query({ page: 2, limit: 2 })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 2,
        limit: 2,
        totalPages: 2,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0].id).toBe(taskOne.id.toHexString());
      expect(res.body.results[1].id).toBe(taskTwo.id.toHexString());
    });
  });

  describe('GET /tasks/getTaskById/:taskId', () => {
    test('should return 200 and the task object if data is ok', async () => {
      await insertTasks([taskOne]);

      const res = await request(app)
        .get(`/tasks/getTaskById/${taskOne.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        id: taskOne.id.toHexString(),
        title: taskOne.title,
        description: taskOne.description,
        taskDateTime: taskOne.taskDateTime,
        reminderDateTime: taskOne.reminderDateTime,
        isCompleted: taskOne.isCompleted
      });
    });

    test('should return 401 error if access token is missing', async () => {
      await insertTasks([taskOne]);

      await request(app).get(`/tasks/getTaskById/${taskOne.id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if taskId is not a valid mongo id', async () => {
      await insertTasks([taskOne]);

      await request(app)
        .get('/tasks/getTaskById/invalidId')
        .set('Authorization', `Bearer ${accessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if task is not found', async () => {
      await insertTasks([taskOne]);

      await request(app)
        .get(`/tasks/getTaskById/${taskOne.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /tasks/deleteTask/:taskId', () => {
    test('should return 204 if data is ok', async () => {
      await insertTasks([taskOne]);

      await request(app)
        .delete(`/tasks/deleteTask/${taskOne.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbTask = await Task.findById(taskOne.id);
      expect(dbTask).toBeNull();
    });

    test('should return 401 error if access token is missing', async () => {
      await insertTasks([taskOne]);

      await request(app).delete(`/tasks/deleteTask/${taskOne.id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if taskId is not a valid mongo id', async () => {
      await insertTasks([taskOne]);

      await request(app)
        .delete('/tasks/deleteTask/invalidId')
        .set('Authorization', `Bearer ${accessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if task is not found', async () => {
      await insertTasks([taskOne]);

      await request(app)
        .delete(`/tasks/deleteTask/${taskOne.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('PATCH /tasks/updateTask/:taskId', () => {
    test('should return 200 and successfully update task if data is ok', async () => {
      await insertTasks([taskOne]);
      const updateBody = {
        title: "Test Task 1",
        description: "Test Description 1",
        taskDateTime: new Date(),
        reminderDateTime: new Date(),
        isCompleted: true
      };

      const res = await request(app)
        .patch(`/tasks/updateTask/${taskOne.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        id: taskOne.id.toHexString(),
        title: updateBody.title,
        description: updateBody.description,
        taskDateTime: updateBody.taskDateTime,
        reminderDateTime: updateBody.reminderDateTime,
        isCompleted: updateBody.isCompleted
      });

      const dbTask = await Task.findById(taskOne.id);
      expect(dbTask).toBeDefined();
      expect(dbTask).toMatchObject({title: updateBody.title,
        description: updateBody.description,
        taskDateTime: updateBody.taskDateTime,
        reminderDateTime: updateBody.reminderDateTime,
        isCompleted: updateBody.isCompleted
       });
    });

    test('should return 401 error if access token is missing', async () => {
      await insertTasks([taskOne]);
      const updateBody = { title: "Test title 1" };

      await request(app).patch(`/tasks/updateTask/${taskOne.id}`).send(updateBody).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if taskId is not a valid mongo id', async () => {
      await insertTasks([taskOne]);
      const updateBody = { title: "Test title 2" };

      await request(app)
        .patch(`/tasks/updateTask/invalidId`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });
  });
});
