using System.Net.Mail;
namespace FinexAPI.Helper
{
    public interface IWorkflowEmail
    {
        bool SendEmail(IHPOWorkflowEmailMetaData ihpoWorkflowMetadata);
    }
    public class WorkflowEmail : IWorkflowEmail
    {
        private readonly IEmail _email;
        private readonly IConfiguration _configuration;
       
        public WorkflowEmail(IEmail email, IConfiguration configuration)
        {
            _email = email;
            _configuration = configuration;
        }

        public bool SendEmail(IHPOWorkflowEmailMetaData ihpoWorkflowMetadata)
        {
            try
            {
                var subject = _configuration["EmailTemplates:Subject"];
                var body = _configuration["EmailTemplates:Body"];
                var from = _configuration["EmailTemplates:From"];
                var mailMessage = new MailMessage();
                mailMessage.Subject = "Action Required";
                mailMessage.Body = "";
                mailMessage.IsBodyHtml = true;
                mailMessage.From = new MailAddress("harish.erra@softforceapps.com");
                mailMessage.To.Add(ihpoWorkflowMetadata.SendTo);

                _email.Send(mailMessage);
            }
            catch (Exception)
            {
                return false;                
            }
            return true;
        }
    }
}
