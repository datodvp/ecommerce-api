const router = require('express').Router();
const User = require('../models/User');
const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');

// REGISTER
router.post('/register', async (req, res) => {
  const newUser = new User({
    username: req.body.username,
    password: CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASSWORD_SECRET
    ).toString(),
  });

  try {
    const savedUser = await newUser.save();

    const { password, ...others } = savedUser._doc;

    res.status(201).json(others);
  } catch (err) {
    res.status(500).json(err);
  }
});

// LOGIN

router.post('/login', async (req, res) => {
  const user = await User.findOne({ username: req.body.username });

  !user && res.status(401).json('Wrong Credentials!');

  const DBpassword = CryptoJS.AES.decrypt(
    user.password,
    process.env.PASSWORD_SECRET
  ).toString(CryptoJS.enc.Utf8);

  DBpassword !== req.body.password &&
    res.status(401).json('Wrong Credentials!');

  const accessToken = jwt.sign(
    {
      id: user._id,
      isAdmin: user.isAdmin,
    },
    process.env.JWT_SECRET,
    { expiresIn: '3d' }
  );

  const { password, ...others } = user._doc;

  res.status(200).json({ ...others, accessToken });
});

module.exports = router;
