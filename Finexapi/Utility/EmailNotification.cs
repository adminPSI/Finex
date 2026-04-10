using FinexAPI.Data;
using FinexAPI.Models.IHPOs;
using FinexAPI.Models.Email;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;
using Microsoft.AspNetCore.Http.HttpResults;
using System.Net;
using System.Net.Security;
using Newtonsoft.Json;
using System.Text.Unicode;
using FinexAPI.Controllers;

namespace FinexAPI.Utility
{
    public class EmailNotification
    {
        private readonly FinexAppContext _emailContext;
       
        private readonly HttpClient _httpClient;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IConfiguration _configuration;
        protected int OrgAccountId { get; private set; }
        public EmailNotification(FinexAppContext emailContext, 
            HttpClient httpClient, IHttpContextAccessor httpContextAccessor, IConfiguration configuration)
        {
            OrgAccountId = (int)httpContextAccessor.HttpContext.Items["OrgAccountId"]!;
            _emailContext = emailContext;
            _httpClient = httpClient;
            _httpContextAccessor = httpContextAccessor;
            _configuration = configuration;
        }
        public async Task<string> SendEmail(int fromId, int sendTo, string subject, string body, string attachment, string cc, int messageId)
        {
            var fromEmp = await _emailContext.Employees.FindAsync(fromId);
            // Dim FromName As String = objEmployee.GetEmployeeNameFromSecurityID(gConn, FromSecurityID, gEmpID)
            //Dim FromAddress As String = objEmployee.GetEmployeeEmailFromSecurityID(gConn, FromSecurityID, gEmpID)
            var emailHost = "";
            var fromAddress = "";
            var fromName = "";
            var blindCC = cc;
            if (fromEmp != null)
            {
                fromName = fromEmp.lastName + ", " + fromEmp.firstName;
                fromAddress = fromEmp.emailAddress;
            }
            if (fromName == null)
            {
                fromName = "Dennis Mitchell";
                fromAddress = "dennis.mitchell@primarysolutions.net";
            }

            /*        If gQDrive = True Then
                        FromName = "Dennis Mitchell"
                        FromAddress = "dennis.mitchell@primarysolutions.net"
                    End If*/

            /*        If FromAddress = "" Then
                        MsgBox("Please input your email address on the Security Screen", MsgBoxStyle.Information, Application.ProductName)
                        Exit Sub
                    End If*/

            /* To Info */

            string toName = "";
            string toAddress = "";
            if (sendTo == -999)
            {
                toName = "Infall support";
                toAddress = "productsupport@primarysolutions.net";
            }
            else
            {
                var toEmp = await _emailContext.Employees.FindAsync(sendTo);
                if (toEmp != null)
                {
                    toName = toEmp.lastName + ", " + toEmp.firstName;
                    toAddress = toEmp.emailAddress;
                }
            }

            /*        If SendTo = -999 Then
                        ToName = "Infall support"
                        ToAddress = "productsupport@primarysolutions.net"
                        sb.Clear()
                        sb.AppendFormat("Missing attendance for {0}, {1}", FromName, gCSO)
                    Else
                        'If EmpID = 0 And SendTo > 0 Then EmpID = SendTo **** Removed 12/01/2021
                        ToName = objEmployee.GetEmployeeNameFromSecurityID(gConn, SendTo, EmpID)
                        ToAddress = objEmployee.GetEmployeeEmailFromSecurityID(gConn, SendTo, EmpID)
                        If FromName = ToName Then
                            ToName = objEmployee.GetEmployeeNameFromSecurityID(gConn, SendTo, 0)
                            ToAddress = objEmployee.GetEmployeeEmailFromSecurityID(gConn, SendTo, 0)
                        End If
                    End If

                    If ToAddress = "" Then
                        MsgBox("Please input email addresses on the Security Screen", MsgBoxStyle.Information, Application.ProductName)
                        Exit Sub
                    End If

                    If FromName > "" Then Body += " <br>Sent by " & FromName

                    Body += String.Format("{0}{0}{0}*{1}{0}", "<br>", Application.ProductName)
                    Dim path As String = String.Format("{0}\{1}.exe", Application.StartupPath, My.Application.Info.AssemblyName)
                    Body += String.Format("Modified Date and Time: {0}<br>", IO.File.GetLastWriteTime(path))
                    Body += String.Format("{0}Computer Name: {1}<br>", vbCrLf, My.Computer.Name)

                    Application.DoEvents()

                    Try
                        EmailSend(EmailHost, ToAddress, ToName, FromAddress, Subject, Body, CC, MessageID, Attachment, , , BlindCC, FromName)
                    Catch
                        MsgBox("Email notification could not be sent.", MsgBoxStyle.Critical, Application.ProductName)
                    End Try*/
            if (!string.IsNullOrEmpty(fromName))
            {
                body += "<br>Sent by " + fromName;
            }
            body += string.Format("{0}{0}{0}*{1}{0}", "<br>", "Finex");
            /*string path = string.Format(@"{0}\{1}.exe", "Path");
            body += string.Format("Modified Date and Time: {0}<br>", File.GetLastWriteTime(path));*/
            body += string.Format("{0} computer name: {1}<br>", Environment.NewLine, Environment.MachineName);

            var res = await EmailSendInsights(emailHost, toAddress, toName, fromAddress, subject, body, cc, attachment, messageId, fromName);

            return res;
        }

