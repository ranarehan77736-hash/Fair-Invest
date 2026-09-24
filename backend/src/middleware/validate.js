const ApiError = require("../utils/ApiError");

function validate(schema, source = "body") {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return next(new ApiError(400, "Validation error", result.error.flatten()));
    }
    req[source] = result.data;
    return next();
  };
}

module.exports = validate;
