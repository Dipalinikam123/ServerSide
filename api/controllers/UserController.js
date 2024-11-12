const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY;

module.exports = {
  register: async function (req, res) {
    try {
      console.log(req.body);
      const { firstName, lastName, email, password, gender } = req.body;

      if (!firstName || !lastName || !email || !password || !gender) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email is already in use.' });
      }

      const hash = await bcrypt.hash(password, 10);

      const token = jwt.sign({ email: email }, secretKey);
      const newUser = await User.create({
        firstName,
        lastName,
        email,
        password: hash,
        gender,
        token
      }).fetch();
      await User.updateOne({ id: newUser.id }).set({ token });

      return res.status(201).json({ success: true, message: 'User registered successfully.', newUser });

    } catch (error) {
      console.error('Registration Error:', error);
      return res.status(500).json({ success: false, message: 'An error occurred during registration. Please try again later.' });
    }
  },
  login: async function (req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ success: false });
      }

      const user = await User.findOne({ email: email });
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      const isAuth = bcrypt.compareSync(password, user.password);
      if (!isAuth) {
        return res.status(401).json({ message: 'Incorrect password' });
      }
      console.log('-------ssss', secretKey)
      const token = jwt.sign({ email: user.email, _id: user.id }, secretKey);
      user.token = token;
      await User.updateOne({ id: user.id }).set({ token });

      return res.status(200).json({
        success: true,
        message: 'User logged in successfully.',
        user
      });
    } catch (error) {
      console.error('Login Error:', error);
      return res.status(500).json({ success: false, message: 'An error occurred during login. Please try again later.' });
    }
  },
  userProfile: async function (req, res) {
    const userId = req.user.id;
    console.log('------req.user', userId);

    try {
      const user = await User.findOne({ id: userId });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.status(200).json({ success: true, user });
    } catch (error) {
      console.error('Failed to retrieve user profile:', error);
      return res.status(500).json({ message: 'Failed to get user profile', error });
    }
  },

};
