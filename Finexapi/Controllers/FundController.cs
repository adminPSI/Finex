using FinexAPI.Common;
using FinexAPI.Data;
using FinexAPI.Formulas;
using FinexAPI.Helper;
using FinexAPI.Models;
using FinexAPI.Models.Payroll;
using FinexAPI.Models.PurchaseOrder;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authorization.Infrastructure;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using System;
using System.Linq;
using System.Security.Cryptography.Xml;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace FinexAPI.Controllers
{
    [Authorize]
    public class FundController : BaseController
    {
        private readonly FinexAppContext _context;
      
        public FundController(IHttpContextAccessor httpContextAccessor, FinexAppContext context)
            : base(httpContextAccessor)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Fund>>> GetFunds()
        {
            return await _context.Funds
                .OrderByDescending(x => x.modifiedDate).ToListAsync();
        }

        [Route("codes")]
        [HttpGet]
        public async Task<IActionResult> GetFundCodes()
        {
            var fundLst = await _context.Funds.Where(x => x.isActive == "Y")
                                              .OrderByDescending(x => x.modifiedDate)
                                              .Select(x => new { id = x.id, fundCode = x.fundCode, fundname = x.fundName })
                                              .ToListAsync();
            return Ok(fundLst);
        }

        [Route("Filter")]
        [HttpPost]
        public async Task<ActionResult> Filter(bool desc, string sortKey = "modifiedDate", string? isActive = "", string? code = "", string? fundname = ""
            , string? search = "", DateTime? startDate = null, int skip = 0, int take = 0, DateTime? inactiveDate = null)
        {
            ListResultController<Fund> _cmnCntrlr = new ListResultController<Fund>();
            if (search == "")
            {
                var fundLst = _context.Funds.Where(p => p.fundCode.Contains(string.IsNullOrEmpty(code) ? "" : code)
                && p.fundName.Contains(string.IsNullOrEmpty(fundname) ? "" : fundname)
                && (startDate == null || p.activeDate.Date == startDate.Value.Date)
                && (inactiveDate == null || (p.inactiveDate.HasValue && p.inactiveDate.Value.Date == inactiveDate.Value.Date))
                && p.isActive.Contains(string.IsNullOrEmpty(isActive) ? "" : isActive)).OrderByCustom(sortKey, desc);


                return await _cmnCntrlr.returnResponse(take, skip, fundLst, 0);
            }
            else
            {
                search = string.IsNullOrEmpty(search) ? "" : search;
                var List = _context.Funds.Where(p =>
                (p.fundCode.Contains(search) ||
                p.fundName.Contains(search)) &&
                p.isActive.Contains(string.IsNullOrEmpty(isActive) ? "" : isActive)).OrderByCustom(sortKey, desc);


                return await _cmnCntrlr.returnResponse(take, skip, List, 0);
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Fund>> GetFund(int id)
        {
            var fund = await _context.Funds.FirstOrDefaultAsync(x => x.id == id);

            if (fund == null)
            {
                return BadRequest("Fund does not exist");
            }

            return fund;
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutFund(int id, Fund fund)
        {
            if (id != fund.id)
            {
                return BadRequest("Fund does not match with id");
            }
            var fundRef = await _context.Funds.FirstOrDefaultAsync(x => x.id == id);
            if (fundRef == null)
            {
                return BadRequest("Fund does not exist");
            }
            fund.createdBy = fundRef.createdBy;
            fund.createdDate = fundRef.createdDate;
            _context.Funds.Entry(fundRef).State = EntityState.Detached;
            if (fund.inactiveDate.HasValue)
            {
                if (fund.inactiveDate.Value.Date == DateTime.Today)
                {
                    fund.isActive = "N";
                }
                else
                {
                    fund.isActive = "Y";
                }
            }
            _context.Funds.Update(fund);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)

            {
                if (!FundExists(id))
                {
                    return BadRequest("Fund does not exist");
                }

                else
                {
                    throw;
                }
            }


            return CreatedAtAction("GetFund", new { id = fund.id }, fund);
        }

        [HttpPost]
        public async Task<ActionResult<Fund>> PostFund(Fund fund)
        {
            var fundRec = await _context.Funds.Where(x => x.fundCode == fund.fundCode).FirstOrDefaultAsync();
            if (fundRec == null)
            {
                _context.Funds.Add(fund);
                await _context.SaveChangesAsync();
                return CreatedAtAction("GetFund", new { id = fund.id }, fund);
            }
            else
            {
                return BadRequest("Fund code Already Exist");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<Fund>> DeleteFund(int id)
        {
            var fund = await _context.Funds.FirstOrDefaultAsync(x => x.id == id);
            if (fund == null)
            {
                return BadRequest("Fund does not exist");
            }

            _context.Funds.Remove(fund);
            await _context.SaveChangesAsync();

            return fund;
        }

        [Route("Transfer")]
        [HttpPost]
        public async Task<ActionResult<string>> PostTransfer(Transfer transfer)
        {
            var fromFund = await _context.Funds.FindAsync(transfer.fromFundId);
            if (fromFund != null)
            {
                int actdaydiff = transfer.date.CompareTo(fromFund.activeDate.Date);
                int inactdaydiff = transfer.date.CompareTo(fromFund.inactiveDate != null ? fromFund.inactiveDate : Constants._DefaultEndDateTime);
                if (actdaydiff < 0 || inactdaydiff > 0)
                {
                    return BadRequest("Fund should be active for the date of transfer!");
                }
            }
            var toFund = await _context.Funds.FindAsync(transfer.toFundId);
            if (toFund != null)
            {
                int toactdaydiff = transfer.date.CompareTo(toFund.activeDate.Date);
                int toinactdaydiff = transfer.date.CompareTo(toFund.inactiveDate != null ? toFund.inactiveDate : Constants._DefaultEndDateTime);
                if ((toactdaydiff < 0 || toinactdaydiff > 0))
                {
                    return BadRequest("Fund should be active for the date of transfer!");
                }
            }
            decimal fundAmount = await _context.CashBalances.Where(x => x.fundId == fromFund.id).SumAsync(x => x.amount);
            if (transfer.amount <= fundAmount)
            {
                CashBalance fromCashBalance = new CashBalance();
                fromCashBalance.fundId = transfer.fromFundId;
                fromCashBalance.amount = -transfer.amount;
                fromCashBalance.startDate = transfer.date;
                fromCashBalance.notes = "Transferred amount $" + transfer.amount + " from Fund Code:" + fromFund.fundCode + " to Fund Code:" + toFund.fundCode;
                fromCashBalance.typeCode = transfer.transferTypeCode;
                _context.CashBalances.Add(fromCashBalance);

                CashBalance toCashBalance = new CashBalance();
                toCashBalance.fundId = transfer.toFundId;
                toCashBalance.amount = transfer.amount;
                toCashBalance.startDate = transfer.date;
                toCashBalance.typeCode = transfer.transferTypeCode;
                toCashBalance.notes = "Transferred amount $" + transfer.amount + " from FundCode:" + fromFund.fundCode + " to Fund Code:" + toFund.fundCode;
                _context.CashBalances.Add(toCashBalance);

                await _context.SaveChangesAsync();

                return CreatedAtAction("PostTransfer", "True");
            }
            else
            {
                return BadRequest("Transfer amount should not exceed fund amount");
            }
        }

        //for cashbalances

        [Route("{fundid}/cashbalance")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CashBalance>>> GetCashBalances(int fundid)
        {
            return await _context.CashBalances.Where(p => p.fundId.Equals(fundid)).OrderByDescending(x => x.startDate).ThenByDescending(x => x.modifiedDate).ToListAsync();
        }

        [Route("{fundid}/cashbalance")]
        [HttpPost]
        public async Task<ActionResult<CashBalance>> PostCashBalance(CashBalance cashBalance)
        {
            if (cashBalance.amount < 0)
            {
                return BadRequest("Negative value does not allow");
            }
            if (cashBalance.fundId > 0)
            {
                var _fund = await _context.Funds.FindAsync(cashBalance.fundId);
                if (_fund != null)
                {
                    int actdaydiff = cashBalance.startDate.CompareTo(_fund.activeDate.Date);
                    int inactdaydiff = cashBalance.startDate.CompareTo(_fund.inactiveDate != null ? _fund.inactiveDate : Constants._DefaultEndDateTime);
                    if (actdaydiff < 0 || inactdaydiff > 0)
                    {
                        return BadRequest("Your Fund should be active for Cash balance date!");
                    }
                }
            }
            if (cashBalance.id > 0)
            {
                var balance = await _context.CashBalances.FirstOrDefaultAsync(x => x.id == cashBalance.id);
                if (balance != null)
                {
                    balance.startDate = cashBalance.startDate;
                    balance.amount = cashBalance.amount;
                    _context.CashBalances.Update(balance);
                    await _context.SaveChangesAsync();
                }
                return balance;
            }
            else
            {
                _context.CashBalances.Add(cashBalance);
                await _context.SaveChangesAsync();
                return cashBalance;
            }
        }

        [Route("{fundid}/cashbalance")]
        [HttpDelete]
        public async Task<ActionResult<string>> DeleteCashBalances(int fundid)
        {

            List<CashBalance> deleteList = _context.CashBalances.Where(p => p.fundId.Equals(fundid)).ToList<CashBalance>();

            _context.CashBalances.RemoveRange(deleteList);

            await _context.SaveChangesAsync();
            return CreatedAtAction("DeleteCashBalances", "True");

        }

        [Route("cashbalance/{id}")]
        [HttpDelete]
        public async Task<ActionResult<string>> DeleteCashBalance(int id)
        {

            var balance = await _context.CashBalances.FindAsync(id);
            if (balance == null)
            {
                return BadRequest("CashBalance does not exist");
            }
            _context.CashBalances.Remove(balance);
            await _context.SaveChangesAsync();
            return Ok("Deleted Successfully");

        }

        [Route("/api/fund/cashbalance/{cashBalanceID}")]
        [HttpGet]
        public async Task<IActionResult> GetCashBalanceByID(int cashBalanceID)
        {
            var budgetAmt = await _context.CashBalances.FirstOrDefaultAsync(p => p.id == cashBalanceID, cancellationToken: default);
            return Ok(budgetAmt);
        }

        //for AccountingCodes

        [Route("/api/accountingcodes")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AccountingCode>>> GetAccountingCodes()
        {
            return await _context.AccountingCodes.Include(ac => ac.Fund).ToListAsync();
        }

        [Route("/api/accountingcodes/{accountingcodetype}/")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AccountingCode>>> GetAccountingCodes(int fundid, int accountingcodetype)
        {
            return await _context.AccountingCodes.Include(ac => ac.Fund)
                                                 .Where(p => p.typeCode.Equals(accountingcodetype) && p.isActive.Equals("Y"))
                                                 .OrderByDescending(x => x.modifiedDate).ToListAsync();
        }

        [Route("/api/accountingcode/{accountingcodeid}")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AccountingCode>>> GetAccountingCodeByID(int accountingcodeid)
        {
            return await _context.AccountingCodes.Include(ac => ac.Fund)
                .Where(p => p.Id.Equals(accountingcodeid))
                .ToListAsync();
        }

        [Route("/api/accountingcodes")]
        [HttpPost]
        public async Task<ActionResult<AccountingCode>> PostAccountingCode(AccountingCode accountingCode)
        {
           
            if (accountingCode.Id > 0)
            {
                var accounting = _context.AccountingCodes.Where(o => o.Id == accountingCode.Id && o.typeCode == accountingCode.typeCode).FirstOrDefault();
                if (accounting != null)
                {
                    accounting.isActive = accountingCode.isActive;
                    accounting.countyExpenseCode = accountingCode.countyExpenseCode;
                    accounting.countyExpenseDescription = accountingCode.countyExpenseDescription;
                    accounting.startDate = accountingCode.startDate;
                    accounting.FundId = accountingCode.FundId;
                    accounting.endDate = accountingCode.endDate;

                    if (accounting.endDate==null)
                    {
                        var fund = await _context.Funds.Where(x => x.id == accountingCode.FundId).FirstOrDefaultAsync();
                        if (fund != null && accountingCode.startDate.Date.CompareTo(fund.activeDate.Date) < 0)
                        {
                            return BadRequest("You can't add Inactive Fund");
                        }
                    }

                    if (accountingCode.endDate.HasValue)
                    {
                        if (accountingCode.endDate.Value.Date == DateTime.Today)
                        {
                            accounting.isActive = "N";
                        }
                        else
                        {
                            accounting.isActive = "Y";
                        }
                    }
                    _context.AccountingCodes.Update(accounting);
                    await _context.SaveChangesAsync();
                }
                var Budget = _context.BudgetAmounts.Where(o => o.accountingCodeId == accountingCode.Id).FirstOrDefault();
                if (Budget != null)
                {
                    Budget.startDate = accountingCode.startDate;
                    _context.BudgetAmounts.Update(Budget);
                    await _context.SaveChangesAsync();
                }
                return accountingCode;
            }
            else
            {
                var fund = await _context.Funds.Where(x => x.id == accountingCode.FundId).FirstOrDefaultAsync();
                if (fund != null && accountingCode.startDate.Date.CompareTo(fund.activeDate.Date) < 0)
                {
                    return BadRequest("You can't add Inactive Fund");
                }

                var accountingCodeRec = await _context.AccountingCodes.Where(x => x.countyExpenseCode == accountingCode.countyExpenseCode && x.typeCode == accountingCode.typeCode).FirstOrDefaultAsync();
                if (accountingCodeRec == null)
                {
                    _context.AccountingCodes.Add(accountingCode);
                    await _context.SaveChangesAsync();
                    return accountingCode;
                }
                else
                {
                    return BadRequest("CountyExpenseCode Already Exist");
                }
            }
        }

        //for BudgetAmounts

        [Route("/api/accountingcodes/{accountingcodeid}/budgetamount")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BudgetAmount>>> GetBudgetAmounts(int accountingcodeid)
        {
            return await _context.BudgetAmounts.Where(p => p.accountingCodeId.Equals(accountingcodeid)).OrderByDescending(x => x.startDate).ThenByDescending(x => x.modifiedDate).ToListAsync();
        }

        [Route("/api/accountingcodes/budgetamount/{budgetID}")]
        [HttpGet]
        public async Task<IActionResult> GetBudgetAmountByID(int budgetID)
        {
            var budgetAmt = await _context.BudgetAmounts.FirstOrDefaultAsync(p => p.Id == budgetID, cancellationToken: default);
            return Ok(budgetAmt);
        }

        [Route("/api/accountingcodes/{accountingcodeid}/budgetamount")]
        [HttpPost]
        public async Task<ActionResult<BudgetAmount>> PostBudgetAmount(BudgetAmount budgetAmount)
        {
            //if (budgetAmount.amount < 0)
            //{
            //    return BadRequest("Negative value does not allow");
            //}

            if (budgetAmount.accountingCodeId > 0)
            {
                var _cac = await _context.AccountingCodes.FindAsync(budgetAmount.accountingCodeId);
                if (_cac != null)
                {
                    int actdaydiff = budgetAmount.startDate.CompareTo(_cac.startDate);
                    int inactdaydiff = budgetAmount.startDate.CompareTo(_cac.endDate != null ? _cac.endDate : Constants._DefaultEndDateTime);
                    if (actdaydiff < 0 || inactdaydiff > 0)
                    {
                        return BadRequest("Your CAC should be active for Cash balance date!");
                    }
                }
            }
            if (budgetAmount.Id > 0)
            {
                var Budget = _context.BudgetAmounts.Where(o => o.Id == budgetAmount.Id).FirstOrDefault();
                if (Budget != null)
                {
                    Budget.startDate = budgetAmount.startDate;
                    Budget.amount = budgetAmount.amount;
                    Budget.notes = budgetAmount.notes;
                    _context.BudgetAmounts.Update(Budget);
                    await _context.SaveChangesAsync();
                }
                var accounting = _context.AccountingCodes.Where(o => o.Id == budgetAmount.accountingCodeId).FirstOrDefault();
                if (accounting != null)
                {
                    accounting.startDate = accounting.startDate;
                    _context.AccountingCodes.Update(accounting);
                    await _context.SaveChangesAsync();
                }
                return budgetAmount;
            }
            else
            {
                _context.BudgetAmounts.Add(budgetAmount);
                await _context.SaveChangesAsync();
                return budgetAmount;
            }

        }

        [Route("/api/accountingcodes/budgetamount/{id}")]
        [HttpDelete]
        public async Task<ActionResult<string>> DeleteBudgetAmount(int id)
        {

            var amount = await _context.BudgetAmounts.FindAsync(id);
            if (amount == null)
            {
                return BadRequest("BudgetAmounts does not exist");
            }
            _context.BudgetAmounts.Remove(amount);
            await _context.SaveChangesAsync();
            return Ok("Deleted Successfully");
        }

        [Route("accountingcodesFilter")]
        [HttpPost]
        public async Task<ActionResult> GetAccountingcodesFilter(int accountingcodetype, bool desc, string sortKey = "modifiedDate", string? isActive = "", string? description = "", string? code = "", string? fundCode = "", string? search = "", DateTime? startDate = null, int skip = 0, int take = 0, DateTime? inactiveDate = null)
        {
            ListResultController<AccountingCode> _cmnCntrlr = new ListResultController<AccountingCode>();
            if (search == "")
            {
                var list = _context.AccountingCodes.Include(ac => ac.Fund).Where(a =>  a.countyExpenseDescription.Contains(string.IsNullOrEmpty(description) ? "" : description)
                && a.isActive.Contains(string.IsNullOrEmpty(isActive) ? "" : isActive)
                && (startDate == null || a.startDate.Date == startDate.Value.Date)
                && a.Fund.fundCode.Contains(string.IsNullOrEmpty(fundCode) ? "" : fundCode)
                && a.countyExpenseCode.Contains(string.IsNullOrEmpty(code) ? "" : code) && a.typeCode.Equals(accountingcodetype))
                    .OrderByCustom(sortKey, desc);
                return await _cmnCntrlr.returnResponse(take, skip, list, 0);
            }
            else
            {
                var list =  _context.AccountingCodes.Include(ac => ac.Fund).Where(a => 
                   (a.countyExpenseDescription.Contains(string.IsNullOrEmpty(search) ? "" : search)
                   || a.Fund.fundCode.Contains(string.IsNullOrEmpty(search) ? "" : search)
                    || a.countyExpenseCode.Contains(string.IsNullOrEmpty(search) ? "" : search))
                    && a.isActive.Contains(string.IsNullOrEmpty(isActive) ? "" : isActive)
                    && a.typeCode.Equals(accountingcodetype))
                    .OrderByCustom(sortKey, desc);
                return await _cmnCntrlr.returnResponse(take, skip, list, 0);
            }
        }

        private bool FundExists(int id)
        {
            return _context.Funds.Any(e => e.id == id);
        }




        [Route("/api/accountingcode/Transfer")]
        [HttpPost]
        public async Task<ActionResult<string>> PostTransfer(TransferExpenseAmount transfer)
        {
            var fromAccountCode = await _context.AccountingCodes.FindAsync(transfer.fromExpenseId);
            if (fromAccountCode != null)
            {
                int actdaydiff = transfer.date.CompareTo(fromAccountCode.startDate.Date);
                int inactdaydiff = transfer.date.CompareTo(fromAccountCode.endDate != null ? fromAccountCode.endDate : Constants._DefaultEndDateTime);
                if (actdaydiff < 0 || inactdaydiff > 0)
                {
                    return BadRequest("You couldn't Transfer Amount for Future Accounting code");
                }
            }
            var toAccountCode = await _context.AccountingCodes.FindAsync(transfer.toExpenseId);
            if (toAccountCode != null)
            {
                int toactdaydiff = transfer.date.CompareTo(toAccountCode.startDate.Date);
                int toinactdaydiff = transfer.date.CompareTo(toAccountCode.endDate != null ? toAccountCode.endDate : Constants._DefaultEndDateTime);
                if ((toactdaydiff < 0 || toinactdaydiff > 0))
                {
                    return BadRequest("You couldn't Transfer Amount for Future Accounting code");
                }
            }




            decimal amount = await _context.BudgetAmounts.Where(x => x.accountingCodeId == fromAccountCode.Id).SumAsync(x => x.amount);
            if (transfer.amount <= amount)
            {

                BudgetAmount transferFromBudget = new BudgetAmount();
                transferFromBudget.accountingCodeId = transfer.fromExpenseId;
                transferFromBudget.amount = -transfer.amount;
                transferFromBudget.startDate = transfer.date;
                transferFromBudget.typeCode = transfer.transferTypeCode;
                transferFromBudget.notes = "Transferred amount $" + transfer.amount + " from CAC Code: " + fromAccountCode.countyExpenseCode + " to CAC Code: " + toAccountCode.countyExpenseCode;
                _context.BudgetAmounts.Add(transferFromBudget);

                BudgetAmount transferToBudget = new BudgetAmount();
                transferToBudget.accountingCodeId = transfer.toExpenseId;
                transferToBudget.amount = transfer.amount;
                transferToBudget.startDate = transfer.date;
                transferToBudget.typeCode = transfer.transferTypeCode;
                transferToBudget.notes = "Transferred amount $" + transfer.amount + " from CAC Code: " + fromAccountCode.countyExpenseCode + " to CAC Code: " + toAccountCode.countyExpenseCode;
                _context.BudgetAmounts.Add(transferToBudget);

                await _context.SaveChangesAsync();

                return CreatedAtAction("PostTransfer", "True");
            }
            else
            {
                return BadRequest("Transfer amount should not exceed account budget");
            }
        }
        [HttpGet]
        [Route("GetConfigurationMasterData")]
        public async Task<ActionResult> GetConfigurationMasterData()
        {
            try
            {
                List<Category> catList = new List<Category>();

                catList = await _context.Category.Where(x => x.isActive == "Y").ToListAsync();

                foreach (var category in catList)
                {
                    var data = await _context.Settings.Where(o => o.CategoryId == category.Id && o.isActive == "Y").ToListAsync();
                    foreach (var item in data)
                    {
                        var settingVal = await _context.SettingsValue.Where(v => v.settingsId == item.settingKey).Select(v => v.settingValue).FirstOrDefaultAsync();
                        item.SettingsValue = settingVal;
                    }
                    var rlist = data.GroupBy(p => p.section, (key, g) => new { KeyId = key, keyData = g.ToList() });
                    category.SettingsObj = rlist;
                }

                return Ok(new { Result = catList });
            }
            catch (Exception ex) {
                throw;
            }
        }

        [HttpGet]
        [Route("GetConfigurationByCategoryId/{categoryId}")]
        public async Task<ActionResult> GetConfigurationByCategoryId(int categoryId)
        {
            var data = await _context.Settings.Where(o => o.CategoryId == categoryId).ToListAsync();
            foreach (var item in data)
            {
                item.SettingsValue = await _context.SettingsValue.Where(v => v.settingsId == item.settingKey).Select(v => v.settingValue).FirstOrDefaultAsync();
            }

            return Ok(new { Result = data });
        }

        [HttpGet]
        [Route("GetConfigurationBySettingId/{id}")]
        public async Task<ActionResult> GetConfigurationBySettingId(int id)
        {
            var data = await _context.Settings.Where(x => x.settingKey == id).FirstOrDefaultAsync();
            if (data == null)
            {
                return BadRequest("Configuration does not exist");
            }

            data.SettingsValue = await _context.SettingsValue.Where(v => v.settingsId == id).Select(v => v.settingValue).FirstOrDefaultAsync();

            return Ok(new { Result = data });
        }


        [HttpPost]
        [Route("SaveConfigurationData")]
        public async Task<ActionResult> SaveConfigurationData(List<SettingsValue> settingsValue)
        {
            try
            {
                foreach (var item in settingsValue)
                {
                    var value = await _context.SettingsValue.Where(s => s.settingsId == item.settingsId).FirstOrDefaultAsync();
                    if (value == null)
                    {
                        _context.SettingsValue.Add(new SettingsValue { settingValue = item.settingValue, createdBy = item.createdBy, settingsId = item.settingsId});
                    }
                    else
                    {
                        value.settingValue = item.settingValue;
                        value.modifiedDate = DateTime.Now;
                        value.modifiedBy = item.modifiedBy;
                        _context.SettingsValue.Update(value);
                    }
                    await _context.SaveChangesAsync();
                }
                return Ok(settingsValue);
            }
            catch (Exception ex)
            {
                throw;
            }

        }

        //for TotalBudgetAmounts

        [Route("/api/accountingcodes/{accountingcodeid}/TotalAmountAndBalance")]
        [HttpGet]
        public async Task<ActionResult> GetTotalBudgetAmounts(int accountingcodeid)
        {
            decimal amount = await _context.BudgetAmounts.Where(p => p.accountingCodeId.Equals(accountingcodeid) && p.startDate.Year == DateTime.Now.Year).Select(p => p.amount).SumAsync();
            List<IHACCode> codes = await _context.IHACCodes.Where(x => x.countyAccountingCode == accountingcodeid).ToListAsync();
            decimal bal = 0;
            if (codes.Count > 0)
            {
                foreach (IHACCode code in codes)
                {
                    decimal ihacAmount = await _context.IHACExpenseAmounts.Where(x => x.ihacCodeId == code.Id && x.startDate.Year == DateTime.Now.Year).Select(x => x.amount).SumAsync();
                    bal += ihacAmount;
                }
            }
            decimal balance = amount - bal;
            return Ok(new { amount = amount, Balance = balance });
        }


        /* Pre Year Balance  */
        //Get All Pre Year Balances
        [Route("PreYearBalances")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PreYearBalance>>> GetAllPreYearBalances(string year)
        {
            return await _context.PreYearBalances.Include(x => x.AccountingCode).Where(x => x.balYear == year).ToListAsync();
        }

        //Get Pre Year Balance By  Id
        [Route("PreYearBalances/{id}")]
        [HttpGet]
        public async Task<ActionResult<PreYearBalance>> GetPreYearBalancesById(int id)
        {
            var balances = await _context.PreYearBalances.FindAsync(id);
            if (balances == null)
            {
                return BadRequest("PreYearBalance does not exist");
            }
            return Ok(balances);
        }

        //Add new Pre Year Balances
        [Route("PreYearBalances")]
        [HttpPost]
        public async Task<ActionResult<PreYearBalance>> AddPreYearBalance(PreYearBalance Balance)
        {
            if (Balance == null)
            {
                return BadRequest("PreYearBalance does not exist");
            }
            await _context.PreYearBalances.AddAsync(Balance);
            await _context.SaveChangesAsync();
            return CreatedAtAction("GetPreYearBalancesById", new { id = Balance.Id }, Balance);
        }

        //Update Pre Year Balances
        [Route("PreYearBalances/{id}")]
        [HttpPut]
        public async Task<IActionResult> UpdatePreYearBalances(int id, PreYearBalance balance)
        {
            if (id != balance.Id)
            {
                return BadRequest("PreYearBalance does not match with id");
            }
            var balanceRef = await _context.PreYearBalances.FindAsync(id);
            if (balanceRef == null)
            {
                return BadRequest("PreYearBalance does not exist");
            }
            balance.createdBy = balanceRef.createdBy;
            balance.createdDate = balanceRef.createdDate;
            _context.PreYearBalances.Entry(balanceRef).State = EntityState.Detached;
            _context.PreYearBalances.Update(balance);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)

            {
                if (!BalanceExists(id))
                {
                    return BadRequest("PreYearBalance does not exist");
                }

                else
                {
                    throw;
                }
            }
            //  return Ok();
            return CreatedAtAction("GetPreYearBalancesById", new { id = balance.Id }, balance);

        }
        private bool BalanceExists(int id)
        {
            return _context.PreYearBalances.Any(e => e.Id == id);
        }

        //Delete Pre Year Balances
        [Route("PreYearBalances/{id}")]
        [HttpDelete]
        public async Task<ActionResult<PreYearBalance>> DeletePreYearBalances(int id)
        {
            var balance = await _context.PreYearBalances.FindAsync(id);
            if (balance == null)
            {
                return BadRequest("PreYearBalance does not exist");
            }
            _context.PreYearBalances.Remove(balance);
            await _context.SaveChangesAsync();
            return balance;
        }



        /* Pre Year Balance Revenues*/
        //Get All Pre Year  Balance revenues
        [Route("PreYearBalanceRevenues")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PreYearBalanceRevenue>>> GetAllPreYearBalancesRevenue(string year)
        {
            return await _context.PreYearBalanceRevenues.Include(x => x.accountingCode).Where(x => x.year == year).ToListAsync();
        }
        //Get Pre Year Balance Revenues By  Id
        [Route("PreYearBalanceRevenues/{id}")]
        [HttpGet]
        public async Task<ActionResult<PreYearBalanceRevenue>> GetPreYearBalanceRevenuesById(int id)
        {
            var balances = await _context.PreYearBalanceRevenues.FindAsync(id);
            if (balances == null)
            {
                return BadRequest("PreYearBalanceRevenue does not exist");
            }
            return Ok(balances);
        }

        //Add new Pre Year Balance Revenues
        [Route("PreYearBalanceRevenues")]
        [HttpPost]
        public async Task<ActionResult<PreYearBalanceRevenue>> AddPreYearBalanceRevenue(PreYearBalanceRevenue Balance)
        {
            if (Balance == null)
            {
                return BadRequest("PreYearBalanceRevenue does not exist");
            }
            await _context.PreYearBalanceRevenues.AddAsync(Balance);
            await _context.SaveChangesAsync();
            return CreatedAtAction("GetPreYearBalanceRevenuesById", new { id = Balance.Id }, Balance);
        }

        //Update Pre Year Balances
        [Route("PreYearBalanceRevenues/{id}")]
        [HttpPut]
        public async Task<IActionResult> UpdatePreYearBalanceRevenues(int id, PreYearBalanceRevenue balance)
        {
            if (id != balance.Id)
            {
                return BadRequest("PreYearBalanceRevenue does not match with id");
            }
            var balanceRef = await _context.PreYearBalanceRevenues.FindAsync(id);
            if (balanceRef == null)
            {
                return BadRequest("PreYearBalanceRevenue does not exist");
            }
            balance.createdBy = balanceRef.createdBy;
            balance.createdDate = balanceRef.createdDate;
            _context.PreYearBalanceRevenues.Entry(balanceRef).State = EntityState.Detached;
            _context.PreYearBalanceRevenues.Update(balance);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)

            {
                if (!BalanceRevenueExists(id))
                {
                    return BadRequest("PreYearBalanceRevenue does not exist");
                }

                else
                {
                    throw;
                }
            }
            //  return Ok();
            return CreatedAtAction("GetPreYearBalanceRevenuesById", new { id = balance.Id }, balance);

        }
        private bool BalanceRevenueExists(int id)
        {
            return _context.PreYearBalances.Any(e => e.Id == id);
        }

        //Delete Pre Year Balance Revenues
        [Route("PreYearBalanceRevenues/{id}")]
        [HttpDelete]
        public async Task<ActionResult<PreYearBalanceRevenue>> DeletePreYearBalanceRevenues(int id)
        {
            var balance = await _context.PreYearBalanceRevenues.FindAsync(id);
            if (balance == null)
            {
                return BadRequest("PreYearBalanceRevenue does not exist");
            }
            _context.PreYearBalanceRevenues.Remove(balance);
            await _context.SaveChangesAsync();
            return balance;
        }

        //Calculate and store Fund Balances
        [Route("CalculateAndStoreFundBalances")]
        [HttpPost]
        public async Task<string> CalculateAndStoreFundBalances()
        {
            var currentYear = DateTime.Now.Year;
            var currentDate = DateTime.Now;
            DateTime startDate = new DateTime(currentYear, 1, 1);
            DateTime endDate = new DateTime(currentYear, 12, 31);
            List<Fund> funds = await _context.Funds.Where(f => f.inactiveDate == null).ToListAsync();
            foreach (var f in funds)
            {
                decimal balance = await FundCalculation.FundBalance(f.id, startDate, endDate, _context);
                CashBalance cashBalance = new CashBalance();
                cashBalance.fundId = f.id;
                cashBalance.typeCode = 1;
                cashBalance.startDate = currentDate;
                cashBalance.amount = balance;
                _context.CashBalances.Add(cashBalance);
                await _context.SaveChangesAsync();
            }
            return "Fund Amount is created";
        }
        //Calculate CAC Carryover Amounts
        [Route("CalculateCarryoverAmounts")]
        [HttpPost]
        public async Task<string> CalculateCarryoverAmounts()
        {
            var currentYear = DateTime.Now.Year;
            var currentDate = DateTime.Now;
            DateTime startDate = new DateTime(currentYear, 1, 1);
            DateTime endDate = new DateTime(currentYear, 12, 31);
            List<CountyPO> pOs = await _context.CountyPO.Where(p => p.poOpenDate.Year == currentYear && p.poComplete == false ).ToListAsync();
            foreach (var p in pOs)
            {
                var pODetails = await _context.CountyPODetails.Where(x => x.poId == p.Id).FirstOrDefaultAsync();
                if (pODetails != null)
                {
                    BudgetAmount budget = new BudgetAmount();
                    budget.accountingCodeId = pODetails.pocacid;
                    budget.amount = p.poAmount;
                    budget.typeCode = 3;
                    budget.startDate = startDate;
                    _context.BudgetAmounts.Add(budget);
                    await _context.SaveChangesAsync();
                }
            }
            return "";
        }
    }
}
