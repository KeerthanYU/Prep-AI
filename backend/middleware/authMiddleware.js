const verifyToken = require('./authJwt');

module.exports = {
  verifyToken,
  verifyJWTToken: verifyToken,
};

