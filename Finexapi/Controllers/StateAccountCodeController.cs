using FinexAPI.Common;
using FinexAPI.Data;
using FinexAPI.Models.Organization;
using FinexAPI.Models.PurchaseOrder;
using FinexAPI.Models.SAC;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SACC = FinexAPI.Models.SAC.SACC;

namespace FinexAPI.Controllers
{
    [Authorize]
    public class StateAccountCodeController : BaseController
    {
        private readonly FinexAppContext _context;
        private const string STR_PAGE = "PAGE";
        private const string STR_ROW = "ROW";
        private const string STR_COL = "COLUMN";


        public StateAccountCodeController(IHttpContextAccessor httpContextAccessor
            , FinexAppContext context) : base(httpContextAccessor)
        {
            _context = context;
        }

        // dropdown list are being called from different apis.
        // since data  are taken based on pageid and stateaccountcode. to filter data from single table, its better we have multiple tables
        //by orgId get page
        [Route("{accountingcodetype}")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<StateAccountCodeDetails>>> GetPage(int accountingcodetype)
        {
            var orgaccountobject = _context.orgnizationAccounts.Where(x => x.Id == OrgAccountId).FirstOrDefault();
            var organizationobj = _context.Organizations.Where(x => x.Id == orgaccountobject.orgId).FirstOrDefault();
            int orgtypeid = (int)organizationobj.orgType;
            // Revenue SAC codes a
            // Health department currently has different SAC codes.
            if (orgtypeid == 55)
            {
                return await _context.StateAccountCodeDetails.Where(x => x.NewSAC && x.type == STR_PAGE && x.ExpenseRevenueInd == accountingcodetype && x.OrgTypeId == 55).ToListAsync();
            }
            else
            {
                return await _context.StateAccountCodeDetails.Where(x => x.NewSAC && x.type == STR_PAGE && x.ExpenseRevenueInd == accountingcodetype && x.OrgTypeId != 55).ToListAsync();

            }
        }
        // by pageid get row
        [Route("{pageId}/Row/{accountingcodetype}")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<StateAccountCodeDetails>>> GetRow(int pageId, int accountingcodetype)
        {
            var orgaccountobject = _context.orgnizationAccounts.Where(x => x.Id == OrgAccountId).FirstOrDefault();
            var organizationobj = _context.Organizations.Where(x => x.Id == orgaccountobject.orgId).FirstOrDefault();
            int orgtypeid = (int)organizationobj.orgType;
            // Revenue SAC codes a
            // Health department currently has different SAC codes.
            if (orgtypeid == 55)
            {

                return await _context.StateAccountCodeDetails.Where(x => x.NewSAC && x.pageId == pageId && x.type == STR_ROW && x.ExpenseRevenueInd == accountingcodetype && x.OrgTypeId == 55).ToListAsync();
            }
            else
            {

                return await _context.StateAccountCodeDetails.Where(x => x.NewSAC && x.pageId == pageId && x.type == STR_ROW && x.ExpenseRevenueInd == accountingcodetype && x.OrgTypeId != 55).ToListAsync();
            }


        }
        // by pageid get column
        [Route("{pageId}/Column/{accountingcodetype}")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<StateAccountCodeDetails>>> GetColumn(int pageId, int accountingcodetype)
        {

            var orgaccountobject = _context.orgnizationAccounts.Where(x => x.Id == OrgAccountId).FirstOrDefault();
            var organizationobj = _context.Organizations.Where(x => x.Id == orgaccountobject.orgId).FirstOrDefault();
            int orgtypeid = (int)organizationobj.orgType;
            // Revenue SAC codes a
            // Health department currently has different SAC codes.
            if (orgtypeid == Constants._CountyHealthDepartment)
            {
                return await _context.StateAccountCodeDetails.Where(x => x.NewSAC && x.pageId == pageId && x.type == STR_COL && x.ExpenseRevenueInd == accountingcodetype && x.OrgTypeId == Constants._CountyHealthDepartment).ToListAsync();
            }
            else
            {
                return await _context.StateAccountCodeDetails.Where(x => x.NewSAC && x.pageId == pageId && x.type == STR_COL && x.ExpenseRevenueInd == accountingcodetype && x.OrgTypeId != Constants._CountyHealthDepartment).ToListAsync();
            }


        }

        // by stateaccountcode getrow and getcolumn
        [HttpGet("{code}/RowBySAC/{accountingcodetype}")]
        public async Task<ActionResult<IEnumerable<StateAccountCodeDetails>>> GetRowBySAC(string code, int accountingcodetype)
        {
            return await _context.StateAccountCodeDetails.Where(x => x.NewSAC && x.stateAccountCode == code && x.type == STR_ROW).ToListAsync();
        }
        [HttpGet("{code}/ColumnBySAC/{accountingcodetype}")]
        public async Task<ActionResult<IEnumerable<StateAccountCodeDetails>>> GetColumnBySAC(string code, int accountingcodetype)
        {
            return await _context.StateAccountCodeDetails.Where(x => x.NewSAC && x.stateAccountCode == code && x.type == STR_COL).ToListAsync();
        }
        // get pages based on stateaccountcode
    }
}
