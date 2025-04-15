import { Request, Response } from "express";
import { Section, TResult } from "../../types/common";

export interface SectionServiceInterface {
  getSections: () => Promise<TResult<Section[]>>;
  getSectionById: (requestId: any) => Promise<TResult<Section>>;
  createSection: (requestData: any) => Promise<TResult<Section>>;
  updateSection: (
    requestId: any,
    requestData: any
  ) => Promise<TResult<Section>>;
  deleteSection: (requestId: any) => Promise<TResult<Section>>;
}

export interface SectionControllerInterface {
  getSection: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<Section[]>>>;
  getSectionById: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<Section>>>;
  createSection: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<Section>>>;
  updateSection: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<Section>>>;
  deleteSection: (
    req: Request,
    res: Response
  ) => Promise<Response<TResult<Section>>>;
}
