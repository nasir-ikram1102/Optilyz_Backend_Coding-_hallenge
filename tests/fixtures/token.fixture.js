const moment = require('moment');
const config = require('../../src/config/config');
const { tokenTypes } = require('../../src/config/tokens');
const tokenService = require('../../src/services/token.service');
const { userOne } = require('./user.fixture');

const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
const accessToken = tokenService.generateToken(userOne, accessTokenExpires, tokenTypes.ACCESS);

module.exports = {
  accessToken,
};
