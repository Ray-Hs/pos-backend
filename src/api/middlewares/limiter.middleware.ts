import rateLimit from "express-rate-limit";
import {
  RATE_LIMIT_ERR,
  RATE_LIMIT_STATUS,
} from "../../infrastructure/utils/constants";
const rateLimiter = (maxAttempts: number, timeInMinutes: number) =>
  rateLimit({
    windowMs: timeInMinutes * 60 * 1000,
    max: maxAttempts,
    message: RATE_LIMIT_ERR,
    statusCode: RATE_LIMIT_STATUS, // Set the status code to 429
    handler: (req, res) => {
      res.status(RATE_LIMIT_STATUS).json({
        error: {
          code: RATE_LIMIT_STATUS,
          message: RATE_LIMIT_ERR,
        },
      }); // Send JSON response
    },
  });

export default rateLimiter;
