declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DISCORD_OAUTH_ID: string
      DISCORD_OAUTH_SECRET: string
      DISCORD_URI: string
      COOKIE_SECRET: string
      APP_PORT: number
      
      REDIS_HOST: string
      REDIS_PORT: string
      
      APP_ENV: string
    }
  }
}

export {}