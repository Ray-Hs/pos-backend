import { NextFunction, Request, Response } from "express";

export function asyncRouteHandler(fn: Function) {
  return function (req: Request, res: Response, next: NextFunction) {
    return fn(req, res).catch(next); // Catch errors and pass them to the error handler
  };
}
