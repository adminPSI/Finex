using FinexAPI.Data;
using FinexAPI.Models.IHPOs;
using FinexAPI.Models.PurchaseOrder;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FinexAPI.Models;
using Azure.Identity;
using Microsoft.AspNetCore.Authorization;
using System.Collections.Generic;
using FinexAPI.Helper;
using System;
using FinexAPI.Models.Voucher;
using FinexAPI.Formulas;
using FinexAPI.Models.Organization;
using FinexAPI.Dtos;

namespace FinexAPI.Controllers
{
    [Authorize]
    public class PurchaseOrderController : BaseController
    {
        private readonly FinexAppContext _context;
        

        public PurchaseOrderController(IHttpContextAccessor httpContextAccessor, FinexAppContext context)
            : base(httpContextAccessor)
        {
            _context = context;
        }


        [HttpGet("CountyPO")]
        public async Task<ActionResult<IEnumerable<CountyPO>>> GetPurchaseOrders(bool desc, bool poComplete, string sortKey = "modifiedDate", string? poNumber = "", string? description = "", string? poAmount = "", string? vendorName = "", string? balance = "", string? year = "", string? search = "", string? caccode = "", DateTime? openDate = null, DateTime? closeDate = null, bool carryover = false, int skip = 0, int take = 0)//need to confirm searchfilter 
        {
            ListResultController<CountyPO> _cmnCntrlr = new ListResultController<CountyPO>();
            int.TryParse(year, out var yearVal);
            //if (yearVal == 0)
            //    yearVal = DateTime.Now.Year;

            DateTime? poCom;
            if (poComplete == false)
            {
                poCom = null;
            }
            if (poNumber == "" && description == "" && poAmount == "" && vendorName == "" && balance == "" && caccode == "" && search == "" && openDate == null && closeDate == null && carryover == false)
            {
                var countyPOs = _context.CountyPO.Include(x => x.CountyPODetails)
                  .Include(x => x.CountyPODetails.Vendor)
                  .Include(x => x.CountyPOPricing)
                  .Include(x => x.CountyPODetails.AccountingCode)
                  .Where(p =>
                  p.OrgAccountId == OrgAccountId
                  //&& 
                  && p.poComplete == poComplete
                  );
                  
                  if(yearVal == 0)
                    countyPOs = countyPOs.Where(p=>p.poOpenDate.Year >= DateTime.Now.Year - 1);
                  else
                    countyPOs = countyPOs.Where(p => p.poOpenDate.Year == yearVal);

                countyPOs = countyPOs.OrderByCustom(sortKey, desc);
                return await _cmnCntrlr.returnResponse(take, skip, countyPOs, 0);
            }
            else if (carryover == true)
            {
                var countyPOs = _context.CountyPO.Include(x => x.CountyPODetails)
                  .Where(p =>
                  p.OrgAccountId == OrgAccountId
                  && p.CountyPODetails.carryOver == carryover);

                if (yearVal != 0)
                    countyPOs = countyPOs.Where(p => p.poOpenDate.Year == yearVal);

                countyPOs = countyPOs.OrderByCustom(sortKey, desc);

                return await _cmnCntrlr.returnResponse(take, skip, countyPOs, 0);
            }
            else if (search == "")
            {
                var countyPOs = _context.CountyPO.Include(x => x.CountyPODetails)
                        .Include(x => x.CountyPODetails.Vendor)
                        .Include(x => x.CountyPOPricing)
                        .Include(x => x.CountyPODetails.AccountingCode)
                        .Where(p =>
                        p.poNumber.Contains(string.IsNullOrEmpty(poNumber) ? "" : poNumber) &&
                        p.poAmount.ToString().Contains(string.IsNullOrEmpty(poAmount) ? "" : poAmount) &&
                        p.poDescription.Contains(string.IsNullOrEmpty(description) ? "" : description) &&
                        p.CountyPODetails.Vendor.name.Contains(string.IsNullOrEmpty(vendorName) ? "" : vendorName) &&
                        p.CountyPOPricing.poBalance.ToString().Contains(string.IsNullOrEmpty(balance) ? "" : balance) &&
                        p.CountyPODetails.AccountingCode.countyExpenseCode.Contains(string.IsNullOrEmpty(caccode) ? "" : caccode) &&
                        (openDate == null || p.poOpenDate.Date == openDate.Value.Date) &&
                        (closeDate == null || p.poCompleteDate.Value.Date == closeDate.Value.Date) &&
                        (yearVal == 0 || p.poOpenDate.Date.Year == yearVal) &&
                        p.OrgAccountId == OrgAccountId &&
                        p.poComplete == poComplete
                        ).OrderByCustom(sortKey, desc);


                return await _cmnCntrlr.returnResponse(take, skip, countyPOs, 0);
            }
            else
            {
                search = string.IsNullOrEmpty(search) ? "" : search;
                var countyPOs = _context.CountyPO.Include(x => x.CountyPODetails)
                        .Include(x => x.CountyPODetails.Vendor)
                        .Include(x => x.CountyPOPricing)
                        .Include(x => x.CountyPODetails.AccountingCode)
                        .Where(p =>
                  (p.poNumber.Contains(search) ||
                  p.poAmount.ToString().Contains(search) ||
                  p.poDescription.Contains(search) ||
                  p.CountyPODetails.Vendor.name.Contains(search) ||
                  p.CountyPODetails.AccountingCode.countyExpenseCode.Contains(search) ||
                  p.CountyPOPricing.poBalance.ToString().Contains(search))
                  && p.OrgAccountId == OrgAccountId
                  && (yearVal == 0 || p.poOpenDate.Date.Year == yearVal)
                  ).OrderByCustom(sortKey, desc);


                return await _cmnCntrlr.returnResponse(take, skip, countyPOs, 0);
            }
        }

