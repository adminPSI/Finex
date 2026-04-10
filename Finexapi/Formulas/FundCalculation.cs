using FinexAPI.Data;
using FinexAPI.Helper;
using FinexAPI.Models;
using FinexAPI.Models.AccountRevenue;
using FinexAPI.Models.IHPOs;
using FinexAPI.Models.PurchaseOrder;
using FinexAPI.Models.Voucher;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using System.Xml.Linq;

namespace FinexAPI.Formulas
{
    public class FundCalculation
    {
        /* private readonly FundContext _fundContext;
         private readonly AccountRevenueContext _accountRevenueContext;
         private readonly PurchaseOrderContext _purchaseOrderContext;
         private readonly IHPOContext _iHPOContext;
         private readonly IHACContext _ihACContext;
         public FundCalculation(FundContext fundContext, PurchaseOrderContext purchaseOrderContext,
             AccountRevenueContext accountRevenueContext, IHPOContext iHPOContext, IHACContext iHACContext)
         {
             _fundContext = fundContext;
             _purchaseOrderContext = purchaseOrderContext;
             _accountRevenueContext = accountRevenueContext;
             _ihACContext = iHACContext;
             _iHPOContext = iHPOContext;
         } */

        public static async Task<decimal> StartBalanceByFund(int fundId, DateTime startDate, DateTime endDate, FinexAppContext _fundContext)
        {
            decimal balance = await _fundContext.CashBalances.Where(x => x.fundId == fundId && x.startDate >= startDate && x.startDate <= endDate && x.typeCode == 1)
             .Select(x => x.amount).SumAsync();
            return decimal.Round(balance, 2);
        }

