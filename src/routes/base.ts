import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
	res.send("Storelink Puppeteer API");
});

export default router;