        [Route("CountyPo/{id}")]
        [HttpGet]
        public async Task<ActionResult<CountyPO>> GetPurchaseOrder(int id)
        {
            var data = await _context.CountyPO.Include(x => x.CountyPODetails)
                           .Include(x => x.CountyPODetails.Vendor)
                           .Include(x => x.CountyPOPricing)
                           .Where(x => x.Id == id & x.OrgAccountId == OrgAccountId)
                           .FirstOrDefaultAsync();
            if (data == null)
            {
                return BadRequest("CountyPO does not exist");
            }
            return Ok(data);
        }

        [Route("CountyPo/POTypes")]
        [HttpGet]
        public async Task<ActionResult<CountyPOType>> GetPurchaseOrderTypes()
        {
                var data = await _context.CountyPOType
               .Where(x => x.OrgAccountId == OrgAccountId)
               .ToListAsync();
                if (data == null)
                {
                    return BadRequest("CountyPOTypes does not exist");
                }
                return Ok(data);
        }


        [HttpPost]
        public async Task<ActionResult<IEnumerable<CountyPO>>> PostCountyPO(CountyPO poObj)
        {

            try
            {
                if (poObj.poAmount < 0)
                {
                    return BadRequest("Negative value does not allowed");
                }
                if (poObj.CountyPODetails != null)
                {
                    var accountingCode = await _context.AccountingCodes.Where(x => x.Id == poObj.CountyPODetails.pocacid && x.OrgAccountId == OrgAccountId).FirstOrDefaultAsync();
                    if (accountingCode != null && poObj.poOpenDate.Date < accountingCode.startDate.Date)
                    {
                        return BadRequest("You can't select Future CAC");
                    }
                    decimal cacBalance = await FundCalculation.GetUnencumberedBalance(poObj.CountyPODetails.pocacid, poObj.poOpenDate.Year, _context);
                    if (poObj.poAmount > cacBalance)
                    {
                        return BadRequest("PO Amount cannot Exceed CAC Balance");
                    }
                }
                string[] codes = (poObj.ihac ?? "").Split('_');
                if ((poObj.ihac ?? "").Contains("-"))
                    codes = (poObj.ihac ?? "").Split('-');

                if (codes.Length > 3)
                {
                    var progRef = await _context.IHCPrograms.Where(x => x.code == codes[0] && x.OrgAccountId == OrgAccountId).FirstOrDefaultAsync();
                    if (progRef != null && poObj.poOpenDate.Date < progRef.startDate.Date)
                    {
                        return BadRequest("You can't add Inactive program");
                    }
                    var departmentRef = await _context.IHCDepartments.Where(x => x.code == codes[1] && x.OrgAccountId == OrgAccountId).FirstOrDefaultAsync();
                    if (departmentRef != null && poObj.poOpenDate.Date < departmentRef.startDate.Date)
                    {
                        return BadRequest("You can't add Inactive Department");
                    }
                    var accountRef = await _context.IHCAccounts.Where(x => x.code == codes[2] && x.OrgAccountId == OrgAccountId).FirstOrDefaultAsync();
                    if (accountRef != null && poObj.poOpenDate.Date < accountRef.startDate.Date)
                    {
                        return BadRequest("You can't add Inactive Account");
                    }
                    var subAccountRef = await _context.IHCSubAccounts.Where(x => x.code == codes[3] && x.OrgAccountId == OrgAccountId).FirstOrDefaultAsync();
                    if (subAccountRef != null && poObj.poOpenDate.Date < subAccountRef.startDate.Date)
                    {
                        return BadRequest("You can't add Inactive SubAccount");
                    }
                }
                var data = _context.CountyPO.Where(x => x.poNumber == poObj.poNumber && x.OrgAccountId == OrgAccountId).FirstOrDefault();
                if (data != null)
                {
                    return BadRequest("PO Number already Exists");
                }
                else
                {
                    poObj.OrgAccountId = OrgAccountId;
                    _context.CountyPO.Add(poObj);
                    await _context.SaveChangesAsync();

                }
                return Ok(poObj);


            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }


        [HttpPut("{id}")]
        public async Task<ActionResult<CountyPO>> PutPurchaseOrder(int id, CountyPO poObj)
        {
            if (poObj.poAmount < 0)
            {
                return BadRequest("Negative value does not allowed");
            }
            try
            {
                //11/28/2023
                if (poObj != null)
                {
                    if (poObj.Id != id)
                    {
                        return BadRequest("CountyPO does not match with id");
                    }
                    if (poObj.CountyPODetails != null)
                    {
                        var accountingCode = await _context.AccountingCodes.Where(x => x.Id == poObj.CountyPODetails.pocacid && x.OrgAccountId == OrgAccountId).FirstOrDefaultAsync();
                        if (accountingCode != null && poObj.poOpenDate.Date < accountingCode.startDate.Date)
                        {
                            return BadRequest("You can't select Future CAC");
                        }
                        decimal cacBalance = await FundCalculation.GetUnencumberedBalance(poObj.CountyPODetails.pocacid, poObj.poOpenDate.Year, _context);
                        if (poObj.poAmount > cacBalance)
                        {
                            return BadRequest("PO Amount cannot Exceed CAC Balance");
                        }
                    }
                    string[] codes = (poObj.ihac ?? "").Split('_');
                    if ((poObj.ihac ?? "").Contains("-"))
                        codes = (poObj.ihac ?? "").Split('-');

                    if (codes.Length > 3)
                    {
                        var progRef = await _context.IHCPrograms.Where(x => x.code == codes[0] && x.OrgAccountId == OrgAccountId).FirstOrDefaultAsync();
                        if (progRef != null && poObj.poOpenDate.Date < progRef.startDate.Date)
                        {
                            return BadRequest("You can't add Inactive program");
                        }
                        var departmentRef = await _context.IHCDepartments.Where(x => x.code == codes[1] && x.OrgAccountId == OrgAccountId).FirstOrDefaultAsync();
                        if (departmentRef != null && poObj.poOpenDate.Date < departmentRef.startDate.Date)
                        {
                            return BadRequest("You can't add Inactive Department");
                        }
                        var accountRef = await _context.IHCAccounts.Where(x => x.code == codes[2] && x.OrgAccountId == OrgAccountId).FirstOrDefaultAsync();
                        if (accountRef != null && poObj.poOpenDate.Date < accountRef.startDate.Date)
                        {
                            return BadRequest("You can't add Inactive Account");
                        }
                        var subAccountRef = await _context.IHCSubAccounts.Where(x => x.code == codes[3] && x.OrgAccountId == OrgAccountId).FirstOrDefaultAsync();
                        if (subAccountRef != null && poObj.poOpenDate.Date < subAccountRef.startDate.Date)
                        {
                            return BadRequest("You can't add Inactive SubAccount");
                        }
                    }
                    var poRef = await _context.CountyPO.FindAsync(poObj.Id);
                    var poNumber = "";
                    if (poRef != null)
                    {
                        poNumber = poRef.poNumber;
                    }
                    else
                    {
                        return BadRequest("CountyPO does not exist");
                    }
                    //discussed with Kesave to not change Open date on PO edit
                    poObj.poOpenDate = poRef.poOpenDate;
                    poObj.createdBy = poRef.createdBy;
                    poObj.createdDate = poRef.createdDate;
                    _context.CountyPO.Entry(poRef).State = EntityState.Detached;
                    poObj.OrgAccountId = OrgAccountId;
                    _context.CountyPO.Update(poObj);
                }

                await _context.SaveChangesAsync();
                await FundCalculation.CalculateAndStorePOBalance(poObj.Id, _context);
                return Ok(poObj);


            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message+", "+ex.StackTrace);
            }

        }


