import { Router, type IRouter } from "express";
import { db, mentorSignupsTable } from "@workspace/db";
import {
  CreateMentorSignupBody,
  CreateMentorSignupResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/mentor-signups", async (req, res): Promise<void> => {
  const parsed = CreateMentorSignupBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.flatten() }, "Invalid mentor signup");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  if (new Set(parsed.data.helpOptions).size !== parsed.data.helpOptions.length) {
    req.log.warn("Duplicate mentor help options");
    res.status(400).json({ error: "Help options must be unique." });
    return;
  }

  const [signup] = await db
    .insert(mentorSignupsTable)
    .values(parsed.data)
    .returning();

  res.status(201).json(CreateMentorSignupResponse.parse(signup));
});

export default router;