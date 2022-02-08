import { Router } from "express";
import { getBrowser, puppeteerBodyParser } from 'utils/puppeteerUtils';

const router = Router();

router.post("/", async (req, res) => {
	const requestBodyList: IPuppeteerBody[] = req?.body;
	const result: Array<{ [key: string]: string }> = await Promise.all(
		requestBodyList.map((requestBody) => puppeteerBodyParser(requestBody))
	).then((assignMap) => assignMap.map((result) => Object.fromEntries(result)));
	res.send(result);
});

router.get("/", async (req, res) => {
	const browser = await getBrowser();
	const url = "https://www.coupang.com/np/search?component=&q=%EC%82%BC%EA%B2%B9%EC%82%B4&channel=user"
	const page = await browser.newPage().then((page) => page.goto(url, { waitUntil: "networkidle0" }).then(() => page));
	const productList = await page.evaluate(() => {
		return document.querySelector("ul#productList").innerHTML;
	});
	browser.close();
	res.send(productList);
});

export default router;
