const jwt = require('jsonwebtoken');

const generateToken = (userId, role) => {
  const payload = {
    userId,
    role
  };

  const options = {
    expiresIn: '7d'
  };

  return jwt.sign(payload, process.env.JWT_SECRET, options);
};

module.exports = { generateToken };
