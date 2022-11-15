type LogLevel = "INFO" | "WARN" | "ERROR";

type LogFn = (message: string) => void;

type Logger = { [logFn: string]: LogFn };

const log = (logLevel: LogLevel, message: string) => {
  console.log(`${logLevel}: ${message}`);
};

const logger: Logger = {
  info: message => log("INFO", message),
  warn: message => log("WARN", message),
  error: message => log("ERROR", message),
};

export default logger;
