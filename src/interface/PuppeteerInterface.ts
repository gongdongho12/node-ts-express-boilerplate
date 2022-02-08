type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

interface IPuppeteerSelector {
  url: string;
  method?: Method;
  body?: any;
  selector?: string;
}

interface IPuppeteerBody extends IPuppeteerSelector {
  children?: Array<IPuppeteerSelector>
}