        public static async Task<decimal> TransfersByFund(int fundId, DateTime startDate, DateTime endDate, FinexAppContext _fundContext)
        {
            decimal balance = await _fundContext.CashBalances.Where(x => x.fundId == fundId && x.startDate >= startDate && x.startDate <= endDate && x.typeCode == 2)
            .Select(x => x.amount).SumAsync();
            return decimal.Round(balance, 2);
        }
        public static async Task<decimal> VoucherTotalsByFund(int fundId, DateTime startDate, DateTime endDate, FinexAppContext _fundContext)
        {
            var accountingCode = await _fundContext.AccountingCodes.Where(x => x.FundId == fundId).FirstOrDefaultAsync();
            decimal? total = 0;
            if (accountingCode != null)
            {
                total = await _fundContext.vouchers.Where(x => x.poCACId == accountingCode.Id && x.voucherWrittenDate >= startDate && x.voucherWrittenDate <= endDate).Select(x => x.voucherAmount).SumAsync();
            }
            return total??0;
        }
        public static async Task<decimal> PayrollTotals(int fundId, DateTime startDate, DateTime endDate, FinexAppContext _fundContext)
        {
            var acccountingCode = await _fundContext.AccountingCodes.Where(x => x.FundId == fundId).FirstOrDefaultAsync();
            decimal pTotal = 0;
            return pTotal;
        }
        public static async Task<decimal> BenefitsTotals(int fundId, DateTime startDate, DateTime endDate)
        {
            return 0;
        }
        public static async Task<decimal> Adjustments(int fundId, DateTime startDate, DateTime endDate, FinexAppContext _fundContext)
        {
            decimal balance = await _fundContext.CashBalances.Where(x => x.fundId == fundId && x.startDate >= startDate && x.startDate <= endDate && x.typeCode == 2)
            .Select(x => x.amount).SumAsync();
            return decimal.Round(balance, 2);
        }
        public static async Task<decimal> RevenueByFund(int fundId, DateTime startDate, DateTime endDate, FinexAppContext _fundContext)
        {
            decimal total = 0;
            List<AccountingCode> accountingCodes = await _fundContext.AccountingCodes.Where(x => x.FundId == fundId).ToListAsync();

            foreach (var code in accountingCodes)
            {
                total = (decimal)await _fundContext.CountyRevenueBD.Where(x => x.rev_BD_CAC == code.Id && x.rev_Date >= startDate && x.rev_Date <= endDate).Select(x => x.rev_BD_Amount).SumAsync();
            }
            return total;
        }
        public static async Task<decimal> FundBalance(int fundId, DateTime startDate, DateTime endDate, FinexAppContext fundContext)
        {
            decimal fundBalance = 0;
            fundBalance += await StartBalanceByFund(fundId, startDate, endDate, fundContext);
            fundBalance += await TransfersByFund(fundId, startDate, endDate, fundContext);
            fundBalance -= await VoucherTotalsByFund(fundId, startDate, endDate, fundContext);
            // fundBalance -= await PayrollTotals(fundId, startDate, endDate, fundContext);
            // fundBalance -= await BenefitsTotals(fundId, startDate, endDate);
            // fundBalance -= await Adjustments(fundId, startDate, endDate, fundContext);
            fundBalance += await RevenueByFund(fundId, startDate, endDate, fundContext);
            return fundBalance;
        }
        public async Task<string> CalcPreviousYearBalance(FinexAppContext _fundContext)
        {
            var year = DateTime.Now.Year;
            DateTime startDate = new DateTime(year, 1, 1);
            DateTime endDate = new DateTime(year, 12, 31);
            var preYearBalRevenueRef = _fundContext.PreYearBalanceRevenues.Where(x => x.year == year.ToString()).FirstOrDefault();
            if (preYearBalRevenueRef != null)
            {
                _fundContext.PreYearBalanceRevenues.Remove(preYearBalRevenueRef);
            }
            List<AccountingCode> accountingCodes = new List<AccountingCode>();
            accountingCodes = await _fundContext.AccountingCodes.Where(x => x.typeCode == 7).ToListAsync();
            //List<CountyRevenueBD> revenueBDs = await _accountRevenueContext.CountyRevenueBD.Where(x => x.rev_Date >= startDate && x.rev_Date <= endDate).ToListAsync();
            foreach (var accountingCode in accountingCodes)
            {
                decimal totalExpense = 0;
                decimal[] m = new decimal[12];
                List<Voucher> vouchers = await _fundContext.vouchers.Where(x => x.poCACId == accountingCode.Id && x.voucherDate >= startDate && x.voucherDate <= endDate).ToListAsync();
                for (int i = 0; i <= 11; i++)
                {
                    decimal expense = 0;
                    foreach (var voucher in vouchers)
                    {
                        if ((voucher.voucherDate.Value.Month - 1) == i && voucher.poCACId == accountingCode.Id)
                        {
                            expense += voucher.voucherAmount??0;
                        }

                        /* if(reven.Rev_BD_CAC == accountingCode.Id)
                        {
                            if (reven.rev_BD_Amount != null)
                            {
                                m[reven.rev_Date.Month - 1] += (decimal)reven.rev_BD_Amount;
                            }
                        } */
                    }
                    m[i] = expense;
                    totalExpense += expense;
                }
                if (totalExpense > 0)
                {

                    PreYearBalanceRevenue preYearBalance = new PreYearBalanceRevenue();
                    preYearBalance.cACID = accountingCode.Id;
                    preYearBalance.jan = m[0];
                    preYearBalance.feb = m[1];
                    preYearBalance.mar = m[2];
                    preYearBalance.apr = m[3];
                    preYearBalance.may = m[4];
                    preYearBalance.jun = m[5];
                    preYearBalance.jul = m[6];
                    preYearBalance.aug = m[7];
                    preYearBalance.sep = m[8];
                    preYearBalance.oct = m[9];
                    preYearBalance.nov = m[10];
                    preYearBalance.dec = m[11];
                    preYearBalance.year = year.ToString();
                }
            }
            return "";
        }
        public async Task<string> CalcPreviousYearRevenueBalance(FinexAppContext _fundContext)
        {
            var year = DateTime.Now.Year;
            DateTime startDate = new DateTime(year, 1, 1);
            DateTime endDate = new DateTime(year, 12, 31);
            var preYearBalRef = _fundContext.PreYearBalances.Where(x => x.balYear == year.ToString()).FirstOrDefault();
            if (preYearBalRef != null)
            {
                _fundContext.PreYearBalances.Remove(preYearBalRef);
            }
            List<AccountingCode> accountingCodes = new List<AccountingCode>();
            accountingCodes = await _fundContext.AccountingCodes.Where(x => x.typeCode == 6).ToListAsync();
            List<CountyRevenueBD> revenueBDs = await _fundContext.CountyRevenueBD.Where(x => x.rev_Date >= startDate && x.rev_Date <= endDate).ToListAsync();
            foreach (var accountingCode in accountingCodes)
            {
                decimal totalRevenue = 0;
                decimal[] m = new decimal[12];
                for (int i = 0; i <= 11; i++)
                {
                    decimal revenue = 0;
                    foreach (var reven in revenueBDs)
                    {
                        if ((reven.rev_Date.Value.Month - 1) == i && reven.rev_BD_CAC == accountingCode.Id)
                        {
                            if (reven.rev_BD_Amount != null)
                            {
                                revenue += (decimal)reven.rev_BD_Amount;
                            }

                        }

                        /* if(reven.Rev_BD_CAC == accountingCode.Id)
                        {
                            if (reven.rev_BD_Amount != null)
                            {
                                m[reven.rev_Date.Month - 1] += (decimal)reven.rev_BD_Amount;
                            }
                        } */
                    }
                    m[i] = revenue;
                    totalRevenue += revenue;
                }
                if (totalRevenue > 0)
                {

                    PreYearBalance preYearBalance = new PreYearBalance();
                    preYearBalance.balCACID = accountingCode.Id;
                    preYearBalance.balJan = m[0];
                    preYearBalance.balFeb = m[1];
                    preYearBalance.balMar = m[2];
                    preYearBalance.balApr = m[3];
                    preYearBalance.balMar = m[4];
                    preYearBalance.balJun = m[5];
                    preYearBalance.balJul = m[6];
                    preYearBalance.balAug = m[7];
                    preYearBalance.balSep = m[8];
                    preYearBalance.balOct = m[9];
                    preYearBalance.balNov = m[10];
                    preYearBalance.balDec = m[11];
                    preYearBalance.balYear = year.ToString();
                }
            }
            return "";
        }

