using FinexAPI.Models.Email;
using FinexAPI.Models.IHPOs;

namespace FinexAPI.Utility
{
    public interface IEmailNotification
    {
        public Task<string> SendEmail(int fromId, int sendTo, string subject, string body, string attachment, string cc, int messageId);
        public Task<string> EmailSendInsights(string emailHost, string emailTo, string toDisplayName, string emailFrom, string subject, string body, string cc, string attachment, long messageId, string fromDisplayName, bool testMessage = false, bool msgBCC = false);
        public Task<string> CreateEmailMessage(Message message);
        public Task<string> SendMailToDHForApproval(IHPO iHPO, int fromId, int orgAccountId);
        public Task<string> SendMailToFiscalForApproval(IHPO iHPO, int fromId, int orgAccountId);
        public Task<string> SendMailToSuperintendentForApproval(IHPO iHPO, int fromId, int orgAccountid);
        public Task<string> SendMailToUser(IHPO iHPO, int fromId);
        public Task<string> SendRejectedMail(IHPO iHPO, int fromId, string comment);
    }
}
