require('dotenv').config();
import express from "express";
import cors from 'cors';
import redisSession from "./middleware/session";
import rest from './routes'

const corsapp = cors();

const app = express();
app.use(corsapp);
app.use(redisSession)
app.use(rest)

app.get('/', (req, res) => {
  res.send('Hola!')
})

app.listen(process.env.APP_PORT, () => {console.log('listening on port ' + process.env.APP_PORT);});