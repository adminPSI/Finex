using AutoMapper.Internal;
using FinexAPI.Common;
using FinexAPI.Data;
using FinexAPI.Formulas;
using FinexAPI.Helper;
using FinexAPI.Models;
using FinexAPI.Models.AccountRevenue;
using FinexAPI.Models.PurchaseOrder;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.Linq;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace FinexAPI.Controllers
{
    [Authorize] 
    public class AccountRevenueController : BaseController
    {

        private readonly FinexAppContext _context;

        public AccountRevenueController(IHttpContextAccessor httpContextAccessor, FinexAppContext context) : base(httpContextAccessor)
        {
            _context = context;
        }

        [Route("Filter")]
        [HttpGet]
        public async Task<ActionResult> AccountRevenueFilter(bool desc, string sortKey = "modifiedDate", string? RevenueContrib = "", DateTime? dateReceived = null, DateTime? dayTapeDate = null, string? revreceiptno = "", string? revAmount = "", string? payinno = "", string? description = "", string? status = "", DateTime? postDate = null, DateTime? statusCahngeDate = null, int? projectId = null, string? checkNo = "", string? invoiceNo = "", string? search = "", string? year="", int skip = 0, int take = 0)
        {

            int.TryParse(year, out var yearVal);
            //if (yearVal == 0)
            //    yearVal = DateTime.Now.Year;

            ListResultController<CountyRevenue> _cmnCntrlr = new ListResultController<CountyRevenue>();
            if (RevenueContrib == "" && dayTapeDate == null && dateReceived == null && revreceiptno == "" && revAmount == "" && payinno == "" && description == "" && status == "" && checkNo == "" && invoiceNo == "" && search == "" && projectId == null && postDate == null && statusCahngeDate == null)
            {

                var query = _context.CountyRevenue
                                  .Include(x => x.CountyRevenueDetails)
                                  .Include(x => x.CountyRevenueContrib)
                                  .Include(x => x.RevenueReceivableApproval)
                                  .Include(x => x.CountyRevenueBD)
                                  .Include(x => x.CodeValues)
                                  .Where(x=>x.OrgAccountId == OrgAccountId);
                    
                if(yearVal == 0)
                    query = query.Where(x => x.dateReceived.Year >= DateTime.Now.Year-1);
                else
                    query = query.Where(x => x.dateReceived.Year == yearVal);

                var list = query.OrderByCustom(sortKey, desc);

                list = FilterRevenues(list, dayTapeDate);
                return await _cmnCntrlr.returnResponse(take, skip, list, await list.SumAsync(x => x.rev_Amount));
            }
            else if (search == "")
            {
                //List<CountyRevenue> list = new List<CountyRevenue>();
                var  list = _context.CountyRevenue
                                  .Include(x => x.CountyRevenueDetails)
                                  .Include(x => x.CountyRevenueContrib)
                                  .Include(x => x.RevenueReceivableApproval)
                                  .Include(x => x.CountyRevenueBD)
                                  .Include(x => x.CodeValues)
                                  .Where(x =>
                   (string.IsNullOrEmpty(RevenueContrib) || x.CountyRevenueContrib.name.ToLower().Contains(RevenueContrib.ToLower()))
                    && (string.IsNullOrEmpty(revreceiptno) || x.rev_Receipt_No.ToLower().Contains(revreceiptno.ToLower()))
                    && (string.IsNullOrEmpty(revAmount) || x.rev_Amount.ToString().Contains(revAmount.ToLower()))
                    && (string.IsNullOrEmpty(payinno) || x.CountyRevenueDetails.payoutnum.ToLower().Contains(payinno.ToLower()))
                    && (string.IsNullOrEmpty(description) || x.rev_Description.ToLower().Contains(description.ToLower()))
                    && (string.IsNullOrEmpty(invoiceNo) || x.CountyRevenueBD.Any(x => x.AccountReceivables.invoiceNo.ToLower().Contains(invoiceNo.ToLower())))
                    && (string.IsNullOrEmpty(checkNo) || x.CountyRevenueBD.Any(x => x.rev_BD_Check_No.ToLower().Contains(checkNo.ToLower())))
                    && (string.IsNullOrEmpty(status) || x.CodeValues.value.ToLower().Contains(status.ToLower()))
                    && (dateReceived == null || x.dateReceived.Date == dateReceived.Value.Date)
                    && (dayTapeDate == null || x.dateReceived.Date == dayTapeDate.Value.Date)
                    && (postDate == null || x.postDate.Value.Date == postDate.Value.Date)
                    && (yearVal == 0 || x.dateReceived.Date.Year == yearVal)
                    && (statusCahngeDate == null || x.statusChangeDate.Value.Date == statusCahngeDate.Value.Date)
                    && (projectId == null || x.CountyRevenueBD.Any(x => x.ProjectID == projectId))
                ).OrderByCustom(sortKey, desc);

                list = FilterRevenues(list, dayTapeDate);

                return await _cmnCntrlr.returnResponse(take, skip, list, await list.SumAsync(x => x.rev_Amount));
            }
            else
            {
                search = string.IsNullOrEmpty(search) ? "" : search;
                var list = _context.CountyRevenue
                                    .Include(x => x.CountyRevenueDetails)
                                    .Include(x => x.CountyRevenueContrib)
                                    .Include(x => x.RevenueReceivableApproval)
                                    .Include(x => x.CountyRevenueBD)
                                    .Include(x => x.CodeValues)
                                    .Where(x =>
                    (x.CountyRevenueContrib.name.Contains(search)
                || x.rev_Receipt_No.Contains(search)
                || x.rev_Amount.ToString().Contains(search)
                || x.CountyRevenueDetails.payoutnum.Contains(search)
                || x.rev_Description.Contains(search)
                || x.CountyRevenueBD.Any(x => x.AccountReceivables.invoiceNo.Contains(search))
                || x.CodeValues.value.Contains(search)
                || x.CountyRevenueBD.Any(x => x.rev_BD_Check_No.Contains(search)))
                ).OrderByCustom(sortKey, desc);

                if (yearVal != 0)
                    list = list.Where(x => x.dateReceived.Year == yearVal);

                list = FilterRevenues(list, dayTapeDate);

                return await _cmnCntrlr.returnResponse(take, skip, list, await list.SumAsync(x => x.rev_Amount));
            }
        }

        private IQueryable<CountyRevenue> FilterRevenues(IQueryable<CountyRevenue> revenues, DateTime? dayTapeDate)
        {
            if (dayTapeDate != null)
            {
                return revenues.Where(x => x.CountyRevenueDetails.noDayTape != true);
            }
            else { return revenues; }
        }



        /// <summary>
        /// GetRevenue Received From Dropdown
        /// </summary>
        /// <returns></returns>

        [HttpGet("RevenueReceived")]
        public async Task<ActionResult<dynamic>> GetRevenueReceivedFrom(string? revenueContrib = null)
        {
            return await _context.Vendors.Where(x =>
                   (x.name.Contains(revenueContrib) || revenueContrib == null) && x.vendorTypeId == 39 ).Select(x => new
                   {
                       x.Id,
                       x.name,
                       x.address1,
                       x.city,
                       x.state,
                       x.email,
                       x.phone
                   }).AsNoTracking().ToListAsync();
        }

        /// <summary>
        /// Get list of County Revenue with pagination
        /// </summary>
        /// <param name="skip"></param>
        /// <param name="totalPage"></param>
        /// <returns></returns>
        [HttpGet]
        public async Task<ActionResult<dynamic>> GetCountyRevenue(int? skip = null, int? totalPage = null)

        {
            if (skip != null && totalPage != null)
            {

                var data1 = await _context.CountyRevenue
                                  .Include(x => x.CountyRevenueDetails)
                                  .Include(x => x.CountyRevenueContrib)
                                  .Include(x => x.RevenueReceivableApproval).Select(x =>
                                  new
                                  {
                                      x.ID,
                                      x.CountyRevenueDetails.countyRevenueId,
                                      x.CountyRevenueContrib.name,
                                      x.dateReceived,
                                      x.rev_Receipt_No,
                                      x.CountyRevenueDetails.payoutnum,
                                      x.rev_Amount,
                                      x.rev_Description,
                                      x.RevenueReceivableApproval.status,
                                      x.RevenueReceivableApproval.statusMessage
                                  }).AsNoTracking().ToListAsync();
                var count = data1.Count();
                data1 = data1.Skip(skip.Value).Take(totalPage.Value).ToList();
                return Ok(new { data1, count });
            }
            else
            {
                return await _context.CountyRevenue.Include(x => x.CountyRevenueDetails).Include(x => x.CountyRevenueContrib)
                    .Include(x => x.RevenueReceivableApproval).Select(x =>
                                 new
                                 {
                                     x.ID,
                                     x.CountyRevenueDetails.countyRevenueId,
                                     x.CountyRevenueContrib.name,
                                     x.dateReceived,
                                     x.rev_Receipt_No,
                                     x.CountyRevenueDetails.payoutnum,
                                     x.rev_Amount,
                                     x.rev_Description,
                                     x.RevenueReceivableApproval.status,
                                     x.RevenueReceivableApproval.statusMessage
                                 }).AsNoTracking().ToListAsync();
            }
        }

        /// <summary>
        /// get revenue by id
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<CountyRevenue>> GetCountyRevenueById(int id)
        {

            var data = await _context.CountyRevenue
                              .Include(x => x.CountyRevenueDetails)
                             .AsNoTracking()
                              .Where(x => x.ID == id)
                              .Select(x => new { x, x.CountyRevenueContrib.name })
                              .FirstOrDefaultAsync();
            if (data != null)
            {
                return Ok(data);
            }
            else
            {
                return BadRequest("County Revenue does not exist");
            }

        }

        /// <summary>
        /// Get RevenueBD by passing revenue id
        /// </summary>
        /// <param name="id"></param>
        /// <param name="skip"></param>
        /// <param name="totalPage"></param>
        /// <returns></returns>

        [HttpGet("CountyRevenueBD/{id}")]
        public async Task<ActionResult<List<CountyRevenueBD>>> GetCountyRevenueBDById(int id, int? skip = null, int? totalPage = null)
        {
            if (skip != null && totalPage != null)
            {

                var record = new List<CountyRevenueBD>();

                record = await _context.CountyRevenueBD.Include(x => x.AccountReceivables)
                    .Where(x => x.rev_ID == id).ToListAsync();
                var count = record.Count();

                record = record.Skip(skip.Value).Take(totalPage.Value).ToList();

                return Ok(new { record, count });
            }
            else
            {
                var data = new List<CountyRevenueBD>();
                data = await _context.CountyRevenueBD.Include(x => x.AccountReceivables).Where(x => x.rev_ID == id).ToListAsync();
                var count = data.Count();

                return Ok(new { data, count });

            }
        }




        [Route("FilterAccountReceivables")]
        [HttpGet]
        public async Task<ActionResult> Filter(bool desc, string sortKey = "modifiedDate", string? invoiceNo = "", string? revenueContrip = "",
            DateTime? arDate = null, string? amount = "", string? balance = "", string? search = "", string? year = "", bool printed = false,
            bool unpaidInvoice = false, bool closedInvoice = false, bool uncollected = false, int skip = 0,
            bool unpaidOver90 = false, int take = 0)
        {
            int.TryParse(year, out var yearVal);
            //if (yearVal == 0)
            //    yearVal = DateTime.Now.Year;

            if (search == "")
            {
                //List<AccountReceivables> list = new List<AccountReceivables>();

                var query = _context.AccountReceivables
                         .Include(x => x.CountyRevenueContrib)
                        .Include(x => x.RevenueReceivableApproval)
                        .Where(x =>
                        x.invoiceNo.Contains(string.IsNullOrEmpty(invoiceNo) ? "" : invoiceNo)
                && (string.IsNullOrEmpty(revenueContrip) || x.CountyRevenueContrib.name.Contains(string.IsNullOrEmpty(revenueContrip) ? "" : revenueContrip))
                && x.amount.ToString().Contains(string.IsNullOrEmpty(amount) ? "" : amount)
                && (string.IsNullOrEmpty(balance) || x.balance.ToString().Contains(string.IsNullOrEmpty(balance) ? "" : balance))
                );//.OrderByCustom(sortKey, desc).ToListAsync();

                //list = FilterAccountReceivables(list, arDate);

                if (arDate != null)
                {
                    DateTime date = (DateTime)arDate;
                    query = query.Where(x => x.arDate.Year == date.Year && x.arDate.Month == date.Month && x.arDate.Day == date.Day);
                }
                

                if (unpaidInvoice)
                {
                    query = query.Where(x => x.balance != 0 && x.uncollectedDebt == false);
                }
                else if (closedInvoice)
                {
                    query = query.Where(x => x.balance == 0 && x.uncollectedDebt == false);
                }
                else if (uncollected)
                {
                    query = query.Where(x => x.uncollectedDebt == true);
                }
                else if (unpaidOver90)
                {
                    query = query.Where(x => x.balance != 0 && x.uncollectedDebt == false && x.arDate <= DateTime.Now.AddDays(-90));
                }
                else if (printed)
                {
                    query = query.Where(x => x.printed == true);
                }
                else if(yearVal!=0) {
                    query = query.Where(x => x.arDate.Year == yearVal);
                }

                query = query.OrderByCustom(sortKey, desc);

                var totalCount = await query.CountAsync();

                if (take == 0)
                {
                    return Ok(new { data = await query.ToListAsync(), Total = totalCount });
                }
                else
                {
                    return Ok(new { data = await query.Skip(skip).Take(take).ToListAsync(), Total = totalCount });
                }
            }
            else
            {
                search = string.IsNullOrEmpty(search) ? "" : search;
                var query = _context.AccountReceivables
                                              .Include(x => x.CountyRevenueContrib)
                                             .Include(x => x.RevenueReceivableApproval)
                                             .Where(x => (x.invoiceNo.ToString().Contains(search)
                 || x.CountyRevenueContrib.name.ToString().Contains(search)
                 || x.amount.ToString().Contains(search)
                 || x.balance.ToString().Contains(search)));
                //.OrderByCustom(sortKey, desc).ToListAsync();

                query = query.OrderByCustom(sortKey, desc);

                var totalCount = await query.CountAsync();

                if (take == 0)
                {
                    return Ok(new { data = await query.ToListAsync(), Total = totalCount });
                }
                else
                {
                    return Ok(new { data = await query.Skip(skip).Take(take).ToListAsync(), Total = totalCount });
                }
            }

        }

        private List<AccountReceivables> FilterAccountReceivables(List<AccountReceivables> list, DateTime? dateTime)
        {
            if (dateTime == null)
            {
                return list;
            }
            DateTime date = (DateTime)dateTime;
            return list.Where(x => x.arDate.Year == date.Year && x.arDate.Month == date.Month && x.arDate.Day == date.Day).ToList();
        }


        /// <summary>
        /// Get Account Receivables list
        /// </summary>
        /// <param name="skip"></param>
        /// <param name="totalPage"></param>
        /// <returns></returns>
        [HttpGet("AccountReceivables")]
        public async Task<ActionResult<dynamic>> GetAccountReceivables(int? skip = null, int? totalPage = null)
        {
            if (skip != null && totalPage != null)
            {

                var record = await _context.AccountReceivables
                       .Include(x => x.CountyRevenueContrib)
                       .Include(x => x.RevenueReceivableApproval)
                       .Select(x => new
                       {
                           x.ID,
                           x.CountyRevenueContrib.name,
                           x.amount,
                           x.invoiceNo,
                           x.balance,
                           x.RevenueReceivableApproval.status,
                           x.RevenueReceivableApproval.statusMessage,
                           x.arDate
                       })
                       .AsNoTracking().ToListAsync();
                var count = record.Count();
                record = record.Skip(skip.Value).Take(totalPage.Value).ToList();
                return Ok(new { record, count });
            }
            else
            {
                return await _context.AccountReceivables.Include(x => x.CountyRevenueContrib)
                    .Include(x => x.RevenueReceivableApproval)
                    .Select(x => new
                    {
                        x.ID,
                        x.CountyRevenueContrib.name,
                        x.amount,
                        x.invoiceNo,
                        x.balance,
                        x.RevenueReceivableApproval.status,
                        x.RevenueReceivableApproval.statusMessage,
                        x.arDate
                    }).AsNoTracking().ToListAsync();

            }


        }

        /// <summary>
        /// Get Account Receivables Desc List by AccountReceivable Id
        /// </summary>
        /// <param name="id"></param>
        /// <param name="skip"></param>
        /// <param name="totalPage"></param>
        /// <returns></returns>
        [HttpGet("AccountReceivablesDesc/{id}")]
        public async Task<ActionResult<List<AccountReceivableDesc>>> GetAccountReceivablesDescById(int id, int? skip = null, int? totalPage = null)
        {
            var record = new List<AccountReceivableDesc>();
            if (skip != null && totalPage != null)
            {

                record = await _context.AccountReceivables.Include(x => x.AccountReceivableDescs).Where(x => x.ID == id)
                    .Select(x => x.AccountReceivableDescs).FirstOrDefaultAsync();
                var count = record?.Count;
                record = record?.Skip(skip.Value).Take(totalPage.Value).ToList();
                return Ok(new { record, count });
            }
            else
            {
                record = await _context.AccountReceivables.Include(x => x.AccountReceivableDescs).Where(x => x.ID == id)
                    .Select(x => x.AccountReceivableDescs).FirstOrDefaultAsync();
                var count = record?.Count;

                return Ok(new { record, count });
            }


        }


        /// <summary>
        /// Get Account Receivables by Id
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet("AccountReceivables/{id}")]
        public async Task<ActionResult<AccountReceivables>> GetAccountReceivablesById(int id)
        {

            var data = await _context.AccountReceivables.Include(x => x.CountyRevenueContrib)
                 .Where(x => x.ID == id).Select(x => new { x, x.CountyRevenueContrib.name }).FirstOrDefaultAsync();
            if (data != null)
            {
                return Ok(data);
            }
            else
            {
                return BadRequest("AccountReceivables does not exist");
            }

        }

        /// <summary>
        /// Add Revenue
        /// </summary>
        /// <param name="poObj"></param>
        /// <returns></returns>
        /// <exception cref="Exception"></exception>

        [HttpPost]
        public async Task<ActionResult<CountyRevenue>> PostRevenueDetails(CountyRevenue poObj)
        {
            if (poObj.rev_Amount < 0)
            {
                return BadRequest("Negative value does not allowed");
            }
            try
            {
                poObj.status = Constants._Pending;
                _context.CountyRevenue.Add(poObj);
                await _context.SaveChangesAsync();
                return Ok(poObj);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        /// <summary>
        /// Update Revenue 
        /// </summary>
        /// <param name="id"></param>
        /// <param name="poObj"></param>
        /// <returns></returns>
        /// <exception cref="Exception"></exception>
        [HttpPut("{id}")]
        public async Task<ActionResult<CountyRevenue>> PutRevenueDetails(int id, CountyRevenue poObj)
        {

            try
            {
                if (poObj != null)
                {
                    if (poObj.ID != id)
                    {
                        return BadRequest("CountyRevenue does not match with id");
                    }

                    var revenueRef = await _context.CountyRevenue.FirstOrDefaultAsync(x => x.ID == id);
                    if (revenueRef != null)
                    {
                        poObj.createdBy = revenueRef.createdBy;
                        poObj.createdDate = revenueRef.createdDate;
                        _context.CountyRevenue.Entry(revenueRef).State = EntityState.Detached;
                        _context.CountyRevenue.Update(poObj);
                    }
                    else
                    {
                        return BadRequest("CountyRevenue does not exist");
                    }
                }

                await _context.SaveChangesAsync();
                return Ok(poObj);


            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }

        }

        /// <summary>
        /// Delete Revenue tables
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpDelete("{id}")]
        public async Task<ActionResult<bool>> DeleteRevenue(int id)
        {
            var countyRev = await _context.CountyRevenue.Where(x => x.ID == id).FirstOrDefaultAsync();
            if (countyRev != null)
            {
                var countyRevDetails = await _context.CountyRevenueDetails.Where(x => x.countyRevenueId == id).FirstOrDefaultAsync();
                var approvals = new RevenueReceivableApproval();
                if (countyRev != null)
                {
                    approvals = await _context.RevenueReceivableApproval.Where(x => x.refId == id && x.accountType == Constants._CRAccountType).FirstOrDefaultAsync();

                }
                List<CountyRevenueBD> countyRevLineItem = await _context.CountyRevenueBD.Where(x => x.rev_ID == id).ToListAsync();

                if (countyRev != null)
                    _context.CountyRevenue.Remove(countyRev);
                if (countyRevDetails != null)
                    _context.CountyRevenueDetails.Remove(countyRevDetails);
                if (approvals != null)
                    _context.RevenueReceivableApproval.Remove(approvals);
                if (countyRevLineItem != null)
                {
                    foreach (var item in countyRevLineItem)
                    {
                        _context.CountyRevenueBD.Remove(item);
                    }

                }
                await _context.SaveChangesAsync();
                return Ok(true);
            }
            else
            {
                return BadRequest("Revenue does not exsit");
            }
        }

        /// <summary>
        /// Add RevenueDetails BD
        /// </summary>
        /// <param name="poObj"></param>
        /// <returns></returns>
        /// <exception cref="Exception"></exception>
        [HttpPost("RevenueDetailsBD")]
        public async Task<ActionResult<CountyRevenueBD>> PostRevenueDetailsBD(CountyRevenueBD poObj)
        {
            if (poObj.rev_BD_Amount < 0)
            {
                return BadRequest("Negative values does not allow");
            }
            if (poObj.invoiceId != null && poObj.invoiceId > 0)
            {
                var invoice = await _context.AccountReceivables.Where(x => x.ID == poObj.invoiceId).FirstOrDefaultAsync();
                var revenue = await _context.CountyRevenue.Where(x => x.ID == poObj.rev_ID).FirstOrDefaultAsync();
                if (invoice != null && revenue != null && revenue.dateReceived.Date < invoice.arDate.Date)
                {
                    return BadRequest("Date Received can't be lower than invoice date");
                }
            }
            if (poObj.rev_BD_CAC > 0)
            {
                var revenue = await _context.CountyRevenue.Where(x => x.ID == poObj.rev_ID).FirstOrDefaultAsync();
                var _cac = await _context.AccountingCodes.FindAsync(poObj.rev_BD_CAC);
                if (_cac != null)
                {
                    int actdaydiff = revenue.dateReceived.CompareTo(_cac.startDate);
                    int inactdaydiff = revenue.dateReceived.CompareTo(_cac.endDate != null ? _cac.endDate : Constants._DefaultEndDateTime);
                    if (actdaydiff < 0 || inactdaydiff > 0)
                    {
                        return BadRequest("Date recieved should be between CAC date range!");
                    }
                }
            }


            string[] codes = (poObj.rev_BD_IHAC ?? "").Split('_');
            if((poObj.rev_BD_IHAC ?? "").Contains("-"))
                codes = (poObj.rev_BD_IHAC ?? "").Split('-');

            if (codes.Length > 3)
            {
                var revenue = await _context.CountyRevenue.Where(x =>  x.ID == poObj.rev_ID).FirstOrDefaultAsync();
                var progRef = await _context.IHCPrograms.Where(x => x.code == codes[0] ).FirstOrDefaultAsync();
                if (progRef != null && revenue != null && revenue.dateReceived.Date < progRef.startDate.Date)
                {
                    return BadRequest("You can't add Inactive program");
                }
                var departmentRef = await _context.IHCDepartments.Where(x => x.code == codes[1] ).FirstOrDefaultAsync();
                if (departmentRef != null && revenue != null && revenue.dateReceived.Date < departmentRef.startDate.Date)
                {
                    return BadRequest("You can't add Inactive Department");
                }
                var accountRef = await _context.IHCAccounts.Where(x => x.code == codes[2]).FirstOrDefaultAsync();
                if (accountRef != null && revenue != null && revenue.dateReceived.Date < accountRef.startDate.Date)
                {
                    return BadRequest("You can't add Inactive Account");
                }
                var subAccountRef = await _context.IHCSubAccounts.Where(x => x.code == codes[3]).FirstOrDefaultAsync();
                if (subAccountRef != null && revenue != null && revenue.dateReceived.Date < subAccountRef.startDate.Date)
                {
                    return BadRequest("You can't add Inactive SubAccount");
                }
            }
            try
            {
                _context.CountyRevenueBD.Add(poObj);
                await _context.SaveChangesAsync();
                await FundCalculation.CalcARLineItemBalance(poObj.ID, OrgAccountId, _context);
                return Ok(poObj);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        /// <summary>
        /// Update Revenue Detail BD
        /// </summary>
        /// <param name="id"></param>
        /// <param name="poObj"></param>
        /// <returns></returns>
        /// <exception cref="Exception"></exception>
        [HttpPut("RevenueDetailsBD/{id}")]
        public async Task<ActionResult<CountyRevenueBD>> PutRevenueDetailsBD(int id, CountyRevenueBD poObj)
        {

            try
            {
                if (poObj.rev_BD_Amount < 0)
                {
                    return BadRequest("Negative values does not allow");
                }
                if (poObj.invoiceId != null && poObj.invoiceId > 0)
                {
                    var invoice = await _context.AccountReceivables.Where(x => x.ID == poObj.invoiceId).FirstOrDefaultAsync();
                    var revenue = await _context.CountyRevenue.Where(x => x.ID == poObj.rev_ID).FirstOrDefaultAsync();
                    if (invoice != null && revenue != null && revenue.dateReceived.Date.CompareTo(invoice.arDate.Date) < 0)
                    {
                        return BadRequest("Date Received can't be lower than invoice date");
                    }
                }

                if (poObj.rev_BD_CAC > 0)
                {
                    var revenue = await _context.CountyRevenue.Where(x =>  x.ID == poObj.rev_ID).FirstOrDefaultAsync();
                    var _cac = await _context.AccountingCodes.FindAsync(poObj.rev_BD_CAC);
                    if (_cac != null)
                    {
                        int actdaydiff = revenue.dateReceived.CompareTo(_cac.startDate);
                        int inactdaydiff = revenue.dateReceived.CompareTo(_cac.endDate != null ? _cac.endDate : Constants._DefaultEndDateTime);
                        if (actdaydiff < 0 || inactdaydiff > 0)
                        {
                            return BadRequest("Date recieved should be between CAC date range!");
                        }
                    }
                }


                string[] codes = (poObj.rev_BD_IHAC ?? "").Split('_');
                if ((poObj.rev_BD_IHAC ?? "").Contains("-"))
                    codes = (poObj.rev_BD_IHAC ?? "").Split('-');

                if (codes.Length > 3)
                {
                    var revenue = await _context.CountyRevenue.Where(x =>  x.ID == poObj.rev_ID).FirstOrDefaultAsync();
                    var progRef = await _context.IHCPrograms.Where(x => x.code == codes[0]).FirstOrDefaultAsync();
                    if (progRef != null && revenue != null && revenue.dateReceived.Date.CompareTo(progRef.startDate.Date) < 0)
                    {
                        return BadRequest("You can't add Inactive program");
                    }
                    var departmentRef = await _context.IHCDepartments.Where(x => x.code == codes[1]).FirstOrDefaultAsync();
                    if (departmentRef != null && revenue != null && revenue.dateReceived.Date.CompareTo(departmentRef.startDate.Date) < 0)
                    {
                        return BadRequest("You can't add Inactive Department");
                    }
                    var accountRef = await _context.IHCAccounts.Where(x => x.code == codes[2]).FirstOrDefaultAsync();
                    if (accountRef != null && revenue != null && revenue.dateReceived.Date.CompareTo(accountRef.startDate.Date) < 0)
                    {
                        return BadRequest("You can't add Inactive Account");
                    }
                    var subAccountRef = await _context.IHCSubAccounts.Where(x => x.code == codes[3]).FirstOrDefaultAsync();
                    if (subAccountRef != null && revenue != null && revenue.dateReceived.Date.CompareTo(subAccountRef.startDate.Date) < 0)
                    {
                        return BadRequest("You can't add Inactive SubAccount");
                    }
                }
                if (poObj != null)
                {
                    if (poObj.ID != id)
                    {
                        return BadRequest("RevenueDetails does not match with id");
                    }
                    var bdref = await _context.CountyRevenueBD.FindAsync(id);
                    var preAmount = bdref.rev_BD_Amount;
                    var preInvoiceId = bdref.invoiceId;
                    if (bdref != null)
                    {
                        poObj.createdBy = bdref.createdBy;
                        poObj.createdDate = bdref.createdDate;
                        _context.CountyRevenueBD.Entry(bdref).State = EntityState.Detached;
                        _context.CountyRevenueBD.Update(poObj);
                    }
                    else
                    {
                        return BadRequest("RevenueDetails does not exist");
                    }
                    await _context.SaveChangesAsync();
                    await FundCalculation.CalcARLineItemBalanceWhileUpdate(poObj.ID, preInvoiceId, preAmount, OrgAccountId, _context);
                    return Ok(poObj);
                }
                else
                {
                    return BadRequest("Request object cannot null");
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }

        }

        /// <summary>
        /// Delete Revenue Details BD
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>

        [HttpDelete("RevenueDetailsBD/{id}")]
        public async Task<ActionResult<bool>> DeleteRevenueBD(int id)
        {
            var countyRevLineItem = await _context.CountyRevenueBD.Where(x => x.ID == id).FirstOrDefaultAsync();
            if (countyRevLineItem == null)
            {
                return BadRequest("CountyRevenueBD does not exist");
            }
            await FundCalculation.CalcARLineItemBalanceWhileDelete(id, OrgAccountId, _context);
            _context.CountyRevenueBD.Remove(countyRevLineItem);
            await _context.SaveChangesAsync();
            return Ok(true);
        }

        /// <summary>
        /// Add Account Receivables
        /// </summary>
        /// <param name="poObj"></param>
        /// <returns></returns>
        /// <exception cref="Exception"></exception>
        [HttpPost("AccountReceivables")]
        public async Task<ActionResult<AccountReceivables>> PostAccountReceivables(AccountReceivables poObj)
        {

            try
            {
                _context.AccountReceivables.Add(poObj);
                await _context.SaveChangesAsync();
                return Ok(poObj);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        /// <summary>
        /// Update Account Receivables
        /// </summary>
        /// <param name="id"></param>
        /// <param name="poObj"></param>
        /// <returns></returns>
        /// <exception cref="Exception"></exception>
        [HttpPut("AccountReceivables/{id}")]
        public async Task<ActionResult<AccountReceivables>> PutAccountReceivables(int id, AccountReceivables poObj)
        {

            try
            {
                if (poObj != null)
                {
                    if (poObj.ID != id)
                    {
                        return BadRequest("AccountReceivables does not match with id");
                    }
                    var arRef = await _context.AccountReceivables.FirstOrDefaultAsync(x => x.ID == id);
                    if (arRef != null)
                    {
                        poObj.createdBy = arRef.createdBy;
                        poObj.createdDate = arRef.createdDate;
                        _context.AccountReceivables.Entry(arRef).State = EntityState.Detached;
                        _context.AccountReceivables.Update(poObj);
                    }
                    else
                    {
                        return BadRequest("AccountReceivables does not exist");
                    }
                }

                await _context.SaveChangesAsync();
                await FundCalculation.CalcInvoiceBalance(poObj.ID, _context);
                return Ok(poObj);


            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }

        }

        /// <summary>
        /// Delete Account Receivables
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpDelete("AccountReceivables/{id}")]
        public async Task<ActionResult<bool>> DeleteAccountReceivables(int id)
        {
            var accountReceivables = await _context.AccountReceivables.FirstOrDefaultAsync(x => x.ID == id);
            var desc = new List<AccountReceivableDesc>();
            var approvals = new RevenueReceivableApproval();
            if (accountReceivables != null)
            {
                desc = await _context.AccountReceivableDesc.Where(x => x.arID == id).ToListAsync();
                approvals = await _context.RevenueReceivableApproval.Where(x => x.refId == id && x.accountType == Constants._ARAccountType).FirstOrDefaultAsync();


            }

            if (accountReceivables != null)
                _context.AccountReceivables.Remove(accountReceivables);
            if (approvals != null)
                _context.RevenueReceivableApproval.Remove(approvals);
            if (desc != null)
            {
                foreach (var item in desc)
                {
                    _context.AccountReceivableDesc.Remove(item);
                }

            }

            await _context.SaveChangesAsync();
            return Ok(true);
        }

        /// <summary>
        /// Add Account Receivables Desc
        /// </summary>
        /// <param name="poObj"></param>
        /// <returns></returns>
        /// <exception cref="Exception"></exception>
        [HttpPost("AccountReceivableDesc")]
        public async Task<ActionResult<AccountReceivableDesc>> PostAccountReceivableDesc(AccountReceivableDesc poObj)
        {

            try
            {
                if (poObj.amount < 0 || poObj.pricePerUnit < 0 || poObj.received < 0 || (poObj.quantity != null && int.Parse(poObj.quantity) < 0))
                {
                    return BadRequest("Negative values does not allow");
                }
                var arRef = await _context.AccountReceivables.Where(x => x.ID == poObj.arID).FirstOrDefaultAsync();
                _context.AccountReceivableDesc.Add(poObj);
                await _context.SaveChangesAsync();
                await FundCalculation.CalculateAndStoreARLineBalance(poObj.ID, _context);
                var ar = await _context.AccountReceivables.FindAsync(poObj.arID);
                if (ar != null)
                {
                    await FundCalculation.CalcInvoiceBalance(ar.ID, _context);
                }
                return Ok(poObj);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        /// <summary>
        /// Update Account Receivables desc
        /// </summary>
        /// <param name="id"></param>
        /// <param name="poObj"></param>
        /// <returns></returns>
        /// <exception cref="Exception"></exception>
        [HttpPut("AccountReceivableDesc/{id}")]
        public async Task<ActionResult<AccountReceivables>> PutAccountReceivableDesc(int id, AccountReceivableDesc poObj)
        {

            try
            {
                if (poObj != null)
                {
                    if (poObj.ID != id)
                    {
                        return BadRequest("AccountReceivablesDesc does not match with id");
                    }
                    if (poObj.amount < 0 || poObj.pricePerUnit < 0 || poObj.received < 0 || (poObj.quantity != null && int.Parse(poObj.quantity) < 0))
                    {
                        return BadRequest("Negative values does not allow");
                    }

                    if (poObj.cacId > 0)
                    {
                        var accrcv = await _context.AccountReceivables.FindAsync(poObj.arID);
                        var _cac = await _context.AccountingCodes.FindAsync(poObj.cacId);
                        if (_cac != null)
                        {
                            int actdaydiff = accrcv.arDate.CompareTo(_cac.startDate);
                            int inactdaydiff = accrcv.arDate.CompareTo(_cac.endDate != null ? _cac.endDate : Constants._DefaultEndDateTime);
                            if (actdaydiff < 0 || inactdaydiff > 0)
                            {
                                return BadRequest("Date recieved should be between CAC date range!");
                            }
                        }
                    }

                    if (string.IsNullOrEmpty(poObj.ihac))
                    {
                        var accrcv = await _context.AccountReceivables.FindAsync(poObj.arID);
                        var _cac = await _context.IHACCodes.FindAsync(poObj.ihac);
                        if (_cac != null)
                        {
                            int actdaydiff = accrcv.arDate.CompareTo(_cac.startDate);
                            int inactdaydiff = accrcv.arDate.CompareTo(_cac.endDate != null ? _cac.endDate : Constants._DefaultEndDateTime);
                            if (actdaydiff < 0 || inactdaydiff > 0)
                            {
                                return BadRequest("Date recieved should be between IHAC date range!");
                            }
                        }
                    }

                    var decRef = await _context.AccountReceivableDesc.FindAsync(id);
                    if (decRef != null)
                    {
                        //poObj.createdBy = decRef.createdBy;
                        //poObj.createdDate = decRef.createdDate;
                        _context.AccountReceivableDesc.Entry(decRef).State = EntityState.Detached;
                        _context.AccountReceivableDesc.Update(poObj);
                    }
                    else
                    {
                        return BadRequest("AccountReceivablesDesc does not exist");
                    }
                }

                await _context.SaveChangesAsync();
                var arRef = await _context.AccountReceivables.FindAsync(poObj.arID);
                await FundCalculation.CalculateAndStoreARLineBalance(id, _context);

                if (arRef != null)
                {

                }
                return Ok(poObj);


            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }

        }

        /// <summary>
        /// Delete account receivables desc
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpDelete("AccountReceivableDesc/{id}")]
        public async Task<ActionResult<bool>> DeleteAccountReceivableDesc(int id)
        {
            AccountReceivableDesc accountReceivableDesc = await _context.AccountReceivableDesc.FindAsync(id);
            var arRef = await _context.AccountReceivables.FindAsync(accountReceivableDesc.arID);

            if (accountReceivableDesc != null)
                _context.AccountReceivableDesc.Remove(accountReceivableDesc);

            await _context.SaveChangesAsync();
            await FundCalculation.CalcInvoiceBalance(arRef.ID, _context);
            return Ok(true);
        }

        /// <summary>
        /// If receipt number is empty get temp receipt number
        /// </summary>
        /// <returns></returns>
        [HttpGet("TemporaryReceiptNumber")]
        public ActionResult<string> GetTemporaryReceiptNumber()
        {

            //string recNo = string.IsNullOrEmpty(_context.CountyRevenue.Select(x => x.rev_Receipt_No).Max()) ? "00001" : (_context.CountyRevenue.Select(x => x.rev_Receipt_No).Max());
            //recNo = recNo.Split('-')[0].Replace("R", "");
            //var count = Convert.ToInt32(recNo);
            //var count = _context.CountyRevenue.Count() > 0 ? _context.CountyRevenue.OrderBy(x => x.ID).LastOrDefault()?.ID : 0;
            //var totalCount = count == 0 ? 1 : count;
            var nextSequence = _context.GetNextSequencevalue("countyrevenuesequence_" + OrgAccountId);
            var tl = nextSequence.ToString().Length;
            var tempstring = "0000";
            var tempstringCount = tempstring.Length;
            var take = tempstringCount - tl;
            var str1 = tempstring.Substring(tl, take);
            if (nextSequence == 0)
            {
                nextSequence = 0;
            }
            var str2 = str1 + nextSequence.ToString();
            var dtY = DateTime.Now.Year.ToString();

            return "R" + str2 + "-" + dtY.Substring(2);
        }

        /// <summary>
        /// If Invoice number is empty get temp Invoice number
        /// </summary>
        /// <returns></returns>
        [HttpGet("TemporaryInvoiceNumber")]
        public ActionResult<string> GetTemporaryInvoiceNumber()
        {

            //var recNo = string.IsNullOrEmpty(_context.AccountReceivables.Select(x => x.invoiceNo).Max()) ? "00001" : (_context.AccountReceivables.Select(x => x.invoiceNo).Max());
            //recNo = recNo.Split('-')[0].Replace("A", "");
            //var count = Convert.ToInt32(recNo);
            //var count = _context.AccountReceivables.Count() > 0 ? _context.AccountReceivables.OrderBy(x => x.ID).LastOrDefault()?.ID : 0;
            //var totalCount = count == 0 ? 1 : count;
            var nextSequence = _context.GetNextSequencevalue("accountreceivablesequence_" + OrgAccountId);
            var tl = nextSequence.ToString().Length;
            var tempstring = "0000";
            var tempstringCount = tempstring.Length;
            var take = tempstringCount - tl;
            var str1 = tempstring.Substring(tl, take);
            if (nextSequence == 0)
            {
                nextSequence = 0;
            }
            var str2 = str1 + nextSequence.ToString();
            var dtY = DateTime.Now.Year.ToString();

            return "A" + str2 + "-" + dtY.Substring(2);
        }
        [HttpPost]
        [Route("PostRevenue")]
        public async Task<ActionResult<string>> PostRevenue(DateTime startDate, DateTime endDate, DateTime postDate)
        {
            List<CountyRevenue> revenues = new List<CountyRevenue>();
            var usePost = await _context.SettingsValue.Where(v => v.settingsId == 48 ).Select(v => v.settingValue).FirstOrDefaultAsync();
            var useApprove = await _context.SettingsValue.Where(v => v.settingsId == 46 ).Select(v => v.settingValue).FirstOrDefaultAsync();
            if (usePost == "1")
            {
                revenues = await _context.CountyRevenue.Where(x => x.dateReceived.Date >= startDate.Date && x.dateReceived.Date <= endDate.Date && x.postDate == null).ToListAsync();
                foreach (var revenue in revenues)
                {
                    if (useApprove == "1" && revenue.status == 58)
                    {
                        revenue.postDate = postDate;
                    }
                    else if (useApprove == null || useApprove == "0")
                    {
                        revenue.postDate = postDate;
                    }
                }
                _context.CountyRevenue.UpdateRange(revenues);
                await _context.SaveChangesAsync();
                return Ok("Revenues Posted");
            }
            else
            {
                return BadRequest("Please enable configuration to use Post Revenue");
            }
        }
        [HttpPost]
        [Route("CalculateARLineItemBalance/{id}")]
        public async Task<ActionResult<string>> CalculateARLineItemBalance(int id)
        {
            var ar = await _context.AccountReceivables.FirstOrDefaultAsync(x =>x.ID == id);
            if (ar == null)
            {
                return BadRequest("AccountReceivables does not exist");
            }
            string response = await FundCalculation.CalcARLineItemBalance(ar.ID, OrgAccountId, _context);
            return Ok(response);
        }
        [HttpGet]
        [Route("GetPendingInvoicesForCustomer/{customerId}")]
        public async Task<ActionResult<IEnumerable<AccountReceivables>>> GetPendingInvoicesForCustomer(int customerId)
        {
            return await _context.AccountReceivables.Include(x => x.AccountReceivableDescs).Where(x => x.vendorID == customerId && x.balance != 0).ToListAsync();
        }
        [HttpPost]
        [Route("ApproveRevenues")]
        public async Task<ActionResult<string>> ApproveRevenues(List<int> ids)
        {
            var useApprove = await _context.SettingsValue.Where(v => v.settingsId == 46 ).Select(v => v.settingValue).FirstOrDefaultAsync();
            if (useApprove != null && useApprove == "1")
            {
                var revenues = await _context.CountyRevenue.Where(x => ids.Contains(x.ID) ).ToListAsync();
                foreach (var revenue in revenues)
                {
                    revenue.statusChangeDate = DateTime.Now;
                    revenue.status = Constants._Approved;
                    _context.CountyRevenue.Entry(revenue).State = EntityState.Detached;
                }
                _context.CountyRevenue.UpdateRange(revenues);
                await _context.SaveChangesAsync();
                return Ok("Approved");
            }
            else
            {
                return BadRequest("Enable configuration to approve revenues");
            }
        }
        [Route("RevenuesByProject/{projectId}")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CountyRevenue>>> GetRevenuesByProjectid(int projectId, bool desc, string sortKey = "modifiedDate", string? RevenueContrib = "", DateTime? dateReceived = null, string? revreceiptno = "", string? description = "", string? search = "", int skip = 0, int take = 0)
        {
            List<CountyRevenue> revenues = new List<CountyRevenue>();
            if (search == "")
            {
                revenues = await _context.CountyRevenue.Include(x => x.CountyRevenueDetails).Include(x => x.CountyRevenueContrib).Where(x =>
                       x.CountyRevenueContrib.name.Contains(string.IsNullOrEmpty(RevenueContrib) ? "" : RevenueContrib)
                        && x.rev_Receipt_No.Contains(string.IsNullOrEmpty(revreceiptno) ? "" : revreceiptno)
                        && (string.IsNullOrEmpty(description) || x.rev_Description.Contains(string.IsNullOrEmpty(description) ? "" : description))
                        && (dateReceived == null || x.dateReceived.Date == dateReceived.Value.Date)
                        && (projectId == null || x.CountyRevenueBD.Any(x => x.ProjectID == projectId))
                    ).OrderByCustom(sortKey, desc).ToListAsync();
            }
            else
            {
                search = string.IsNullOrEmpty(search) ? "" : search;
                revenues = await _context.CountyRevenue.Include(x => x.CountyRevenueDetails).Include(x => x.CountyRevenueContrib).Where(x =>
                         (x.CountyRevenueContrib.name.Contains(search)
                     || x.rev_Receipt_No.Contains(search)
                     || x.rev_Description.Contains(search))
                     && (projectId == null || x.CountyRevenueBD.Any(x => x.ProjectID == projectId))
                     ).OrderByCustom(sortKey, desc).ToListAsync();
            }
            foreach (var revenue in revenues)
            {
                revenue.totalBDAmount = await _context.CountyRevenueBD.Where(x => x.rev_ID == revenue.ID && x.ProjectID == projectId).Select(x => x.rev_BD_Amount).SumAsync();
            }
            if (take == 0)
            {
                return Ok(new { data = revenues, Total = revenues.Count });
            }
            else
            {
                return Ok(new { data = revenues.Skip(skip).Take(take).ToList(), Total = revenues.Count });

            }
        }

        [HttpGet("GetAllOtherDescription")]
        public async Task<ActionResult> GetAllOtherDescription()
        {
            //var data = new[]
            //{
            //    new {id=1,description = "other description 1" },
            //    new {id=2,description = "other description 2" },
            //    new {id=3,description = "other description 3" },
            //    new {id=4,description = "other description 4" },
            //    new {id=5,description = "other description 5" }


            //};
            var revData = await _context.OtherRevenueLookups.ToListAsync();
            return Ok(revData);
        }
    }
}


