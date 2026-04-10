using FinexAPI.Data;
using FinexAPI.Helper;
using FinexAPI.Models;
using FinexAPI.Models.PurchaseOrder;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FinexAPI.Controllers
{
    [Authorize]
    public class UploadDocumentController : BaseController
    {
        private readonly FinexAppContext _context;
        private readonly IWebHostEnvironment _env;
        private readonly IConfiguration _config;
        public UploadDocumentController(IHttpContextAccessor httpContextAccessor, FinexAppContext context, IWebHostEnvironment env, IConfiguration config) : base(httpContextAccessor)
        {
            _context = context;
            _env = env;
            _config = config;
        }
        [HttpPost("UploadDoc")]
        public async Task<ActionResult> UploadDoc([FromBody] UploadDocument fileData)
        {
            try
            {
                var fileRootPath = _config.GetValue<string>("UploadDocUrl");
                var filename = DateTime.Now.Ticks.ToString() + Path.GetExtension(fileData.fileName).ToString();
                var filepath = fileRootPath + filename.ToString();
                fileData.fileName = filename;
                byte[] bytes = Convert.FromBase64String(fileData.fileData);
                using (var stream = new FileStream(filepath, FileMode.Create))
                {
                    stream.Write(bytes, 0, bytes.Length);
                }
                fileData.OrgAccountId = OrgAccountId;
                _context.UploadDocument.Add(fileData);
                await _context.SaveChangesAsync();
                return Ok();
            }
            catch (Exception ex)
            {

                return BadRequest();
            }
        }

        [HttpGet("GetUploadDocumentList")]
        public async Task<ActionResult> GetUploadDocumentList(bool desc = true, string sortKey = "createdDate", string? fileType = "", string? fileName = "", string? fileDesc = "", string? search = "", string? docName = null, int skip = 0, int take = 0)
        {
            ListResultController<UploadDocument> _cmnCntrlr = new ListResultController<UploadDocument>();
            try
            {
                var fileRootPath = _config.GetValue<string>("UploadDocUrl");
                var List = new List<UploadDocument>();
                if (search == "")
                {
                    List = _context.UploadDocument.Where(p =>
                    (string.IsNullOrEmpty(fileType) || p.fileType.Contains(fileType))
                    && (string.IsNullOrEmpty(fileDesc) || p.fileDesc.Contains(fileDesc))
                    && (string.IsNullOrEmpty(fileName) || p.fileName.Contains(fileName))
                    //&& (string.IsNullOrEmpty(docName) || p.docName.Contains(docName))
                    && p.OrgAccountId == OrgAccountId).OrderByCustom(sortKey, desc).ToList();
                }
                else
                {
                    search = string.IsNullOrEmpty(search) ? "" : search;
                    List = _context.UploadDocument.Where(p =>
                   (p.fileType.Contains(string.IsNullOrEmpty(search) ? "" : search) ||
                    p.fileName.Contains(string.IsNullOrEmpty(search) ? "" : search) ||
                    p.docName.Contains(string.IsNullOrEmpty(search) ? "" : search) ||
                    p.fileDesc.Contains(string.IsNullOrEmpty(search) ? "" : search)) && p.OrgAccountId == OrgAccountId).ToList();
                }
                if (!string.IsNullOrEmpty(docName))
                {
                    List = List.Where(x => x.docName.Contains(docName)).ToList();
                }

                foreach (var item in List)
                {
                    if (!string.IsNullOrEmpty(item.fileName))
                    {
                        var filepath = fileRootPath + item.fileName.ToString();
                        if (System.IO.File.Exists(filepath))
                        {
                            byte[] bytes = System.IO.File.ReadAllBytes(filepath);
                            item.fileData = Convert.ToBase64String(bytes);
                        }
                    }
                }

                var data = _cmnCntrlr.returnResponse(take, skip, List, 0);

                return data;
            }
            catch (Exception ex)
            {
                throw;
            }
        }
    }
}
