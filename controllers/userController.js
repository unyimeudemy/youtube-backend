import { createError } from "../error.js";
import User from "../models/User.js";
import Videos from "../models/Videos.js";

//UPDATE USER
export const updateUser = async (req, res, next) => {
  if (req.params.ID === req.user.id) {
    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.params.ID,
        {
          $set: req.body,
        },
        { new: true }
      );
      res.status(200).json(updatedUser);
    } catch (err) {
      next(err);
    }
  } else {
    return next(createError(403, "you can only update your account"));
  }
};

//DELETE USER
export const deleteUser = async (req, res, next) => {
  if (req.params.ID === req.user.id) {
    try {
      await User.findByIdAndDelete(req.params.ID);
      res.status(200).json("user has been deleted");
    } catch (err) {
      next(err);
    }
  } else {
    return next(createError(403, "you can only delete in your account"));
  }
};

//GET A USER
export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById({ _id: req.params.ID }).select(
      "-password"
    );
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

//SUBSCRIBE TO A CHANNEL
export const subscribe = async (req, res, next) => {
  if (!req.user.id) return next(createError(403, "you are not signed in"));
  try {
    await User.findByIdAndUpdate(req.user.id, {
      $push: { subscribedChannels: req.params.ID },
    });

    // const channelSubscribers = await User.findById(req.params.ID).updateOne({
    await User.findByIdAndUpdate(
      req.params.ID,
      {
        $inc: { subcribers: 1 },
      },
      { new: true }
    );

    const user = await User.findById(req.user.id);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

//UNSUBSCRIBE FROM A CHANNEL
export const unsubscribe = async (req, res, next) => {
  if (!req.user.id) return next(createError(403, "you are not signed in"));
  try {
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { subscribedChannels: req.params.ID },
    });

    await User.findByIdAndUpdate(req.params.ID, {
      $inc: { subcribers: -1 },
    });

    const user = await User.findById(req.user.id);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

//LIKE A VIDEO
export const like = async (req, res, next) => {
  const accountOwnerID = req.user.id;
  const videoID = req.params.videoID;

  try {
    await Videos.findByIdAndUpdate(videoID, {
      $addToSet: { likes: accountOwnerID },
      $pull: { dislikes: accountOwnerID },
    });
    res.status(200).json("the video has been liked");
  } catch (err) {
    next(err);
  }
};

//DISLIKE A VIDEO
export const dislike = async (req, res, next) => {
  const accountOwnerID = req.user.id;
  const videoID = req.params.videoID;

  try {
    await Videos.findByIdAndUpdate(videoID, {
      $addToSet: { dislikes: accountOwnerID },
      $pull: { likes: accountOwnerID },
    });
    res.status(200).json("the video has been disliked");
  } catch (err) {
    next(err);
  }
};
