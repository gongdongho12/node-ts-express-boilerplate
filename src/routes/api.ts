import { Router } from "express";
import { getBrowser, puppeteerBodyParser } from 'utils/puppeteerUtils';

const router = Router();

router.post("/", async (req, res) => {
	const requestBodyList: IPuppeteerBody[] = req?.body;
	const promiseList: Promise<any>[] = requestBodyList.map((requestBody) => puppeteerBodyParser(requestBody))
	// const assignData: Array<{ [key: string]: string }> = []
	// const result: Array<{ [key: string]: string }> = await (promiseList.reduce((promise: Promise<any>, next: Promise<any>) => {
	// 	return promise.then((data: any) => {
	// 		assignData.push(Object.fromEntries(data))
	// 		return next
	// 	})
	// }, promiseList?.[0])
	// 	.then(() => assignData))
	const result: Array<{ [key: string]: string }> = await Promise.all(promiseList)
		.then((assignMap) => assignMap.map((result) => Object.fromEntries(result)));
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
