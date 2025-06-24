

const jwt = require('jsonwebtoken');


function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ msg: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
    if (err) {
      return res.status(401).json({ msg: 'Unauthorized' });
    }

    req.user = payload;
    next();
  });
}

module.exports = { authenticateJWT };
