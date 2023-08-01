import express from "express";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../models/User.js";
import { createError } from "../error.js";
import jwt from "jsonwebtoken";

//SIGN UP
export const signup = async (req, res, next) => {
  try {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);
    const newUser = new User({ ...req.body, password: hash });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.cookie("accessToken", token, {
      httpOnly: true,
    });

    res.status(200).json({
      status: "success",
      token: token,
      data: newUser,
    });
  } catch (err) {
    next(err);
  }
};

//SIGN IN
export const signin = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return next(createError(404, "account does not exist"));
    const hash = user.password;

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    const passwordCompare = await bcrypt
      .compare(req.body.password, hash)
      .then((res) => {
        return res;
      });

    if (user && passwordCompare === true) {
      const { password, ...others } = user._doc;

      //   res
      //   .cookie("accessToken", token, {
      //     httpOnly: true,
      //   })

      res.cookie("accessToken", token, {
        httpOnly: true,
      });

      res.status(200).json({
        status: "successful",
        token: token,
        data: others,
      });
    } else {
      return next(createError(401, "email or password not correct"));
    }
  } catch (err) {
    next(err);
  }
};

export const googleAuth = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      });
      window.localStorage.setItem("googleToken", token);

      //   const verifyToken = jwt.verify(
      //     token,
      //     process.env.JWT_SECRET,
      //     (err, user) => {
      //       if (err) return next(createError(403, "token is not valid"));
      //     }
      //   );

      const cookieOptions = {
        expires: new Date(
          Date.now() + process.env.JWT_COOKIES_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        // httpOnly: true,
      };

      res.cookie("accessToken", token, cookieOptions);
      //////////////////////////////////////////////////////////////

      res.status(200).json({
        status: "success",
        token,
        data: user._doc,
      });
      // .json(user._doc);
    } else {
      const newUser = new User({ ...req.body, fromGoogle: true });
      const savedUser = await newUser.save();
      const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      });

      ////////////////////////////////////////////////////
      cookieOptions = {
        expires: new Date(
          Date.now() + process.env.JWT_COOKIES_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
      };

      res.cookie("accessToken", token, cookieOptions);
      //////////////////////////////////////////////////////

      res.status(200).json({
        status: "successful",
        token: token,
        data: savedUser._doc,
      });
      // .json(savedUser._doc);
    }
  } catch (err) {
    next(err.response);
  }
};

/////////////////////////////////////////////////////

// //logout user
// app.get("/api/logout", auth, function (req, res) {
//   req.user.deleteToken(req.token, (err, user) => {
//     if (err) return res.status(400).send(err);
//     res.sendStatus(200);
//   });
// });

// //delete token

// userSchema.methods.deleteToken = function (token, cb) {
//   var user = this;

//   user.update({ $unset: { token: 1 } }, function (err, user) {
//     if (err) return cb(err);
//     cb(null, user);
//   });
// };
