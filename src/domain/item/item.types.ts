import { Request, Response } from "express";
import {
  Filter,
  FilterBy,
  Language,
  MenuItem,
  TResult,
} from "../../types/common";

export interface MenuItemInterface {
  getItems: (
    subcategoryId?: number,
    sort?: Filter,
    sortby?: FilterBy,
    language?: Language
  ) => Promise<TResult<MenuItem[]>>;
  getItemById: (requestId: any) => Promise<TResult<MenuItem>>;
  searchItems: (q: any) => Promise<TResult<MenuItem[]>>;
  createItem: (requestData: any) => Promise<TResult<MenuItem>>;
  updateItem: (requestId: any, requestData: any) => Promise<TResult<MenuItem>>;
  deleteItem: (requestId: any) => Promise<TResult<MenuItem>>;
}

export interface MenuItemControllerInterface {
  getItems: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<MenuItem[]>>>;
  getItemById: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<MenuItem>>>;
  searchItems: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<MenuItem[]>>>;
  createItem: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<MenuItem>>>;
  updateItem: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<MenuItem>>>;
  deleteItem: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<MenuItem>>>;
}