        public static async Task<decimal> CalcInvoiceBalance(int arid, FinexAppContext _accountRevenueContext)
        {
            var accountR = await _accountRevenueContext.AccountReceivables.FindAsync(arid);
            if (accountR != null)
            {
                decimal invoiceBalance = (decimal)await _accountRevenueContext.AccountReceivableDesc.Where(x => x.arID == accountR.ID).Select(x => x.lineBalance).SumAsync();
                decimal invoiceTotal = (decimal)await _accountRevenueContext.AccountReceivableDesc.Where(x => x.arID == accountR.ID).Select(x => x.amount).SumAsync();
                accountR.amount = invoiceTotal; 
                accountR.balance = invoiceBalance;
                _accountRevenueContext.AccountReceivables.Update(accountR);
                await _accountRevenueContext.SaveChangesAsync();
                return invoiceBalance;
            }
            else
            {
                return 0;
            }
        }
        public static async Task<string> CalculateAndStoreARLineBalance(int id, FinexAppContext accountRevenueContext)
        {
            var arLineItem = await accountRevenueContext.AccountReceivableDesc.FindAsync(id);
            if (arLineItem != null)
            {
                arLineItem.lineBalance = arLineItem.amount - arLineItem.received;
                accountRevenueContext.AccountReceivableDesc.Update(arLineItem);
                await accountRevenueContext.SaveChangesAsync();
                var ar = await accountRevenueContext.AccountReceivables.FindAsync(arLineItem.arID);
                if (ar != null)
                {
                    await CalcInvoiceBalance(ar.ID, accountRevenueContext);
                }
                return "Line balance caaculated";
            }
            else
            {
                return string.Empty;
            }
        }
        public static async Task<string> CalcARLineItemBalance(int id, int orgAccountId, FinexAppContext _accountRevenueContext)
        {
            var revenueDB = await _accountRevenueContext.CountyRevenueBD.FindAsync(id);
            if (revenueDB != null)
            {
                var revAmount = revenueDB.rev_BD_Amount;
                var ar = await _accountRevenueContext.AccountReceivables.Where(x => x.ID == revenueDB.invoiceId && x.OrgAccountId == orgAccountId).FirstOrDefaultAsync();
                if (ar != null)
                {
                    var lineItems = await _accountRevenueContext.AccountReceivableDesc.Where(x => x.arID == ar.ID).ToListAsync();
                    foreach (var dec in lineItems)
                    {
                        if (revAmount > 0)
                        {
                            if (dec.amount > 0 && dec.amount != dec.received)
                            {
                                if (dec.lineBalance == dec.amount)
                                {
                                    if (dec.amount > revAmount)
                                    {
                                        dec.lineBalance = dec.amount - revAmount;
                                        dec.received += revAmount;
                                        revAmount = 0;
                                    }
                                    else
                                    {
                                        dec.lineBalance = 0;
                                        dec.received += dec.amount;
                                        revAmount = revAmount - dec.amount;
                                    }
                                }
                                else
                                {
                                    if (dec.lineBalance > revAmount)
                                    {
                                        dec.lineBalance = dec.lineBalance - revAmount;
                                        dec.received += revAmount;
                                        revAmount = 0;
                                    }
                                    else
                                    {
                                        dec.received += dec.lineBalance;
                                        revAmount = revAmount - dec.lineBalance;
                                        dec.lineBalance = 0;
                                    }
                                }
                                if (dec.amount == dec.received)
                                {
                                    dec.lineBalance = 0;
                                }
                                _accountRevenueContext.AccountReceivableDesc.Update(dec);
                                await _accountRevenueContext.SaveChangesAsync();
                            }
                        }
                        else
                        {
                            break;
                        }
                    }
                    await CalcInvoiceBalance(ar.ID, _accountRevenueContext);
                    return "Calculated and stored Account receivable line item balance";
                }
                else
                {
                    return "Account receivable not found for invoice number";
                }
            }
            else
            {
                return "Revenue BD does not exist";
            }
        }
        public static async Task<string> CalcARLineItemBalanceWhileUpdate(int id, int? preInvoiceId, decimal? preAmount, int orgAccountId, FinexAppContext _accountRevenueContext)
        {
            var revenueDB = await _accountRevenueContext.CountyRevenueBD.FindAsync(id);
            if (revenueDB != null && preAmount != null && revenueDB.invoiceId != null)
            {
                if (preInvoiceId != null && revenueDB.invoiceId == preInvoiceId)
                {
                    var revAmount = revenueDB.rev_BD_Amount - preAmount;
                    if (revenueDB.rev_BD_Amount != preAmount)
                    {
                        if (revAmount > 0)
                        {
                            var ar = await _accountRevenueContext.AccountReceivables.Where(x => x.ID == revenueDB.invoiceId && x.OrgAccountId == orgAccountId).FirstOrDefaultAsync();
                            if (ar != null)
                            {
                                var lineItems = await _accountRevenueContext.AccountReceivableDesc.Where(x => x.arID == ar.ID).ToListAsync();
                                foreach (var dec in lineItems)
                                {
                                    if (revAmount > 0)
                                    {
                                        if (dec.amount > 0 && dec.amount != dec.received)
                                        {
                                            if (dec.lineBalance == dec.amount)
                                            {
                                                if (dec.amount >= revAmount)
                                                {
                                                    dec.lineBalance = dec.amount - revAmount;
                                                    dec.received += revAmount;
                                                    revAmount = 0;
                                                }
                                                else
                                                {
                                                    dec.lineBalance = 0;
                                                    dec.received += dec.amount;
                                                    revAmount = revAmount - dec.amount;
                                                }
                                            }
                                            else
                                            {
                                                if (dec.lineBalance >= revAmount)
                                                {
                                                    dec.lineBalance = dec.lineBalance - revAmount;
                                                    dec.received += revAmount;
                                                    revAmount = 0;
                                                }
                                                else
                                                {
                                                    dec.received += dec.lineBalance;
                                                    revAmount = revAmount - dec.lineBalance;
                                                    dec.lineBalance = 0;
                                                }
                                            }
                                            if (dec.amount == dec.received)
                                            {
                                                dec.lineBalance = 0;
                                            }
                                            _accountRevenueContext.AccountReceivableDesc.Update(dec);
                                            await _accountRevenueContext.SaveChangesAsync();
                                        }
                                    }
                                    else
                                    {
                                        break;
                                    }
                                }
                                await CalcInvoiceBalance(ar.ID, _accountRevenueContext);
                                return "Calculated and stored Account receivable line item balance";
                            }
                            else
                            {
                                return "Account receivable not found for invoice number";
                            }
                        }

                        else
                        {
                            revAmount = preAmount - revenueDB.rev_BD_Amount;
                            var ar = await _accountRevenueContext.AccountReceivables.Where(x => x.ID == revenueDB.invoiceId && x.OrgAccountId == orgAccountId).FirstOrDefaultAsync();
                            if (ar != null)
                            {
                                var lineItems = await _accountRevenueContext.AccountReceivableDesc.Where(x => x.arID == ar.ID).ToListAsync();
                                foreach (var dec in lineItems)
                                {
                                    if (revAmount > 0 && dec.amount > 0)
                                    {
                                        if (dec.amount > 0)
                                        {
                                            if (dec.lineBalance == 0)
                                            {
                                                if (dec.amount >= revAmount)
                                                {
                                                    dec.received = dec.received - revAmount;
                                                    dec.lineBalance += revAmount;
                                                    revAmount = 0;
                                                }
                                                else
                                                {
                                                    dec.lineBalance += dec.amount;
                                                    dec.received = 0;
                                                    revAmount = revAmount - dec.amount;
                                                }
                                            }
                                            else
                                            {
                                                if (dec.received >= revAmount)
                                                {
                                                    dec.received = dec.received - revAmount;
                                                    dec.lineBalance += revAmount;
                                                    revAmount = 0;
                                                }
                                                else
                                                {
                                                    dec.lineBalance += dec.amount;
                                                    revAmount = revAmount - dec.received;
                                                    dec.received = 0;
                                                }
                                            }
                                            if (dec.amount == dec.received)
                                            {
                                                dec.lineBalance = 0;
                                            }
                                            _accountRevenueContext.AccountReceivableDesc.Update(dec);
                                            await _accountRevenueContext.SaveChangesAsync();
                                        }
                                    }
                                    else
                                    {
                                        break;
                                    }
                                }
                                await CalcInvoiceBalance(ar.ID, _accountRevenueContext);
                                return "Calculated and stored Account receivable line item balance";
                            }
                            else
                            {
                                return "Account receivable not found for invoice number";
                            }
                        }
                    }
                    else
                    {
                        return "No change in amount";
                    }
                }
                else if (preInvoiceId == null && revenueDB.invoiceId != null)
                {
                    return await CalcARLineItemBalance(revenueDB.ID, orgAccountId, _accountRevenueContext);
                }
                else
                {
                    var ar = await _accountRevenueContext.AccountReceivables.Where(x => x.ID == preInvoiceId && x.OrgAccountId == orgAccountId).FirstOrDefaultAsync();
                    if (ar != null)
                    {
                        var lineItems = await _accountRevenueContext.AccountReceivableDesc.Where(x => x.arID == ar.ID).ToListAsync();
                        foreach (var dec in lineItems)
                        {
                            if (preAmount > 0 && dec.amount > 0)
                            {
                                if (dec.amount > 0)
                                {
                                    if (dec.lineBalance == 0)
                                    {
                                        if (dec.amount >= preAmount)
                                        {
                                            dec.received = dec.received - preAmount;
                                            dec.lineBalance += preAmount;
                                            preAmount = 0;
                                        }
                                        else
                                        {
                                            dec.lineBalance += dec.amount;
                                            dec.received = 0;
                                            preAmount = preAmount - dec.amount;
                                        }
                                    }
                                    else
                                    {
                                        if (dec.received >= preAmount)
                                        {
                                            dec.received = dec.received - preAmount;
                                            dec.lineBalance += preAmount;
                                            preAmount = 0;
                                        }
                                        else
                                        {
                                            dec.lineBalance += dec.amount;
                                            preAmount = preAmount - dec.received;
                                            dec.received = 0;
                                        }
                                    }
                                    if (dec.amount == dec.received)
                                    {
                                        dec.lineBalance = 0;
                                    }
                                    _accountRevenueContext.AccountReceivableDesc.Update(dec);
                                    await _accountRevenueContext.SaveChangesAsync();
                                }
                            }
                            else
                            {
                                break;
                            }
                        }
                        await CalcInvoiceBalance(ar.ID, _accountRevenueContext);
                        await CalcARLineItemBalance(revenueDB.ID, orgAccountId, _accountRevenueContext);
                        return "Calculated and stored Account receivable line item balance";
                    }
                    else
                    {
                        return "Account receivable not found for invoice number";
                    }
                }
            }
            else
            {
                return "Revenue BD does not exist";
            }
        }
        public static async Task<string> CalcARLineItemBalanceWhileDelete(int id, int orgAccountId, FinexAppContext _accountRevenueContext)
        {
            var revenueDB = await _accountRevenueContext.CountyRevenueBD.FindAsync(id);
            if (revenueDB != null)
            {
                var preAmount = revenueDB.rev_BD_Amount;
                var ar = await _accountRevenueContext.AccountReceivables.Where(x => x.ID == revenueDB.invoiceId && x.OrgAccountId == orgAccountId).FirstOrDefaultAsync();
                if (ar != null)
                {
                    var lineItems = await _accountRevenueContext.AccountReceivableDesc.Where(x => x.arID == ar.ID).ToListAsync();
                    foreach (var dec in lineItems)
                    {
                        if (dec.amount > 0)
                        {
                            if (dec.lineBalance == 0)
                            {
                                if (dec.amount >= preAmount)
                                {
                                    dec.received = dec.received - preAmount;
                                    dec.lineBalance += preAmount;
                                    preAmount = 0;
                                }
                                else
                                {
                                    dec.lineBalance += dec.amount;
                                    dec.received = 0;
                                    preAmount = preAmount - dec.amount;
                                }
                            }
                            else
                            {
                                if (dec.received >= preAmount)
                                {
                                    dec.received = dec.received - preAmount;
                                    dec.lineBalance += preAmount;
                                    preAmount = 0;
                                }
                                else
                                {
                                    dec.lineBalance += dec.amount;
                                    preAmount = preAmount - dec.received;
                                    dec.received = 0;
                                }
                            }
                            _accountRevenueContext.AccountReceivableDesc.Update(dec);
                            await _accountRevenueContext.SaveChangesAsync();
                        }
                        else
                        {
                            break;
                        }
                    }
                    await CalcInvoiceBalance(ar.ID, _accountRevenueContext);
                    return "Calculated and stored Account receivable line item balance";
                }
                else
                {
                    return "County revenue BD";
                }
            }
            else
            {
                return "Account receivable not found for invoice number";
            }
        }
        public static async Task<decimal> CalculateAndStorePOBalance(int poId, FinexAppContext _purchaseOrderContext)
        {
            var recordPO = await _purchaseOrderContext.CountyPO.FindAsync(poId);
            decimal balance = 0;
            if (recordPO != null)
            {
                var recordPricing = await _purchaseOrderContext.CountyPOPricing.Where(x => x.poId == recordPO.Id).FirstOrDefaultAsync();
                if (recordPricing != null)
                {
                    var vouchers = await _purchaseOrderContext.vouchers.Where(x => x.poId == poId).ToListAsync();
                    decimal voucherAmount = 0;
                    foreach (var voucher in vouchers)
                    {
                        decimal amount = await _purchaseOrderContext.VoucherInvoiceLineItems.Where(x => x.voucherID == voucher.Id).Select(x => x.amount).SumAsync();
                        voucherAmount += amount;
                    }
                    var pOLiquidatesSum = await _purchaseOrderContext.POLiquidate
                                                  .Where(x => x.countyPOId == recordPO.Id)
                                                 .SumAsync(x => x.amount);
                    if (recordPO != null)
                    {
                        balance = recordPO.poAmount - pOLiquidatesSum - voucherAmount;


                        if (recordPO.poComplete == true)
                        {
                            recordPO.poComplete = true;
                            _purchaseOrderContext.CountyPO.Update(recordPO);


                            recordPricing.poBalance = 0;
                            recordPricing.closingBalance = balance;
                            _purchaseOrderContext.CountyPOPricing.Update(recordPricing);
                        }
                        else
                        {
                            recordPricing.poBalance = balance;
                            recordPricing.closingBalance = 0;
                            _purchaseOrderContext.CountyPOPricing.Update(recordPricing);
                        }
                        await _purchaseOrderContext.SaveChangesAsync();
                    }
                }
                else
                {
                    return 0;
                }
                return balance;
            }
            else
            {
                return 0;
            }
        }

