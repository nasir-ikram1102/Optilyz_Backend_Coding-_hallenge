const express = require('express');
const authRoute = require('./auth.route');
const taskRoute = require('./task.route');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/tasks',
    route: taskRoute,
  }
];

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

module.exports = router;
