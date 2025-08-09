import { NextFunction, Request, Response } from "express";

export function asyncRouteHandler(fn: Function) {
  return function (req: Request, res: Response, next: NextFunction) {
    return fn(req, res, next).catch(next); // Catch errors and pass them to the error handler
  };
}

export function asyncMiddlewareHandler(fn: Function) {
  return function (req: Request, res: Response, next: NextFunction) {
    return fn(req, res, next); // Catch errors and pass them to the error handler
  };
}
