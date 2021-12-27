import TwitchApi from 'node-twitch'

const twitch = new TwitchApi({
  client_id: String(process.env.TWITCH_ID),
  client_secret: String(process.env.TWITCH_SECRET)
})

export default twitch
