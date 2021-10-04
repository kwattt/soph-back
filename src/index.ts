require('dotenv').config();
import express from "express";
import cors from 'cors';
import redisSession from "./middleware/auth/session";
import rest from './routes'
import discord from './middleware/discord'

const corsapp = cors();
const app = express();

app.use(express.json())
app.use(corsapp);
app.use(redisSession)
app.use(discord)
app.use(rest)

app.get('/', (req, res) => {
  res.send('Active!')
})

app.listen(process.env.APP_PORT, () => {console.log('listening on port ' + process.env.APP_PORT);});