import { Hono } from "hono";
import { userRouter } from "./user/router";
import { adminRouter } from "./admin/router";
import { organizationRouter } from "./organization/router";
import { matchRouter } from "./match/router";
import { matchIntentRouter } from "./match_intents/router";
import { notificationRouter } from "./notification/router";
import { levelRouter } from "./level/router";
import { challengeRouter } from "./challenge/router";
import { streakRouter } from "./streak/router";
import { rewardRouter } from "./reward/router";
import { leaderboardRouter } from "./leaderboard/router";
import { cronRouter } from "./cron/router";
import { uploadRouter } from "./upload/router";
import { conversationRouter } from "./conversation/router";
<<<<<<< Updated upstream
import { e2eeRouter } from "./e2ee/router";
=======
import { eventRouter } from "./event/router";
>>>>>>> Stashed changes

export const serverRouter = new Hono();

serverRouter.route("/user", userRouter);
serverRouter.route("/admin", adminRouter);
serverRouter.route("/organization", organizationRouter);
serverRouter.route("/match", matchRouter);
serverRouter.route("/match-intents", matchIntentRouter);
serverRouter.route("/notification", notificationRouter);
serverRouter.route("/level", levelRouter);
serverRouter.route("/challenge", challengeRouter);
serverRouter.route("/streak", streakRouter);
serverRouter.route("/reward", rewardRouter);
serverRouter.route("/leaderboard", leaderboardRouter);
serverRouter.route("/cron", cronRouter);
serverRouter.route("/upload", uploadRouter);
serverRouter.route("/conversation", conversationRouter);
<<<<<<< Updated upstream
serverRouter.route("/e2ee", e2eeRouter);
=======
serverRouter.route("/event", eventRouter);
>>>>>>> Stashed changes
