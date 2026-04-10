using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Text;

namespace FinexAPI.Services
{
    internal sealed class FinexAppExceptionHandler : IExceptionHandler
    {
        private readonly ILogger<FinexAppExceptionHandler> _logger;
        private readonly IConfiguration _configuration;

        public FinexAppExceptionHandler(ILogger<FinexAppExceptionHandler> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
        }

        public async ValueTask<bool> TryHandleAsync(HttpContext context, Exception exception, CancellationToken cancellationToken)
        {
            _logger.LogError("Exception occured:{Message}", exception.Message);
            
            //LogExceptionToFile(exception, context);
            var problemDeatails = new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "An unexpected error occured"
            };
            context.Response.StatusCode = problemDeatails.Status.Value;
            await context.Response.WriteAsJsonAsync(problemDeatails, cancellationToken);
            return true;
        }
    }
}
