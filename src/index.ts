import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { corsOptionsWhiteList, morganConfig } from './config/config';
import logger from './config/logger.config';
import { handleError, notFound } from './middleware/errorHandler';
import baseRoutes from './routes';
import process from 'process';

// dotenv config
dotenv.config();

// express app
const app = express();

// Basic middlewares
app.use(morgan(morganConfig));
app.use(helmet());
app.use(cors(corsOptionsWhiteList));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// base routes
app.use('/', baseRoutes);

// Error handler
app.use(notFound);
app.use(handleError);

// connection to server
const port = process.env.PORT;

// app.listen(port, () => {
//     console.info(`Express web server started: ${port}`)
// });

app.listen(Number(port), "0.0.0.0", () => {
    console.info(`Express web server started: http://0.0.0.0:${port}`);
});
