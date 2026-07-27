const { ApiError } = require('../utils/response');

function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const details = result.error.issues.map((i) => ({
        field: i.path.join('.'),
        message: i.message
      }));
      return next(new ApiError(422, 'Validation failed', details));
    }
    req.body = result.data;
    next();
  };
}

module.exports = validate;