        [HttpDelete("{id}")]
        public async Task<ActionResult<bool>> DeletePurchaseOrder(int id)
        {
            var countyPO = await _context.CountyPO.FirstOrDefaultAsync(x => x.OrgAccountId == OrgAccountId && x.Id == id);
            if (countyPO != null)
            {
                var countyPODetails = await _context.CountyPODetails.Where(x => x.poId == id).FirstOrDefaultAsync();
                var countyPOPricing = await _context.CountyPOPricing.Where(x => x.poId == id).FirstOrDefaultAsync();
                var countyLineItem = await _context.CountyPOLineItem.Where(x => x.countyPOId == id).ToListAsync();

                List<IHPO> iHPOs = await _context.IHPO.Where(x => x.reqPOid == countyPO.Id).ToListAsync();
                List<Voucher> vouchers = await _context.vouchers.Where(x => x.poId == countyPO.Id).ToListAsync();
                if (iHPOs.Any() || vouchers.Any())
                {
                    return BadRequest("County Po is Attached with IHPO and Vocuher");
                }
                else
                {
                    if (countyPO != null)
                        _context.CountyPO.Remove(countyPO);
                    if (countyPODetails != null)
                        _context.CountyPODetails.Remove(countyPODetails);
                    if (countyPOPricing != null)
                        _context.CountyPOPricing.Remove(countyPOPricing);
                    if (countyLineItem != null)
                    {
                        foreach (var item in countyLineItem)
                        {
                            _context.CountyPOLineItem.Remove(item);
                        }

                    }
                    await _context.SaveChangesAsync();
                    return Ok(true);
                }
            }
            else
            {
                return BadRequest("County PO does not exist");
            }
        }


