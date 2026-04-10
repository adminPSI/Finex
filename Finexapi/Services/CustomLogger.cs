namespace FinexAPI.Services
{
    public class CustomLogger : ILogger
    {
        private readonly string _name;
        private readonly CustomLoggerProvider _provider;
        private static readonly object _lock = new object();

        public CustomLogger(string name, CustomLoggerProvider provider)
        {
            _name = name;
            _provider = provider;
        }

        public IDisposable BeginScope<TState>(TState tstate)
        {
            return null;
        }
        public bool IsEnabled(LogLevel logLevel)
        {
            return logLevel >= _provider.LogLevel;
        }

        public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception exception, Func<TState, Exception, string> formatter)
        {
            if (!IsEnabled(logLevel))
            {
                return;
            }
            if (formatter == null)
            {
                throw new ArgumentNullException(nameof(formatter));

            }
            var message = formatter(state, exception);

            if (!string.IsNullOrEmpty(message))
            {
                WriteLog(logLevel, _name, message, exception);
            }
        }

        private void WriteLog(LogLevel logLevel, string name, string message, Exception exception)
        {
            var logRecord = $"{DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss")} [{logLevel}] {name}: {message}";
            if (exception != null)
            {
                logRecord += Environment.NewLine + exception.ToString();
            }
            lock (_lock)
            {
                File.AppendAllText(_provider.LogFilePath, logRecord + Environment.NewLine);
            }
        }
    }
}
