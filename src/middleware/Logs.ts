import winston from "winston"

const logger = winston.createLogger({
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    new winston.transports.File({
      filename: "./logs/everything.log",
    }),
    new winston.transports.File({
      level: "error",
      filename: "./logs/errors.log",
    }),
  ],
})

if (process.env.APP_ENV !== "PRODUCTION") {
  const consoleLogFormat = winston.format.printf((info) => {
    return `${new Date().toISOString()} [${info.level}] ${info.message}`;
  })

  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), consoleLogFormat),
    })
  )
}

export default logger