        [Route("PurchaseOrderLineItem/{poId}")]
        [HttpGet]

        public async Task<ActionResult<IEnumerable<CountyPOLineItem>>> GetPurchaseOrderLineItem(int poId, int? skip = null, int? pageCount = null)
        {
            var record = new List<CountyPOLineItem>();
            var config = await _context.SettingsValue.Where(x => x.settingsId == 17 && x.OrgAccountId == OrgAccountId).Select(x => x.settingValue).FirstOrDefaultAsync();
            if (config == null || config == "0")
            {
                return record;
            }
            var total = 0;
            if (skip != null && pageCount != null)
            {

                var query = await _context.CountyPO.Include(x => x.CountyPOLineItem)
                    .Where(x => x.Id == poId)
                    .Select(x => x.CountyPOLineItem).FirstOrDefaultAsync();
                total = query.Count;
                record = query.Skip(skip.Value).Take(pageCount.Value).ToList();
            }
            else
            {

                record = await _context.CountyPO.Include(x => x.CountyPOLineItem)
                     .Where(x => x.Id == poId)
                     .Select(x => x.CountyPOLineItem).FirstOrDefaultAsync();
                total = record.Count;

            }

            return Ok(new { record, total });
        }


        [HttpPut("PurchaseOrderLineItem/{cId}")]
        public async Task<ActionResult<CountyPOLineItem>> PutPurchaseOrderLineItem(int cId, CountyPOLineItem poObj)
        {
            if (poObj.poAmount < 0 || poObj.poPrice < 0 || poObj.poDiscount < 0 || (poObj.poQuantity != null && int.Parse(poObj.poQuantity) < 0))
            {
                return BadRequest("Negative values does not allow");
            }
            if (cId != poObj.cId)
            {

                return BadRequest("PurchaseOrderLineItem does not match with id");
            }
            var lineRef = await _context.CountyPOLineItem.FindAsync(cId);

            if (lineRef != null)
            {
                if (poObj.poQuantity != null)
                {
                    poObj.poAmount = (Int32.Parse(poObj.poQuantity) * poObj.poPrice) - poObj.poDiscount;
                }
                poObj.createdBy = lineRef.createdBy;
                poObj.createdDate = lineRef.createdDate;
                _context.CountyPOLineItem.Entry(lineRef).State = EntityState.Detached;
                _context.CountyPOLineItem.Update(poObj);
                await _context.SaveChangesAsync();
                return Ok(poObj);
            }
            else
            {
                return BadRequest("PurchaseOrderLineItem does not exist");
            }
        }

