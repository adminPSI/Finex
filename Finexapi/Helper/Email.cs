using System.Net;
using System.Net.Mail;
namespace FinexAPI.Helper
{
    public interface IEmail 
    {
        bool Send(MailMessage mailMesage);
    }
    public class Email : IEmail
    {
        private readonly IConfiguration _configuration;
        public Email(IConfiguration configuration)
        {
            _configuration=configuration;
        }
        public bool Send(MailMessage mailMesage)
        {
            try
            {
                mailMesage.IsBodyHtml = true;
                using var smtpClient = new SmtpClient(_configuration["Email:Host"]) { EnableSsl = true, Timeout = 600000 };                
                smtpClient.Port = Convert.ToInt32(_configuration["Email:Port"]);
                smtpClient.Credentials = new NetworkCredential(_configuration["Email:UserName"], _configuration["Email:Password"]);
                smtpClient.Send(mailMesage);
            }
            catch (Exception)
            {
                return false;                
            }
            return true;          

        }
    }
}
