import { youtube as yt } from 'googleapis/build/src/apis/youtube';

type playlistData = {
  name?: string|null,
  profile_image_url?: string|null,
  playlist_id?: string|null,
}

type videoData = {
  descrip?: string|null,
  thumbnail?: string|null,
  last_id?: string|null,
}

export const youtube = yt({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY
})

export const getChannelData = async (channelId: string) => {
  if(!channelId) return undefined

  const res = await youtube.channels.list({
    id: [channelId],
    part: ['contentDetails,snippet'],
  })

  return res.data.items
}

export const getPlaylist = async (channelId: string) : Promise<playlistData|undefined> => {
  if(!channelId) return undefined
  
  const res = await youtube.channels.list({
    id: [channelId],
    part: ['contentDetails', 'snippet'],
  })

  if(res.data.items){
    const vals = res.data.items[0]
    if(vals.snippet?.thumbnails){
      return {name: vals.snippet.title, profile_image_url: vals.snippet.thumbnails.default?.url, playlist_id: vals.contentDetails?.relatedPlaylists?.uploads}
    } else return {name: vals.snippet?.title, profile_image_url: undefined, playlist_id: vals.contentDetails?.relatedPlaylists?.uploads}
  } 
  return undefined
}

export const getLastVideo = async (playlistId: string) : Promise<videoData|undefined> => {
  if(!playlistId) return undefined

  const res = await youtube.playlistItems.list({
    part: ['snippet', 'contentDetails'],
    maxResults: 1,
    playlistId: playlistId
  })

  if(res.data.items){
    const vals = res.data.items[0]
    if(vals.snippet?.thumbnails){
      if(vals.snippet.thumbnails.high)
        return {descrip: vals.snippet.description, thumbnail: vals.snippet.thumbnails.high.url, last_id: vals.contentDetails?.videoId}
      else 
        return {descrip: vals.snippet.description, thumbnail: vals.snippet.thumbnails.default?.url, last_id: vals.contentDetails?.videoId}
    } else return {descrip: undefined, thumbnail: undefined, last_id: vals.contentDetails?.videoId}
  }
  return undefined
}