        public async Task<decimal> CalculatePOBalances(bool poComplete, FinexAppContext _purchaseOrderContext)
        {
            List<CountyPO> countyPOs = await _purchaseOrderContext.CountyPO.Where(x => x.poComplete == poComplete).ToListAsync();
            decimal response = 0;
            foreach (var po in countyPOs)
            {
                decimal res = await CalculateAndStorePOBalance(po.Id, _purchaseOrderContext);
                response = res;
            }
            return response;
        }
        //Todo : This method needs to be reviewed once again
        public async Task<string> CalculateCACPOCarryOver(FinexAppContext _fundContext)
        {
            var currentYear = DateTime.Now.Year;
            var currentDate = DateTime.Now;
            DateTime startDate = new DateTime(currentYear, 1, 1);
            DateTime endDate = new DateTime(currentYear, 12, 31);
            List<CountyPO> pOs = await _fundContext.CountyPO.Where(p => p.poOpenDate.Year == currentYear && p.poComplete == false).ToListAsync();
            foreach (var p in pOs)
            {
                var pODetails = await _fundContext.CountyPODetails.Where(x => x.poId == p.Id).FirstOrDefaultAsync();
                if (pODetails != null)
                {
                    BudgetAmount budget = new BudgetAmount();
                    budget.accountingCodeId = pODetails.pocacid;
                    budget.amount = p.poAmount;
                    budget.typeCode = 3;
                    budget.startDate = startDate;
                    budget.createdDate = DateTime.Now;
                    budget.createdBy = "admin";
                    budget.modifiedDate = DateTime.Now;
                    budget.modifiedBy = "admin";
                    _fundContext.BudgetAmounts.Add(budget);
                    await _fundContext.SaveChangesAsync();

                    pODetails.carryOver = true;
                    _fundContext.CountyPODetails.Update(pODetails);
                    await _fundContext.SaveChangesAsync();
                }
            }
            return "Calculated and stored Po Carryover";
        }

