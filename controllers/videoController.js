import { createError } from "../error.js";
import User from "../models/User.js";
import Video from "../models/Videos.js";

//UPLOAD A VIDEO
export const addVideo = async (req, res, next) => {
  const newVideo = new Video({ ...req.body, userID: req.user.id });
  try {
    const savedComment = await newVideo.save();
    res.status(200).send(savedComment);
  } catch (err) {
    next(err);
  }
};

//UPDATE A VIDEO
export const updateVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.ID, { userID: 1 });
    if (!video) return next(createError(404, "video not found"));
    if (video.userID === req.user.id) {
      const updatedVideo = await Video.findByIdAndUpdate(
        req.params.ID,
        {
          $set: req.body,
        },
        { new: true }
      );
      res.status(200).json(updatedVideo);
    } else {
      next(createError(403, "you can only update videos in your account"));
    }
  } catch (err) {
    next(err);
  }
};

//DELETE A VIDEO
export const deleteVideo = async (req, res, next) => {
  const newVideo = new Video({ userID: req.user.id, ...req.body });
  try {
    const video = await Video.findById(req.params.ID, { userID: 1 });
    if (!video) return next(createError(404, "video not found"));
    if (video.userID === req.user.id) {
      await Video.findByIdAndDelete(req.params.ID);
      res.status(200).json("video deleted");
    }
  } catch (err) {
    next(err);
  }
};

//GET A PARTICULAR VIDEO
export const getVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.ID);
    res.status(200).json(video);
  } catch (err) {
    next(err);
  }
};

//INCREASES NUMBER OF VIEWS
export const addView = async (req, res, next) => {
  try {
    const video = await Video.findByIdAndUpdate(req.params.ID, {
      $inc: { views: 1 },
    });
    res.status(200).json("view has been increased");
  } catch (err) {
    next(err);
  }
};

// RETURN RANDOM VIDEOS
export const random = async (req, res, next) => {
  try {
    const video = await Video.aggregate([{ $sample: { size: 40 } }]);
    res.status(200).json(video);
  } catch (err) {
    next(err);
  }
};

// RETURN TRENDING OR MOST VIEWED VIDEOS
export const trend = async (req, res, next) => {
  try {
    const videos = await Video.find().sort({ views: -1 });
    res.status(200).json(videos);
  } catch (err) {
    next(err);
  }
};

// RETURNS ALL THE CHANNELS THAT THE USER HAS SUBSCRIBED TO
export const sub = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const subscribedChannels = user.subscribedChannels;

    const list = await Promise.all(
      subscribedChannels?.map((channelID) => {
        return Video.find({ userID: channelID });
      })
    );

    res
      .status(200)
      .json(list.flat())
      .sort((a, b) => b.createdAt - a.createdAt);
  } catch (err) {
    next(err);
  }
};

export const getByTags = async (req, res, next) => {
  const userSearch = req.query.tags.split(",");
  try {
    const videos = await Video.find({ tags: { $in: userSearch } }).limit(20);
    res.status(200).json(videos);
  } catch (err) {
    next(err);
  }
};

export const search = async (req, res, next) => {
  const query = req.query.q;
  try {
    const videos = await Video.find({
      title: { $regex: query, $options: "i" },
    });
    res.status(200).json(videos);
  } catch (err) {
    next(err);
  }
};