        public async Task<string> EmailSendInsights(string emailHost, string emailTo, string toDisplayName, string emailFrom, string subject, string body, string cc, string attachment, long messageId, string fromDisplayName, bool testMessage = false, bool msgBCC = false)
        {
            Message message = new Message();
            message.MsgFrom = _configuration["EmailTemplates:From"];// "donotreply@ohiodd.net";
            message.MsgTo = emailTo;
            message.MsgSubject = subject;
            message.MsgBody = body;
            message.MsgCC = cc;
            message.WhenReceived = DateTime.Now;
            message.WhenSent = DateTime.Now;
            var res = await CreateEmailMessage(message);
            return res;

        }

        public async Task<string> CreateEmailMessage(Message message)
        {
            if (message == null)
            {
                return "Message in null";
            }
            if (message.Attachments != null && message.Attachments.Count > 0)
            {
                message.WhenSent = DateTime.Now;
            }
            _emailContext.messages.Add(message);
            await _emailContext.SaveChangesAsync();

            if (message.Attachments != null && message.Attachments.Count > 0)
            {
                foreach (var attachment in message.Attachments)
                {
                    attachment.MessageID = message.MessageID;
                    _emailContext.messageAttachments.Add(attachment);
                    await _emailContext.SaveChangesAsync();
                }
            }
            return "Message stored";
        }

        public async Task<string> SendApprovalMail(IHPO iHPO, int fromId, int orgAccountId, string role)
        {
            List<int> users = await GetUsersByRole(role);
            if (users.Any())
            {
                foreach (int user in users)
                {
                    var ihpoDetails = await _emailContext.IHPODetails.Where(x => x.reqID == iHPO.ID).FirstOrDefaultAsync();
                    if (ihpoDetails != null)
                    {
                        var vendor = await _emailContext.Vendors.Where(x => x.Id == ihpoDetails.reqVendor).Select(x => x.name).FirstOrDefaultAsync();
                        string Body = "IHPO " + iHPO.reqNumber + " created on " + iHPO.reqDate + " for " + vendor + " is pending " + role + " approval.";
                        string Subject = "IHPO " + iHPO.reqNumber + " is pending approval.";
                        await SendEmail(fromId, user, Subject, Body, "", "", -1);
                    }
                }
            }
            return "";
        }
        /*        public async Task<string> SendMailToDHForApproval(IHPO iHPO, int fromId, int orgAccountId)
                {
                    List<int> users = await GetUsersByRole("Department Head");
                    if (users.Any())
                    {
                        foreach (int user in users)
                        {
                            var ihpoDetails = await _iHPOContext.IHPODetails.Where(x => x.reqID == iHPO.ID).FirstOrDefaultAsync();
                            if (ihpoDetails != null)
                            {
                                var vendor = await _vendorContext.Vendors.Where(x => x.Id == ihpoDetails.reqVendor).Select(x => x.name).FirstOrDefaultAsync();
                                string Body = "IHPO " + iHPO.reqNumber + " created on " + iHPO.reqDate + " for " + vendor + " is pending Department Head approval.";
                                string Subject = "IHPO " + iHPO.reqNumber + " is pending approval.";
                                await SendEmail(fromId, user, Subject, Body, "", "", -1);
                            }
                        }
                    }
                    return "";
                }
                public async Task<string> SendMailToFiscalForApproval(IHPO iHPO, int fromId, int orgAccountId)
                {
                    List<int> users = await GetUsersByRole("FiscalOffice");
                    if (users.Any())
                    {
                        foreach (var user in users)
                        {
                            var ihpoDetails = await _iHPOContext.IHPODetails.Where(x => x.reqID == iHPO.ID).FirstOrDefaultAsync();
                            if (ihpoDetails != null)
                            {
                                var vendor = await _vendorContext.Vendors.Where(x => x.Id == ihpoDetails.reqVendor).Select(x => x.name).FirstOrDefaultAsync();
                                string Body = "IHPO " + iHPO.reqNumber + " created on " + iHPO.reqDate + " for " + vendor + " is pending Fiscal approval.";
                                string Subject = "IHPO " + iHPO.reqNumber + " is pending approval.";
                                await SendEmail(fromId, user, Subject, Body, "", "", -1);
                            }
                        }
                    }
                    return "";
                }

                public async Task<string> SendMailToSuperintendentForApproval(IHPO iHPO, int fromId, int orgAccountid)
                {
                    List<int> users = await GetUsersByRole("Supervisor");
                    foreach (var user in users)
                    {

                        var ihpoDetails = await _iHPOContext.IHPODetails.Where(x => x.reqID == iHPO.ID).FirstOrDefaultAsync();
                        if (ihpoDetails != null)
                        {
                            var vendor = await _vendorContext.Vendors.Where(x => x.Id == ihpoDetails.reqVendor).Select(x => x.name).FirstOrDefaultAsync();
                            string Body = "IHPO " + iHPO.reqNumber + " created on " + iHPO.reqDate + " for " + vendor + " is pending Superintendent approval.";
                            string Subject = "IHPO " + iHPO.reqNumber + " is pending approval.";
                            await SendEmail(fromId, user, Subject, Body, "", "", -1);
                        }
                    }
                    return "";
                }*/
        public async Task<string> SendMailToUser(IHPO iHPO, int fromId)
        {
            var ihpo = await _emailContext.IHPO.Include(x => x.IHPODetails).Where(x => x.ID == iHPO.ID).FirstOrDefaultAsync();
            if (ihpo != null)
            {
                var emp = await _emailContext.Employees.Where(x => x.userName == ihpo.createdBy 
                && x.OrgAccountId ==OrgAccountId
                ).FirstOrDefaultAsync();
                if (emp != null)
                {
                    var vendor = await _emailContext.Vendors.Where(x => x.Id == ihpo.IHPODetails.reqVendor).Select(x => x.name).FirstOrDefaultAsync();
                    string Body = "IHPO Number " + iHPO.reqNumber + " for " + vendor + " has been approved at " + DateTime.Now;
                    string Subject = "IHPO Number " + iHPO.reqNumber;
                    await SendEmail(fromId, emp.id, Subject, Body, "", "", -1);
                }
            }
            return "";
        }
        public async Task<string> SendRejectedMail(IHPO iHPO, int fromId, string comment)
        {
            var ihpoDetails = await _emailContext.IHPODetails.Where(x => x.reqID == iHPO.ID).FirstOrDefaultAsync();
            if (ihpoDetails != null)
            {
                var lastApprove = await _emailContext.IHPOApproval.Where(x => x.reqID == iHPO.ID).OrderByDescending(x => x.ID).Skip(1).FirstOrDefaultAsync();
                if (lastApprove != null)
                {
                    var emp = await _emailContext.Employees.Where(x => x.id == lastApprove.reqApprovedBy).FirstOrDefaultAsync();
                    if (emp != null)
                    {
                        var vendor = await _emailContext.Vendors.Where(x => x.Id == ihpoDetails.reqVendor).Select(x => x.name).FirstOrDefaultAsync();
                        string Body = "IHPO Number " + iHPO.reqNumber + " for " + vendor + " has been disapproved for the following reason: " + Environment.NewLine + comment + Environment.NewLine + DateTime.Now;
                        string Subject = "IHPO Number " + iHPO.reqNumber;
                        await SendEmail(fromId, emp.id, Subject, Body, "", "", -1);
                    }
                }
            }
            return "";
        }

