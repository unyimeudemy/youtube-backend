import { createError } from "../error.js";
import Comments from "../models/Comments.js";

export const addComment = async (req, res, next) => {
  const newComment = new Comments({ ...req.body, userID: req.user.id });
  try {
    await newComment.save();
    res.status(200).send(newComment);
  } catch (err) {
    next(err);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comments.findById(req.params.ID);
    if (!comment) return next(createError(404, "comment not found"));
    if (comment.userID === req.user.id) {
      await Comments.findByIdAndDelete(req.params.ID);
      res.status(200).json("comment deleted");
    } else {
      next(createError(403, "you can only delete comment in your account"));
    }
  } catch (err) {
    next(err);
  }
};

export const getComments = async (req, res, next) => {
  try {
    const comments = await Comments.find({ videoID: req.params.videoID });
    res.status(200).json(comments);
  } catch (err) {
    next(err);
  }
};
