declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DISCORD_OAUTH_ID: string
      DISCORD_OAUTH_SECRET: string
      DISCORD_URI: string
      DISCORD_BOT_TOKEN: string

      COOKIE_SECRET: string
      APP_PORT: number
      
      REDIS_HOST: string
      REDIS_PORT: string
      
      APP_ENV: string

      YOUTUBE_API_KEY: string
    }
  }
}

export {}