        public static async Task<decimal> SetIHPOBalance(int ihpoId, FinexAppContext _iHPOContext)
        {
            var iHPO = await _iHPOContext.IHPO.FindAsync(ihpoId);
            if (iHPO == null)
            {
                return 0;
            }
            decimal balance = await _iHPOContext.VoucherInvoiceLineItems.Where(x => x.ihpoId == iHPO.ID).Select(x => x.amount).SumAsync();
            var pricing = await _iHPOContext.IHPOPricing.Where(x => x.reqID == iHPO.ID).FirstOrDefaultAsync();
            if (pricing == null)
            {
                return 0;
            }
            var bl = pricing.reqBalance - balance;
            pricing.reqBalance = bl;
            _iHPOContext.IHPOPricing.Update(pricing);
            await _iHPOContext.SaveChangesAsync();
            return pricing.reqBalance.Value;
        }
        public async Task<decimal> GetVoucherAmounts(int ihacId, DateTime startDate, DateTime endDate, FinexAppContext _purchaseOrderContext)
        {
            decimal? voucherAmounts = await _purchaseOrderContext.vouchers.Where(x => x.Id == ihacId).Select(x => x.voucherAmount).SumAsync();
            return voucherAmounts??0;
        }
        public async Task<decimal> GetAllocationAmounts(int ihacCodeId, DateTime startDate, DateTime endDate, FinexAppContext _iHACContext)
        {
            var iHAC = await _iHACContext.IHACCodes.Where(x => x.Id == ihacCodeId).FirstOrDefaultAsync();
            decimal allocationAmount = 0;
            if (iHAC != null)
            {
                allocationAmount = await _iHACContext.IHACExpenseAmounts.Where(x => x.ihacCodeId == iHAC.Id && x.typeCode == 12).Select(x => x.amount).SumAsync();
            }
            return allocationAmount;
        }
        public async Task<decimal> GetTransferAmounts(int ihacCodeId, DateTime startDate, DateTime endDate, FinexAppContext _iHACContext)
        {
            var iHAC = await _iHACContext.IHACCodes.Where(x => x.Id == ihacCodeId).FirstOrDefaultAsync();
            decimal allocationAmount = 0;
            if (iHAC != null)
            {
                allocationAmount = await _iHACContext.IHACExpenseAmounts.Where(x => x.ihacCodeId == iHAC.Id && x.typeCode == 13).Select(x => x.amount).SumAsync();
            }
            return allocationAmount;
        }
        public async Task<decimal> GetCarryoverAmounts(int ihacCodeId, DateTime startDate, DateTime endDate, FinexAppContext _iHACContext)
        {
            var iHAC = await _iHACContext.IHACCodes.Where(x => x.Id == ihacCodeId).FirstOrDefaultAsync();
            decimal allocationAmount = 0;
            if (iHAC != null)
            {
                allocationAmount = await _iHACContext.IHACExpenseAmounts.Where(x => x.ihacCodeId == iHAC.Id && x.typeCode == 14).Select(x => x.amount).SumAsync();
            }
            return allocationAmount;
        }
        public static async Task<decimal> GetUnencumberedBalance(int cacId, int year, FinexAppContext fundContext)
        {
            decimal cacAmount = await fundContext.BudgetAmounts.Where(x => x.accountingCodeId == cacId && x.startDate.Year == year).SumAsync(x => x.amount);
            decimal? voucherAmount = await fundContext.vouchers.Where(x => x.poCACId == cacId && x.voucherWrittenDate.Year == year).SumAsync(x => x.voucherAmount);
            var countyPODetails = await fundContext.CountyPODetails.Where(x => x.pocacid == cacId && x.CountyPO.poOpenDate.Year == year).ToListAsync();
            decimal poBalance = 0;
            foreach (var item in countyPODetails)
            {
                var balance = (decimal)await fundContext.CountyPOPricing.Where(x => x.poId == item.poId && x.CountyPO.poOpenDate.Year == year).SumAsync(x => x.poBalance);
                poBalance += balance;
                fundContext.CountyPODetails.Entry(item).State = EntityState.Detached;
            }
            return cacAmount - (voucherAmount??0) - poBalance;
        }
        public static async Task<string> GetVoucherNumber(Voucher voucher, int orgAccountId, FinexAppContext fundContext)
        {
            var voucherNumberEach = await fundContext.SettingsValue.Where(x => x.settingsId == 54 && x.OrgAccountId == orgAccountId).Select(x => x.settingValue).FirstOrDefaultAsync();
            var voucherNumberVendorDateWritten = await fundContext.SettingsValue.Where(x => x.settingsId == 55 && x.OrgAccountId == orgAccountId).Select(x => x.settingValue).FirstOrDefaultAsync();
            var voucherNumberOnePO = await fundContext.SettingsValue.Where(x => x.settingsId == 56 && x.OrgAccountId == orgAccountId).Select(x => x.settingValue).FirstOrDefaultAsync();
            var voucherNumberMultiPO = await fundContext.SettingsValue.Where(x => x.settingsId == 57 && x.OrgAccountId == orgAccountId).Select(x => x.settingValue).FirstOrDefaultAsync();
            var voucherNoDateWritten = await fundContext.SettingsValue.Where(x => x.settingsId == 58 && x.OrgAccountId == orgAccountId).Select(x => x.settingValue).FirstOrDefaultAsync();

            var vouchers = await fundContext.vouchers.Include(x => x.accountingCode).Where(x => x.vendorNo == voucher.vendorNo && x.OrgAccountId == orgAccountId).ToListAsync();
            int fundId = await fundContext.AccountingCodes.Where(x => x.Id == voucher.poCACId).Select(x => x.FundId).FirstOrDefaultAsync();
            if (voucherNumberEach != null && voucherNumberEach == "1")
            {

                return await VoucherNumber(fundContext, orgAccountId);
            }
            else
            {
                if (voucherNumberOnePO != null && voucherNumberOnePO == "1")
                {

                    vouchers = vouchers.Where(x => x.poId == voucher.poId && x.accountingCode != null && x.accountingCode.FundId == fundId).OrderByDescending(x => x.Id).ToList();

                }
                if (voucherNumberMultiPO != null && voucherNumberMultiPO == "1")
                {

                    vouchers = vouchers.Where(x => x.accountingCode != null && x.accountingCode.FundId == fundId).OrderByDescending(x => x.Id).ToList();

                }
                if (voucherNoDateWritten != null && voucherNoDateWritten == "0")
                {
                    vouchers = vouchers.Where(x => x.voucherWrittenDate.Date == voucher.voucherWrittenDate.Date).OrderByDescending(x => x.Id).ToList();
                }
                if (vouchers.Any())
                {
                    var number = vouchers.Select(x => x.voucherVouchNo).Take(1).FirstOrDefault();
                    if (number != null)
                    {
                        var dtY = DateTime.Now.Year.ToString();

                        return "V" + number.Substring(1, 4) + "-" + dtY.Substring(2);
                    }
                    else
                    {
                        return await VoucherNumber(fundContext, orgAccountId);
                    }
                }
                else
                {
                    return await VoucherNumber(fundContext, orgAccountId);
                }
            }
        }
        public static async Task<string> VoucherNumber(FinexAppContext purchaseOrderContext, int orgAccountId)
        {
            var nextSequence = purchaseOrderContext.GetNextSequencevalue("vouchersequence_" + orgAccountId);

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

            return "V" + str2 + "-" + dtY.Substring(2);
        }
    }
}
