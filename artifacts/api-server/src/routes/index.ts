import { Router, type IRouter } from "express";
import healthRouter from "./health";
import mentorSignupsRouter from "./mentor-signups";

const router: IRouter = Router();

router.use(healthRouter);
router.use(mentorSignupsRouter);

export default router;
