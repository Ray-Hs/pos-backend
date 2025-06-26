import { Request, Response } from "express";
import { ExchangeRateServices } from "../../../domain/exchange/exchange.services";
import { ExchangeRateControllerInterface } from "../../../domain/exchange/exchange.types";
import { OK_STATUS } from "../../../infrastructure/utils/constants";
import { decodeJWT } from "../../../infrastructure/utils/decodeJWT";

export class ExchangeRateController implements ExchangeRateControllerInterface {
  async createExchangeRate(req: Request, res: Response) {
    const body = req.body;
    const user = decodeJWT(req, res);
    const exchangeInstance = new ExchangeRateServices();
    const response = await exchangeInstance.createExchangeRate({
      ...body,
      exchangeDate: new Date(body.exchangeDate),
      userId: user?.id,
    });

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }

  async getExchangeRates(req: Request, res: Response) {
    const exchangeInstance = new ExchangeRateServices();
    const response = await exchangeInstance.getExchangeRates();

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }

  async getLatestExchangeRate(req: Request, res: Response) {
    const exchangeInstance = new ExchangeRateServices();
    const response = await exchangeInstance.getLatestExchangeRate();

    return res
      .status(response.success ? OK_STATUS : response.error?.code || 500)
      .json(response);
  }
}
