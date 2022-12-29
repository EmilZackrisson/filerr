import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.get('/', (req: Request, res: Response) => {
  res.send('Filerr Notification API');
});

app.get('/notify/new', (req: Request, res: Response) => {
    const json = req.body;
    console.log(json);
    res.send(JSON.stringify(json));
  });

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});