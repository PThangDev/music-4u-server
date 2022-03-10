const bcrypt = require('bcrypt');
const authModel = require('../models/authModel');
const jwt = require('jsonwebtoken');
const createErrors = require('http-errors');
const cloudinary = require('../config/cloudinary');
class AuthsController {
  //[POST] Login User
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const user = await authModel.findOne({ email });

      if (!user) {
        throw createErrors(404, "Email doesn't not exists");
      }
      const isPassword = await bcrypt.compare(password, user.password);
      if (!isPassword) {
        throw createErrors(400, 'Password is not correct');
      }

      const accessToken = createAccessToken({ _id: user._id, role: user.role });
      delete user.password;

      res.status(200).json({ accessToken, user, message: 'Login is successfully' });
    } catch (error) {
      next(error);
    }
  }
  //[POST] Create User
  async register(req, res, next) {
    try {
      const { username, password, email } = req.body;
      let passwordHash;
      if (password) {
        passwordHash = await bcrypt.hash(password, 10);
      }
      //Check file image avatar
      let result,
        options = {
          overwrite: true,
          unique_filename: true,
          folder: 'musics/Auths',
        };
      let newUserObj = {
        email,
        username,
        password: passwordHash,
      };
      if (req.file) {
        result = await cloudinary.v2.uploader.upload(req.file.path, options);
      }
      if (result) {
        // console.log(result);
        newUserObj = {
          ...newUserObj,
          avatar: {
            public_id: result.public_id,
            secure_url: result.secure_url,
          },
        };
        // newUserObj.avatar.public_id = result.public_id;
        // newUserObj.avatar.secure_url = result.secure_url;
      }
      const newUser = new authModel(newUserObj);
      await newUser.save();
      //Create access_token
      const accessToken = createAccessToken({ _id: newUser._id, role: newUser.role });
      // newUser.delete('password');
      delete newUser._doc.password;

      res
        .status(201)
        .json({ message: 'Register is successfully!', accessToken, user: newUser._doc });
    } catch (error) {
      next(error);
    }
  }
  //[PUT] Update user
  async updateUser(req, res, next) {
    try {
      // const user = req.user;
      let options = {},
        update,
        result;
      if (req.user.avatar.public_id) {
        options = {
          public_id: req.user.avatar.public_id,
          overwrite: true,
          unique_filename: true,
        };
      } else {
        options = {
          overwrite: true,
          unique_filename: true,
          folder: 'musics/Auths',
        };
      }
      if (req.file) {
        result = await cloudinary.v2.uploader.upload(req.file.path, options);
      }
      if (result) {
        update = {
          avatar: {
            public_id: result.public_id,
            secure_url: result.secure_url,
          },
        };
      }
      const userUpdated = await authModel.findByIdAndUpdate(req.user._id, update, { new: true });
      res.status(200).json({ message: 'Update user is successfully!', user: userUpdated });
    } catch (error) {
      next(error);
    }
  }
}

const createAccessToken = (user) => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
};
module.exports = new AuthsController();