        public async Task<List<int>> GetUsersByRole(string role)
        {
            var httpContext = _httpContextAccessor.HttpContext;
            List<int> users = new List<int>();
            if (httpContext != null)
            {
                try
                {
                    ServicePointManager.ServerCertificateValidationCallback += (sender, cert, chain, sslPolicyErrors) => true;
                    using (HttpClientHandler handler = new HttpClientHandler())
                    {
                        handler.ServerCertificateCustomValidationCallback = (sender, cert, chain, sslPolicyErrors) => true;
                        using (HttpClient httpClient = new HttpClient(handler))
                        {
                            var authorizationHeader = httpContext.Request.Headers["authorization"].ToString();
                            if (string.IsNullOrWhiteSpace(authorizationHeader) || !authorizationHeader.StartsWith("Bearer "))
                            {
                                return users;
                            }
                            var token = authorizationHeader.Substring("Bearer ".Length);
                            var externalApiUrl = _configuration["AuthenticationAPI:Url"] + "EmpIdsByRole";
                            //var externalApiUrl = "https://192.168.68.69:93/api/Authentication/EmpIdsByRole";
                            var content = new StringContent($"\"{role}\"", System.Text.Encoding.UTF8, "application/json");
                            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
                            var response = await httpClient.PostAsync(externalApiUrl, content);
                            response.EnsureSuccessStatusCode();
                            var responseData = await response.Content.ReadAsStringAsync();
                            var cleanedReponse = responseData.Replace("[", "").Replace("]", "");
                            users = cleanedReponse.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToList();
                            return users;
                        }
                    }

                    /*var authorizationHeader = httpContext.Request.Headers["Authorization"].ToString();
                    if (string.IsNullOrWhiteSpace(authorizationHeader) || !authorizationHeader.StartsWith("Bearer "))
                    {
                        return "Authorization token does not exist";
                    }
                    var token = authorizationHeader.Substring("Bearer ".Length);
                    var externalApiUrl = "https://192.168.68.65:93/api/Authentication/users/" + role;
                    _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
                    var response = await _httpClient.GetAsync(externalApiUrl);
                    response.EnsureSuccessStatusCode();
                    var responseData = await response.Content.ReadAsStringAsync();
                    return responseData;*/
                }
                catch (HttpRequestException ex)
                {
                    throw;
                }
            }
            else
            {
                return users;
            }
        }
    }
}
