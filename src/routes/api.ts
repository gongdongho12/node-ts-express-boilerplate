import { Router } from "express";
import puppeteer from "puppeteer-extra";

const router = Router();
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());
import process from "process";

const CHROMIUM_PATH = process.env.CHROMIUM_PATH;
const PUPPETEER_ARGUMENTS = {
	headless: true,
	executablePath: CHROMIUM_PATH,
	args: [
		"--no-sandbox",
		"--disable-setuid-sandbox",
		"--disable-dev-shm-usage",
		"--disable-gpu",
		"--no-zygote",
	],
};

router.post("/", (req, res) => {});

router.get("/", async (req, res) => {
	const browser = await puppeteer.launch(PUPPETEER_ARGUMENTS);
	const page = await browser.newPage();
	console.log(req.body);
	await page.goto(
		"https://www.coupang.com/np/search?component=&q=%EC%82%BC%EA%B2%B9%EC%82%B4&channel=user",
		{ waitUntil: "networkidle0" }
	);
	console.log(`All done, check the screenshot. ✨`);
	const productList = await page.evaluate(() => {
		return document.querySelector("ul#productList").innerHTML;
	});
	// let html = await response.text();
	// let headers = await response.headers();
	// console.log("html", html);
	// console.log("headers", headers);
	browser.close();
	res.send(productList);
});

router.get("/reviews", async (req, res) => {
	const browser = await puppeteer.launch(PUPPETEER_ARGUMENTS);
	const page = await browser.newPage();
	const productId: number = 83362637;

	await page.goto(`https://www.coupang.com/vp/products/${productId}`, {
		waitUntil: "networkidle0",
	});
	const reviewPageUrlGenerator = (page: number) => {
		return `https://www.coupang.com/vp/product/reviews?productId=${productId}&page=${page}&size=30&sortBy=DATE_DESC&ratings=&q=&viRoleCode=3&ratingSummary=true`;
	};
	const reviewRequestGenerator = (pageNumber: number) => {
		const resultBody: Promise<string> = page.evaluate(
			({ subRequestUrl }) => {
				console.log("subRequestUrl", subRequestUrl);
				try {
					const xmlHttp = new XMLHttpRequest();
					xmlHttp.open("GET", subRequestUrl, false);
					xmlHttp.send();
					const responseText = xmlHttp.responseText;
					return responseText;
				} catch (error: any) {
					return error.message;
				}
			},
			{ subRequestUrl: reviewPageUrlGenerator(pageNumber) }
		);
		return resultBody;
	};
	const pageNumberList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
	const reviewPagePromiseList = pageNumberList.map(reviewRequestGenerator);
	const resultReviewList: string[] = await Promise.all(reviewPagePromiseList);
	const result = new Map(
		pageNumberList.map((pageNumber, i) => [
			reviewPageUrlGenerator(pageNumber),
			resultReviewList[i],
		])
	);
	browser.close();
	res.send(Object.fromEntries(result));
});

export default router;
