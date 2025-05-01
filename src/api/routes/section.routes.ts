import express, { Router } from "express";
import { asyncRouteHandler } from "../../infrastructure/utils/asyncRouteHandler";
import { isAdmin, isAuthenticated } from "../middlewares/auth.middleware";
import { SectionController } from "../controllers/table/section.controller";

const router: Router = express.Router();
const sectionInstance = new SectionController();

router.get(
  "/",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(sectionInstance.getSection)
);
router.get(
  "/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(sectionInstance.getSectionById)
);
router.post(
  "/",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(isAdmin),
  asyncRouteHandler(sectionInstance.createSection)
);
router.put(
  "/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(isAdmin),
  asyncRouteHandler(sectionInstance.updateSection)
);
router.delete(
  "/:id",
  asyncRouteHandler(isAuthenticated),
  asyncRouteHandler(isAdmin),
  asyncRouteHandler(sectionInstance.deleteSection)
);

export default router;
