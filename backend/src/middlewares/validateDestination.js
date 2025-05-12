// backend/src/middlewares/validateDestination.js
const { body, validationResult } = require('express-validator');

const validateDestination = [
  body('origin').isString().notEmpty(),
  body('month').isString().notEmpty(),
  body('budget').isNumeric().isFloat({ gt: 0 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = validateDestination;
