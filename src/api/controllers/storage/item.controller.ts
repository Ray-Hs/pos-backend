import { Request, Response } from "express";
import { MenuItemServices } from "../../../domain/item/item.services";
import { MenuItemControllerInterface } from "../../../domain/item/item.types";
import {
  CREATED_STATUS,
  OK_STATUS,
} from "../../../infrastructure/utils/constants";
import { Filter, FilterBy, Language } from "../../../types/common";

export class MenuItemController implements MenuItemControllerInterface {
  async getItems(req: Request, res: Response) {
    const subcategoryId = parseInt(req.query?.subcategoryId as string, 10);
    const sort = req.query?.sort as Filter;
    const sortby = req.query?.sortby as FilterBy;
    const language = req.query?.lang as Language;
    const q = req.query?.q as string;
    const menuItemService = new MenuItemServices();
    const items = await menuItemService.getItems(
      q,
      subcategoryId,
      sort,
      sortby,
      language
    );

    return res
      .status(items.success ? OK_STATUS : items.error?.code || 500)
      .json(items);
  }
  async getItemsByCategory(req: Request, res: Response) {
    const categoryId = parseInt(req.params?.id as string, 10);
    const subcategoryId = parseInt(req.query?.subcategoryId as string, 10);
    const sort = req.query?.sort as Filter;
    const sortby = req.query?.sortby as FilterBy;
    const language = req.query?.lang as Language;
    const q = req.query?.q as string;
    const menuItemService = new MenuItemServices();
    const items = await menuItemService.getItemsByCategory(
      categoryId,
      q,
      subcategoryId,
      sort,
      sortby,
      language
    );

    return res
      .status(items.success ? OK_STATUS : items.error?.code || 500)
      .json(items);
  }

  async getItemById(req: Request, res: Response) {
    const id = parseInt(req.params?.id, 10);
    const menuItemService = new MenuItemServices();
    const item = await menuItemService.getItemById(id);

    return res
      .status(item.success ? OK_STATUS : item.error?.code || 500)
      .json(item);
  }

  async createItem(req: Request, res: Response) {
    const data = req.body;
    const menuItemService = new MenuItemServices();
    const item = await menuItemService.createItem(data);

    return res
      .status(item.success ? CREATED_STATUS : item.error?.code || 500)
      .json(item);
  }

  async updateItem(req: Request, res: Response) {
    const id = parseInt(req.params?.id, 10);
    const data = req.body;

    const menuItemService = new MenuItemServices();
    const item = await menuItemService.updateItem(id, data);

    return res
      .status(item.success ? OK_STATUS : item.error?.code || 500)
      .json(item);
  }

  async deleteItem(req: Request, res: Response) {
    const id = parseInt(req.params?.id, 10);

    const menuItemService = new MenuItemServices();
    const item = await menuItemService.deleteItem(id);

    return res
      .status(item.success ? OK_STATUS : item.error?.code || 500)
      .json(item);
  }
}
