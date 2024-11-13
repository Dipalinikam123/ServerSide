const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const secretKey = process.env.SECRET_KEY;
const forgetPassUrl = process.env.FORGOT_PASS_URL;
const nodeMailer = process.env.NODE_MAILER_EMAIL;
const password = process.env.PASSWORD;
const hostMail = process.env.HOST_MAIL;

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
    // console.log('------req.user', userId);

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
  forgetPassword: async function (req, res) {
    // console.log('----email', req.body);
    try {
      const email = req.body.email;
      const user = await User.findOne({ email: email });

      if (!user) {
        return res.status(404).json({ message: 'User Not Found' });
      }

      const token = jwt.sign({ email: email, _id: user.id }, secretKey, { expiresIn: '1hr' });
      await User.updateOne({ id: user.id }).set({ resetToken: token });

      // console.log('forgetPassUrl------'.forgetPassUrl);

      const link = `${forgetPassUrl}/${user.id}/${token}`;
      // console.log('---link', link);

      var transporter = nodemailer.createTransport({
        secure: true,
        host: hostMail,
        port: 465,
        auth: {
          user: nodeMailer,
          pass: password,
        }
      });

      function sendMail(to, sub, msg) {
        transporter.sendMail({
          to: to,
          subject: sub,
          html: msg
        })
      }
      sendMail(user.email, "Reset Password", link);

      return res.status(200).json({ message: 'Link Send' });
    } catch (error) {
      return res.status(500).json({ message: error });
    }
  },
  verifyResetToken: async (req, res) => {
    const { id, token } = req.params;

    try {
      const user = await User.findOne({ id });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const verified = jwt.verify(token, process.env.SECRET_KEY);

      return res.status(200).json({
        message: 'Token verified successfully',
        email: verified.email,
        id: id,
      });

    } catch (error) {
      console.error("Token verification failed:", error);
      return res.status(400).json({ message: 'Token verification failed' });
    }
  },
  resetPassword: async (req, res) => {
    const { id, token } = req.params;
    const { password, confirmPassword } = req.body;

    try {
      const user = await User.findOne({ id });

      if (!user) {
        return res.status(404).json({ message: 'user not found' });
      }

      const tokenVerify = jwt.verify(token, secretKey);

      if (user.resetToken !== token || !tokenVerify) {
        return res.status(400).json({ message: 'The reset link has expired or is invalid' });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({ message: 'password do not match' });
      }

      const hash = await bcrypt.hash(password, 10);

      await User.updateOne({ id }).set({
        password: hash,
        resetToken: ''
      });
      return res.status(200).json({ message: 'Password Reset Successfully' });
    } catch (error) {
      console.error(error);
      return res.status(400).json({ message: 'Token Verification fail' });
    }

  }

};
