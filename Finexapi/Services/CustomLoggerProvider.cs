namespace FinexAPI.Services
{
    public class CustomLoggerProvider : ILoggerProvider
    {
        public LogLevel LogLevel { get; }
        public string LogFilePath { get; }

        public CustomLoggerProvider(LogLevel level, string logFilePath)
        {
            LogLevel = level;
            LogFilePath = logFilePath;
        }

        public ILogger CreateLogger(string categoryName)
        {
            return new CustomLogger(categoryName, this);
        }
        public void Dispose() { }
    }
}
