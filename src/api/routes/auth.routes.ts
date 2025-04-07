import express, { Request, Response, Router } from "express";

const router: Router = express.Router();

async function createAccount(req: Request, res: Response) {
  try {
    res.status(200).json({
      message: "Account created successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error });
  }
}

router.post("/create-account", createAccount);

export default router;
