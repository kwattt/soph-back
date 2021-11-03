import { youtube as yt } from 'googleapis/build/src/apis/youtube';

const youtube = yt({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY
})

export default youtube