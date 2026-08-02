const { verifyToken } = require("../config/jwt");
const { AppError } = require("../utils/response");

function authenticate(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return next(new AppError("Authentication required", 401));
  }

  const token = header.slice(7);

  try {
    req.user = verifyToken(token);
    next();
  } catch (err) {
    return next(new AppError("Invalid or expired token", 401));
  }
}

module.exports = authenticate;