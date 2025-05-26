// General Server Errors
export const INTERNAL_SERVER_ERR = "INTERNAL_SERVER_ERR";
export const INTERNAL_SERVER_STATUS = 500;

// Not Found
export const NOT_FOUND_ERR = "NOT_FOUND_ERR";
export const NOT_FOUND_STATUS = 404;

// Unauthorized
export const UNAUTHORIZED_ERR = "UNAUTHORIZED_ERR";
export const UNAUTHORIZED_STATUS = 401;

// Forbidden
export const FORBIDDEN_ERR = "FORBIDDEN_ERR";
export const FORBIDDEN_STATUS = 403;

// Bad Request
export const BAD_REQUEST_ERR = "BAD_REQUEST_ERR";
export const BAD_REQUEST_STATUS = 400;

export const BAD_REQUEST_ID_ERR = "INVALID_ID_FORMAT";
export const BAD_REQUEST_BODY_ERR = "INVALID_REQUEST_DATA_FORMAT";
export const BAD_REQUEST_DELETE_ERR = "CANNOT_DELETE_DEPENDENCY_EXISTS";

// Conflict
export const CONFLICT_ERR = "CONFLICT_ERR";
export const CONFLICT_STATUS = 409;

// Created
export const CREATED_SUCCESS = "CREATED_SUCCESS";
export const CREATED_STATUS = 201;

// OK
export const OK_SUCCESS = "OK_SUCCESS";
export const OK_STATUS = 200;

// No Content
export const NO_CONTENT_SUCCESS = "NO_CONTENT_SUCCESS";
export const NO_CONTENT_STATUS = 204;

// Token Errors
export const NO_TOKEN_ERR = "NO_TOKEN_PROVIDED";
export const NO_TOKEN_STATUS = 401;

export const INVALID_TOKEN_ERR = "INVALID_OR_EXPIRED_TOKEN";
export const INVALID_TOKEN_STATUS = 401;

// Rate Limiter
export const RATE_LIMIT_STATUS = 429;
export const RATE_LIMIT_ERR = "TOO_MANY_REQUESTS";
export const RATE_LIMIT = 1000; // Tries
export const RATE_LIMIT_TIME_WINDOW = 10; // Minutes

// JWT
export const JWT_EXPIRE = "1d";

// Invoice
export const INVOICE_NOT_FOUND = "INVOICE_NOT_FOUND";