        [Route("PurchaseOrderLineItem")]
        [HttpPost]
        public async Task<ActionResult<CountyPOLineItem>> PostPurchaseOrderLineItem(CountyPOLineItem poObj)
        {
            if (poObj.poAmount < 0 || poObj.poPrice < 0 || poObj.poDiscount < 0 || (poObj.poQuantity != null && int.Parse(poObj.poQuantity) < 0))
            {
                return BadRequest("Negative values does not allow");
            }
            if (poObj.poQuantity != null)
            {
                poObj.poAmount = (Int32.Parse(poObj.poQuantity) * poObj.poPrice) - poObj.poDiscount;
            }
            _context.CountyPOLineItem.Add(poObj);
            await _context.SaveChangesAsync();
            return Ok(poObj);

        }



        [Route("PurchaseOrderLineItem/{id}")]
        [HttpDelete]
        public async Task<ActionResult<bool>> DeletePurchaseOrderLineItem(int id)
        {
            var data = _context.CountyPOLineItem.Where(x => x.cId == id).FirstOrDefault();
            if (data == null)
            {
                return BadRequest("PurchaseOrderLineItem does not exist");
            }
            else
            {

                _context.CountyPOLineItem.Remove(data);
                await _context.SaveChangesAsync();
                return Ok(true);
            }

        }


