import { Router, type IRouter } from "express";
import healthRouter from "./health";
import marketRouter from "./market";
import portfolioRouter from "./portfolio";
import tradingRouter from "./trading";
import swapRouter from "./swap";
import bridgeRouter from "./bridge";
import walletguardRouter from "./walletguard";
import airdropsRouter from "./airdrops";
import rewardsRouter from "./rewards";
import nftsRouter from "./nfts";
import transactionsRouter from "./transactions";
import walletRouter from "./wallet";
import profileRouter from "./profile";
import notificationsRouter from "./notifications";
import adminRouter from "./admin";
import telegramRouter from "./telegram";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/market", marketRouter);
router.use("/portfolio", portfolioRouter);
router.use("/trading", tradingRouter);
router.use("/swap", swapRouter);
router.use("/bridge", bridgeRouter);
router.use("/walletguard", walletguardRouter);
router.use("/airdrops", airdropsRouter);
router.use("/rewards", rewardsRouter);
router.use("/nfts", nftsRouter);
router.use("/transactions", transactionsRouter);
router.use("/wallet", walletRouter);
router.use("/profile", profileRouter);
router.use("/notifications", notificationsRouter);
router.use("/admin", adminRouter);
router.use("/telegram", telegramRouter);

export default router;
