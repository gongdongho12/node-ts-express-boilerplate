import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
	res.send("Sample API");
});

export default router;