        [Route("POLiquidate/{poId}")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<POLiquidate>>> GetPOLiquidates(int poId)
        {
            List<POLiquidate> liquidates = new List<POLiquidate>();
            var config = await _context.SettingsValue.Where(x => x.settingsId == 26 && x.OrgAccountId == OrgAccountId).Select(x => x.settingValue).FirstOrDefaultAsync();
            if (config != null && config == "1")
            {
                return liquidates;
            }
            liquidates = await _context.POLiquidate.Include(x => x.CountyPO)
                               .Where(x => x.CountyPO.Id == poId)
                               .ToListAsync();
            return Ok(liquidates);
        }
        [Route("POLiquidate")]
        [HttpGet]
        public async Task<ActionResult<POLiquidate>> GetPOLiquidate(int id)
        {
            var liquidate = await _context.POLiquidate.FindAsync(id);
            if (liquidate == null)
            {
                return BadRequest("POLiquidate does not exist");
            }
            return liquidate;
        }
        [Route("POLiquidate")]
        [HttpPost]
        public async Task<ActionResult<POLiquidate>> CreatePOLiquidate(POLiquidate poliquidate)
        {
            if (poliquidate == null)
            {
                return BadRequest("POLiquidate does not exist");
            }
            var poRef = await _context.CountyPOPricing.FirstOrDefaultAsync(x => x.poId == poliquidate.countyPOId);
            if (poRef != null && poRef.poBalance < poliquidate.amount)
            {
                return BadRequest("PO Liquidation can't exceed PO Balance");
            }
            _context.POLiquidate.Add(poliquidate);
            await _context.SaveChangesAsync();
            await FundCalculation.CalculateAndStorePOBalance((int)poliquidate.countyPOId, _context);
            return CreatedAtAction("GetPOLiquidate", new { id = poliquidate.ID }, poliquidate);
        }
        [Route("POLiquidate/{id}")]
        [HttpPut]
        public async Task<ActionResult<POLiquidate>> UpdatePOLiquidate(int id, POLiquidate poLiquidate)
        {
            if (id != poLiquidate.ID)
            {
                return BadRequest("POLiquidate does not match with id");
            }
            var liquidateRef = await _context.POLiquidate.FindAsync(id);
            if (liquidateRef == null)
            {
                return BadRequest("POLiquidate does not exist");
            }
            var poRef = await _context.CountyPOPricing.FirstOrDefaultAsync(x => x.poId == poLiquidate.countyPOId);
            if (poRef != null && poRef.poBalance < poLiquidate.amount)
            {
                return BadRequest("PO Liquidation can't exceed PO Balance");
            }
            _context.POLiquidate.Entry(liquidateRef).State = EntityState.Detached;
            _context.POLiquidate.Update(poLiquidate);
            await _context.SaveChangesAsync();
            await FundCalculation.CalculateAndStorePOBalance((int)poLiquidate.countyPOId, _context);
            return CreatedAtAction("GetPOLiquidate", new { id = poLiquidate.ID }, poLiquidate);
        }
        [Route("POLiquidate")]
        [HttpDelete]
        public async Task<ActionResult<string>> DeletePOLiquidate(int id)
        {
            var liquidate = await _context.POLiquidate.FindAsync(id);
            if (liquidate == null)
            {
                return BadRequest("POLiquidate does not exist");
            }
            _context.POLiquidate.Remove(liquidate);
            await _context.SaveChangesAsync();
            await FundCalculation.CalculateAndStorePOBalance((int)liquidate.countyPOId, _context);
            return "Deleted Successfully";
        }

        [Route("DoubleEncumerance/{id}")]
        [HttpGet]
        public async Task<ActionResult<decimal>> CalculateDoubleEncumerance(int id)
        {
            var countyPo = await _context.CountyPO.FindAsync(id);
            if (countyPo != null)
            {
                var tVoucherAmount = await _context.vouchers.Where(x => x.poId == id).
                    SumAsync(x => x.voucherAmount);

                var pOLiquidatesSum = await _context.POLiquidate.Include(x => x.CountyPO)
                                              .Where(x => x.CountyPO.Id == id)
                                             .SumAsync(x => x.amount);

                var iHPOs = await _context.IHPOLineItem.Where(x => x.poid == id).Select(x => x.reqDTotal).SumAsync();
                decimal reqAmount = 0;
                var doubleEncum = countyPo.poAmount - (tVoucherAmount + pOLiquidatesSum + iHPOs);
                return doubleEncum;
            }
            else
            {
                return 0;
            }

        }


        [HttpGet("PoAttention")]
        public async Task<ActionResult<IEnumerable<POAttention>>> GetPOAttention()
        {
            return await _context.POAttention.ToListAsync();
        }


        [HttpGet("TemporaryPONumber")]
        public ActionResult<string> GetTemporaryPONumber()
        {
            var nextSequence = _context.GetNextSequencevalue("posequence_" + OrgAccountId);
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

            return "P" + str2 + "-" + dtY.Substring(2);
        }

        [HttpGet("DirectInq")]
        public async Task<ActionResult<IEnumerable<PODirectInq>>> GetPODirectInq()
        {
            return await _context.PODirectInq.ToListAsync();
        }
        [HttpGet("Deputy")]
        public async Task<ActionResult<IEnumerable<PODeputy>>> GetPODeputy()
        {
            return await _context.PODeputy.ToListAsync();
        }

        [HttpGet("ShipTo")]
        public async Task<ActionResult<IEnumerable<PODeliverTo>>> GetShipTo()
        {
            return await _context.PODeliverTo.ToListAsync();
        }

        [HttpGet("POBalance")]
        public async Task<ActionResult<decimal>> GetPOBalance(int id, decimal poamount, bool pocomplete)
        {
            var recordPO = await _context.CountyPO.FindAsync(id);
            var recordPricing = await _context.CountyPO.Include(x => x.CountyPOPricing).Where(x => x.Id == id)
                .Select(x => x.CountyPOPricing).FirstOrDefaultAsync();
            decimal balance = 0;
            if (recordPricing != null)
            {
                var voucherAmount = await _context.vouchers.Where(x => x.poId == id).SumAsync(x => x.voucherAmount);
                var pOLiquidatesSum = await _context.POLiquidate.Include(x => x.CountyPO)
                                              .Where(x => x.CountyPO.Id == id)
                                             .SumAsync(x => x.amount);
                balance = poamount - (pOLiquidatesSum == null ? 0 : pOLiquidatesSum) - (voucherAmount == null ? 0 : voucherAmount.Value);

                if (pocomplete == true)
                {
                    recordPO.poComplete = true;
                    _context.CountyPO.Update(recordPO);


                    recordPricing.poBalance = 0;
                    recordPricing.closingBalance = balance;
                    _context.CountyPOPricing.Update(recordPricing);

                    balance = 0;
                }
                else
                {
                    recordPricing.poBalance = balance;
                    recordPricing.closingBalance = 0;
                    _context.CountyPOPricing.Update(recordPricing);

                }
                _context.SaveChanges();
            }
            else
            {
                return BadRequest("PurchaseOrder does not exist");
            }
            return balance;


        }
        [Route("UnencumberedBalance/{cacId}/{poOpenDate}")]
        [HttpGet]
        public async Task<ActionResult<decimal>> GetCACUnencumberedBalance(int cacId, DateTime? poOpenDate)
        {
            var year = poOpenDate ==null ? DateTime.Now.Year : poOpenDate!.Value.Year;

            decimal cacAmount = await _context.BudgetAmounts.Where(x => x.accountingCodeId == cacId && x.startDate.Year == year).SumAsync(x => x.amount);
            decimal voucherAmount = await _context.vouchers.Where(x => x.poCACId == cacId && x.voucherWrittenDate.Year == year).SumAsync(x => x.voucherAmount)??0;
            var countyPODetails = await _context.CountyPODetails.Where(x => x.pocacid == cacId && x.CountyPO.poOpenDate.Year == year).Select(x => x.poId).ToListAsync();
            decimal poBalance = (decimal)await _context.CountyPOPricing.Where(x => countyPODetails.Contains(x.poId) && x.CountyPO.poOpenDate.Year == year).SumAsync(x => x.poBalance);

            return cacAmount - voucherAmount - poBalance;
        }
        [Route("CloseCurrentPo")]
        [HttpPut]
        public async Task<ActionResult<string>> ClosePO([FromBody] CloseCurrentPODto currentPODto)
        {
            var po = await _context.CountyPO.FindAsync(currentPODto.poId);
            if (po == null)
            {
                BadRequest("PurchaseOrder does not exist");
            }
            po.poComplete = true;
            po.poCompleteDate = DateTime.Now;
            _context.CountyPO.Update(po);
            await _context.SaveChangesAsync();
            return Ok("PO Closed");
        }
        [Route("ClosePo/{poId}")]
        [HttpGet]
        public async Task<ActionResult<string>> ClosePO(int poId)
        {
            var po = await _context.CountyPO.FindAsync(poId);
            if (po == null)
            {
                BadRequest("PurchaseOrder does not exist");
            }
            po.poComplete = true;
            po.poCompleteDate = DateTime.Now;
            _context.CountyPO.Update(po);
            await _context.SaveChangesAsync();
            return Ok("PO Closed");
        }
        [Route("OpenPo/{poId}")]
        [HttpPut]
        public async Task<ActionResult<string>> OpenPO(int poId)
        {
            var po = await _context.CountyPO.FindAsync(poId);
            if (po == null)
            {
                BadRequest("PurchaseOrder does not exist");
            }
            po.poComplete = false;
            po.poCompleteDate = null;
            _context.CountyPO.Update(po);
            await _context.SaveChangesAsync();
            return Ok("PO Opened");
        }
    }
}
