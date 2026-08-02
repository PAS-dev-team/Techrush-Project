function success(res, data, message = "OK", status = 200) {
  return res.status(status).json({ success: true, message, data });
}

function failure(res, message = "Error", error = null, status = 500) {
  return res.status(status).json({ success: false, message, error });
}

class AppError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
  }
}

module.exports = { success, failure, AppError };