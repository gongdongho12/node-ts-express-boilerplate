import process from "process";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth"

puppeteer.use(StealthPlugin());

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

export const getBrowser = () => puppeteer.launch(PUPPETEER_ARGUMENTS)

export const puppeteerBodyParser = async (requestData: IPuppeteerBody): Promise<Map<string, string>> => {
  const { url, selector, children = [] } = requestData
  const browser = await getBrowser();
  const page = await browser.newPage().then((page) => page.goto(url, { waitUntil: "networkidle0" }).then(() => page));
  const result: Array<string[]> = []
  const promiseArr: Array<Promise<string>> = []
  if (selector != undefined) {
    const mainPromise: Promise<string> = page.evaluate(({ selector }) => {
      return document.querySelector(selector).innerHTML;
    }, { selector })
    result.push([url])
    promiseArr.push(mainPromise)
  }
  if (children.length > 0) {
    const childPromiseList = children.map(async (child: IPuppeteerSelector) => {
      const { func, ...rest } = child
      /*
        별도로 함수도 지정해서 파라미터를 업데이트 할 수 있도록 func 로직 추가
        url을 공백으로 전달하고 함수를 통해 url 을 업데이트해서 마지막 페이지로 업데이트 할 수 있도록
      */
      if (func != undefined) {
        const newFunc: string = await page.evaluate(({ func }) => {
          return (new Function(func))();
        }, { func })
        if (typeof newFunc == "string") {
          try {
            const resultUpdater = new Function(
							"url, method, body, selector",
							newFunc
						)(rest.url, rest.method, rest.body, rest.selector);
            Object.keys(resultUpdater).forEach(key => {
              // @ts-ignore
              child?.[key] = resultUpdater[key];
            });
          } catch (e: any) {
            console.error("function run err", e)
          }
        }
      }
      const { url, method = "GET", body, selector } = child
      result.push([url])

      const childPromise: Promise<string> = page.evaluate(({ url, method, selector, body }) => {
        try {
          const xmlHttp = new XMLHttpRequest();
          xmlHttp.open(method, url, false);
          if (body != undefined) {
            xmlHttp.send(body)
          } else {
            xmlHttp.send();
          }
          const html = xmlHttp.responseText
          if (selector != undefined) {
						const container = document.implementation.createHTMLDocument().documentElement;
						container.innerHTML = html;
						const parseData = container.querySelector(selector).innerHTML;
            return parseData;
					} else {
						return html;
					}
        } catch (error: any) {
          return error.message
        }
      }, { url, method, selector, body });
      return childPromise
    })
    Array.prototype.push.apply(promiseArr, childPromiseList);
  }

  const assignData = await Promise.all(promiseArr).then((dataList: string[]) => {
    dataList.forEach((data, index) => {
      result[index].push(data)
    })
    return new Map(result as Array<[string, string]>)
  })
  await browser.close();
  return assignData;
}