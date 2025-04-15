import { Request, Response } from "express";
import { SectionServices } from "../../../domain/section/section.services";
import { SectionControllerInterface } from "../../../domain/section/section.types";
import {
  CREATED_STATUS,
  OK_STATUS,
} from "../../../infrastructure/utils/constants";

export class SectionController implements SectionControllerInterface {
  async getSection(req: Request, res: Response) {
    const sectionInstance = new SectionServices();
    const response = await sectionInstance.getSections();

    return res.status(
      response.success ? OK_STATUS : response.error?.code || 500
    );
  }

  async getSectionById(req: Request, res: Response) {
    const id = req.params?.id;
    const sectionInstance = new SectionServices();
    const response = await sectionInstance.getSectionById(id);

    return res.status(
      response.success ? OK_STATUS : response.error?.code || 500
    );
  }

  async createSection(req: Request, res: Response) {
    const data = req.body;
    const sectionInstance = new SectionServices();
    const response = await sectionInstance.createSection(data);

    return res.status(
      response.success ? CREATED_STATUS : response.error?.code || 500
    );
  }

  async updateSection(req: Request, res: Response) {
    const id = req.params?.id;
    const data = req.body;
    const sectionInstance = new SectionServices();
    const response = await sectionInstance.updateSection(id, data);

    return res.status(
      response.success ? OK_STATUS : response.error?.code || 500
    );
  }

  async deleteSection(req: Request, res: Response) {
    const id = req.params?.id;
    const sectionInstance = new SectionServices();
    const response = await sectionInstance.deleteSection(id);

    return res.status(
      response.success ? OK_STATUS : response.error?.code || 500
    );
  }
}
