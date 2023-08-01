import jwt from "jsonwebtoken";
import { createError } from "./error.js";

export const verifyToken = (req, res, next) => {
  //CHECKING IF THERE IS TOKEN
  let token;
  if ("accessToken" in req.cookies) {
    token = req.cookies.accessToken;
  } else if ("authorization" in req.headers) {
    token = req.headers.authorization;
  } else if ("Authorization" in req.body.headers) {
    token = req.body.headers.Authorization;
  }

  if (!token) return next(createError(401, "you are not authenticated "));

  //VERIFYING TOKEN
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return next(createError(403, "token is not valid"));
    req.user = user;
    next();
  });
};
