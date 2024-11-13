const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY;

module.exports = async function (req, res, next) {
  // console.log('Loaded secret key:', secretKey);

  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided or incorrect format' });
    }
    const token = authHeader.split(' ')[1];
    // console.log('-------policy token:', token);
    const decoded = jwt.verify(token, secretKey);
    // console.log('-------policy decoded:', decoded);

    const userId = decoded.email;
    const user = await User.findOne({ email: userId });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
