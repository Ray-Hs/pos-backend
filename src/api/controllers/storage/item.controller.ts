import { Request, Response } from "express";
import { MenuItemServices } from "../../../domain/item/item.services";
import { MenuItemControllerInterface } from "../../../domain/item/item.types";
import { OK_STATUS } from "../../../infrastructure/utils/constants";

export class MenuItemController implements MenuItemControllerInterface {
  async getItems(req: Request, res: Response) {
    const menuItemService = new MenuItemServices();
    const items = await menuItemService.getItems();

    return res.status(items.success ? OK_STATUS : items.error?.code || 500);
  }

  async getItemById(req: Request, res: Response) {
    const id = parseInt(req.params?.id, 10);
    const menuItemService = new MenuItemServices();
    const item = await menuItemService.getItemById(id);

    return res.status(item.success ? OK_STATUS : item.error?.code || 500);
  }

  async createItem(req: Request, res: Response) {
    const data = req.body;
    const menuItemService = new MenuItemServices();
    const item = await menuItemService.createItem(data);

    return res.status(item.success ? OK_STATUS : item.error?.code || 500);
  }

  async updateItem(req: Request, res: Response) {
    const id = parseInt(req.params?.id, 10);
    const data = req.body;

    const menuItemService = new MenuItemServices();
    const item = await menuItemService.updateItem(id, data);

    return res.status(item.success ? OK_STATUS : item.error?.code || 500);
  }

  async deleteItem(req: Request, res: Response) {
    const id = parseInt(req.params?.id, 10);

    const menuItemService = new MenuItemServices();
    const item = await menuItemService.deleteItem(id);

    return res.status(item.success ? OK_STATUS : item.error?.code || 500);
  }
}
