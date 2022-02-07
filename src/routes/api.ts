import { Router } from "express";
import puppeteer from "puppeteer-extra";

const router = Router();
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());
import process from 'process';

const CHROMIUM_PATH = process?.env?.CHROMIUM_PATH || undefined
const PUPPETEER_ARGUMENTS = { headless: true, executablePath: CHROMIUM_PATH, args: ['--no-sandbox'] }

router.get("/", async (req, res) => {
	const browser = await puppeteer.launch(PUPPETEER_ARGUMENTS);
	const page = await browser.newPage();
	const response = await page.goto(
		"https://www.coupang.com/np/search?component=&q=%EC%82%BC%EA%B2%B9%EC%82%B4&channel=user",
		{
			waitUntil: "networkidle0",
		}
	);
	console.log(`All done, check the screenshot. ✨`);
	const productList = await page.evaluate(() => {
		return document.querySelector("ul#productList").innerHTML;
	});
	let html = await response.text();
	let headers = await response.headers();
	console.log("html", html);
	console.log("headers", headers);
	res.send(productList);
});

router.get("/reviews", async (req, res) => {
	const browser = await puppeteer.launch(PUPPETEER_ARGUMENTS);
	const page = await browser.newPage();
	await page.goto("https://www.coupang.com/vp/products/83362637", {
		waitUntil: "networkidle0",
	});
	const subURL =
		"https://www.coupang.com/vp/product/reviews?productId=83362637&page=1&size=30&sortBy=DATE_DESC&ratings=&q=&viRoleCode=3&ratingSummary=true";
	const resultBody = await page.evaluate(({ subRequestUrl }) => {
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
    }, { subRequestUrl: subURL }
	);
	res.send(resultBody);
});

export default router;
