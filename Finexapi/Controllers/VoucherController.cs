using FinexAPI.Models.Voucher;
using FinexAPI.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Authorization;
using System.Numerics;
using FinexAPI.Helper;
using Microsoft.IdentityModel.Tokens;
using FinexAPI.Formulas;
using FinexAPI.Models.IHPOs;
using FinexAPI.Models.PurchaseOrder;

namespace FinexAPI.Controllers
{
    [Authorize]
    public class VoucherController : BaseController
    {
        private readonly ILogger<VoucherController> _logger;
        private readonly FinexAppContext _purchaseOrderContext;


        public VoucherController(IHttpContextAccessor httpContextAccessor, FinexAppContext purchaseOrderContext,
            ILogger<VoucherController> logger) : base(httpContextAccessor)
        {
            _logger = logger;
            _purchaseOrderContext = purchaseOrderContext;
        }
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Voucher>>> GetVoucher()
        {
            List<Voucher> vouchers = new List<Voucher>();
            vouchers = await _purchaseOrderContext.vouchers.Include(v => v.vendor).Include(v => v.CountyPO).Where(x => x.OrgAccountId == OrgAccountId).ToListAsync();
            if (vouchers.Count == 0)
            {
                return BadRequest("Voucher does not exist");
            }
            return Ok(vouchers);

        }
        [Route("Voucher/{poId}")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Voucher>>> GetVouchersByPONumber(int poId)
        {
            return await _purchaseOrderContext.vouchers.Include(v => v.vendor).Include(v => v.CountyPO).Where(v => v.poId.Equals(poId) && v.OrgAccountId == OrgAccountId)
                .AsNoTracking().ToListAsync();
        }

        [Route("VoucherIHPO/{ihpoId}")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Voucher>>> GetVouchersByIHPONumber(int ihpoId)
        {
            return await _purchaseOrderContext.vouchers.Include(v => v.vendor).Include(v => v.CountyPO).Where(v => v.ihpoId.Equals(ihpoId) && v.OrgAccountId == OrgAccountId)
                .AsNoTracking().ToListAsync();
        }

        [Route("VoucherByNo/{voucherNo}")]
        [HttpGet]
        public async Task<ActionResult<Voucher>> GetVouchersByVoucherNo(string voucherNo)
        {
            var voucher = await _purchaseOrderContext.vouchers.Include(v => v.vendor).Include(v => v.CountyPO).Where(v => v.voucherVouchNo.Equals(voucherNo) && v.OrgAccountId == OrgAccountId).FirstOrDefaultAsync();
            if (voucher == null)
                return BadRequest("Voucher does not exist");
            return Ok(voucher);

        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Voucher>> GetVoucher(int id)
        {
            var voucher = await _purchaseOrderContext.vouchers.Include(v => v.vendor).Include(v => v.CountyPO).FirstOrDefaultAsync(x => x.Id == id && x.OrgAccountId == OrgAccountId);
            if (voucher == null)
            {
                return BadRequest("Voucher does not exist");
            }
            return voucher;
        }
        [HttpPost]
        public async Task<ActionResult<Voucher>> PostVoucher(Voucher voucher)
        {
            if (voucher == null) return BadRequest("Voucher Can'nt be Null");
            var po = await _purchaseOrderContext.CountyPO.Where(x => x.Id == voucher.poId && x.OrgAccountId == OrgAccountId).FirstOrDefaultAsync();
            if (po != null && voucher.voucherWrittenDate < po.poOpenDate)
            {
                return BadRequest("Selected PO Not yet Open");
            }
            var voucherNumberEach = await _purchaseOrderContext.SettingsValue.Where(x => x.settingsId == 54 && x.OrgAccountId == OrgAccountId).Select(x => x.settingValue).FirstOrDefaultAsync();
            var voucherNumberVendorDateWritten = await _purchaseOrderContext.SettingsValue.Where(x => x.settingsId == 55 && x.OrgAccountId == OrgAccountId).Select(x => x.settingValue).FirstOrDefaultAsync();
            var voucherNumberOnePO = await _purchaseOrderContext.SettingsValue.Where(x => x.settingsId == 56 && x.OrgAccountId == OrgAccountId).Select(x => x.settingValue).FirstOrDefaultAsync();
            var voucherNumberMultiPO = await _purchaseOrderContext.SettingsValue.Where(x => x.settingsId == 57 && x.OrgAccountId == OrgAccountId).Select(x => x.settingValue).FirstOrDefaultAsync();
            if ((voucherNumberEach != null && voucherNumberEach == "1" && voucherNumberOnePO != null && voucherNumberOnePO == "1") ||
                (voucherNumberEach != null && voucherNumberEach == "1" && voucherNumberMultiPO != null && voucherNumberMultiPO == "1") ||
                (voucherNumberEach != null && voucherNumberEach == "1" && voucherNumberVendorDateWritten != null && voucherNumberVendorDateWritten == "1") ||
                (voucherNumberVendorDateWritten != null && voucherNumberVendorDateWritten == "1" && voucherNumberOnePO != null && voucherNumberOnePO == "1") ||
                (voucherNumberVendorDateWritten != null && voucherNumberVendorDateWritten == "1" && voucherNumberMultiPO != null && voucherNumberMultiPO == "1") ||
                (voucherNumberOnePO != null && voucherNumberOnePO == "1" && voucherNumberMultiPO != null && voucherNumberMultiPO == "1"))
            {
                return BadRequest("Select only one option from Assigne Voucher Number configuration");
            }
            voucher.OrgAccountId = OrgAccountId;
            voucher.voucherVouchNo = await FundCalculation.GetVoucherNumber(voucher, OrgAccountId, _purchaseOrderContext);
            _purchaseOrderContext.vouchers.Add(voucher);
            await _purchaseOrderContext.SaveChangesAsync();
            return CreatedAtAction("GetVoucher", new { id = voucher.Id }, voucher);
        }
        [HttpPut("{id}")]
        public async Task<ActionResult<Voucher>> PutVoucher(int id, Voucher voucher)
        {
            if (voucher == null || id != voucher.Id) { return BadRequest("Voucher does not match with id"); }

            try
            {
                var po = await _purchaseOrderContext.CountyPO.Where(x => x.Id == voucher.poId && x.OrgAccountId == OrgAccountId).FirstOrDefaultAsync();
                if (po != null && voucher.voucherWrittenDate < po.poOpenDate)
                {
                    return BadRequest("Selected PO Not yet Open");
                }
                var voucherData = await _purchaseOrderContext.vouchers.FirstOrDefaultAsync(x => x.Id == id && x.OrgAccountId == OrgAccountId);
                if (voucherData == null)
                {
                    return BadRequest("Voucher does not exist");
                }
                voucher.OrgAccountId = OrgAccountId;
                voucher.createdDate = voucherData.createdDate;
                voucher.createdDate = voucherData.createdDate;
                _purchaseOrderContext.Entry(voucherData).State = EntityState.Detached;
                _purchaseOrderContext.vouchers.Update(voucher);

                await _purchaseOrderContext.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
            }
            return Ok(voucher);
        }
        [HttpDelete("{id}")]
        public async Task<ActionResult<Voucher>> DeleteVoucher(int id)
        {
            var voucher = await _purchaseOrderContext.vouchers.FirstOrDefaultAsync(x => x.Id == id && x.OrgAccountId == OrgAccountId);
            if (voucher == null)
            {
                return BadRequest("Voucher does not exist");
            }
            var lineItems = await _purchaseOrderContext.VoucherInvoiceLineItems.Where(x => x.voucherID == id).ToListAsync();
            if (lineItems.Count > 0)
            {
                foreach (var lineItem in lineItems)
                {
                    _purchaseOrderContext.VoucherInvoiceLineItems.Remove(lineItem);
                    await _purchaseOrderContext.SaveChangesAsync();
                    var ihpo = await _purchaseOrderContext.IHPO.FindAsync(lineItem.ihpoId);
                    if (ihpo != null)
                    {
                        await FundCalculation.SetIHPOBalance(ihpo.ID, _purchaseOrderContext);
                    }
                }
            }
            var breakdowns = await _purchaseOrderContext.VoucherBreakDowns.Where(x => x.voucherID == id).ToListAsync();
            if (breakdowns.Count > 0)
            {
                _purchaseOrderContext.VoucherBreakDowns.RemoveRange(breakdowns);
                await _purchaseOrderContext.SaveChangesAsync();
            }
            _purchaseOrderContext.vouchers.Remove(voucher);
            await _purchaseOrderContext.SaveChangesAsync();
            if (voucher != null && voucher.poId != null)
            {
                await FundCalculation.CalculateAndStorePOBalance((int)voucher.poId, _purchaseOrderContext);
            }
            return voucher;
        }

        /// <summary>
        /// get all VoucherBreakdowns by org level
        /// </summary>
        /// <param name="orgId"></param>
        /// <returns></returns>
        [HttpGet("get-voucher-bd-org-id/{orgId}")]
        public async Task<IActionResult> GetVoucherBreakdowns(int orgId, int? skip = null, int? pageCount = null)
        {
            try
            {
                var voucherBreakDowns = new List<VoucherBreakDown>();
                var total = 0;
                if (skip != null && pageCount != null)
                {
                    var v = await _purchaseOrderContext.VoucherBreakDowns.Where(x => x.OrgAccountId == OrgAccountId && x.voucherID == orgId).AsNoTracking().ToListAsync();
                    total = v.Count();
                    voucherBreakDowns = v.Skip(skip.Value).Take(pageCount.Value).ToList();

                }
                else
                {
                    voucherBreakDowns = await _purchaseOrderContext.VoucherBreakDowns.Where(x => x.voucherID == orgId).AsNoTracking().ToListAsync();
                    total = voucherBreakDowns.Count();
                }
                return Ok(new { voucherBreakDowns, total });

            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
            }
            return Ok(null);

        }
        /// <summary>
        /// get all VoucherBreakdowns by org level
        /// </summary>
        /// <param name="orgId"></param>
        /// <returns></returns>
        [HttpGet("get-voucher-bd-id/{id}")]
        public async Task<IActionResult> GetVoucherBreakdownById(int id)
        {
            try
            {
                var voucherBreakDown = await _purchaseOrderContext.VoucherBreakDowns
                   .FirstOrDefaultAsync(x => x.ID == id && x.OrgAccountId == OrgAccountId);
                if (voucherBreakDown == null)
                {
                    return BadRequest("VoucherBreakDown does not exist");
                }
                return Ok(voucherBreakDown);

            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
            }
            return Ok(null);

        }
        /// <summary>
        /// create voucherBreakDown
        /// </summary>
        /// <param name="voucherBreakDown"></param>
        /// <returns></returns>
        [Route("VoucherBreakdown")]
        [HttpPost]
        public async Task<ActionResult> CreateVoucherBreakdown([FromBody] VoucherBreakDown voucherBreakDown)
        {
            if (voucherBreakDown == null) { return BadRequest("VoucherBreakDown does not exist"); }
            //if (voucherBreakDown.voucherAmount < 0)
            //{
            //    return BadRequest("Negative value does not allowed");
            //}
            string[] codes = (voucherBreakDown.voucherIHAC ?? "").Replace("_", "-").Split('-');
            if (codes.Length > 3)
            {
                var voucher = await _purchaseOrderContext.vouchers.Where(x => x.Id == voucherBreakDown.voucherID && x.OrgAccountId == OrgAccountId).FirstOrDefaultAsync();
                var progRef = await _purchaseOrderContext.IHCPrograms.Where(x => x.code == codes[0] && x.OrgAccountId == OrgAccountId).FirstOrDefaultAsync();
                if (progRef != null && voucher != null && voucher.voucherWrittenDate.Date < progRef.startDate.Date)
                {
                    return BadRequest("You can't add Inactive program");
                }
                var departmentRef = await _purchaseOrderContext.IHCDepartments.Where(x => x.code == codes[1] && x.OrgAccountId == OrgAccountId).FirstOrDefaultAsync();
                if (departmentRef != null && voucher != null && voucher.voucherWrittenDate.Date < departmentRef.startDate.Date)
                {
                    return BadRequest("You can't add Inactive Department");
                }
                var accountRef = await _purchaseOrderContext.IHCAccounts.Where(x => x.code == codes[2] && x.OrgAccountId == OrgAccountId).FirstOrDefaultAsync();
                if (accountRef != null && voucher != null && voucher.voucherWrittenDate.Date < accountRef.startDate.Date)
                {
                    return BadRequest("You can't add Inactive Account");
                }
                var subAccountRef = await _purchaseOrderContext.IHCSubAccounts.Where(x => x.code == codes[3] && x.OrgAccountId == OrgAccountId).FirstOrDefaultAsync();
                if (subAccountRef != null && voucher != null && voucher.voucherWrittenDate.Date < subAccountRef.startDate.Date)
                {
                    return BadRequest("You can't add Inactive SubAccount");
                }
            }
            try
            {
                voucherBreakDown.OrgAccountId = OrgAccountId;
                _purchaseOrderContext.VoucherBreakDowns.Add(voucherBreakDown);

                await _purchaseOrderContext.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
            }
            return Ok(voucherBreakDown);

        }
        /// <summary>
        /// update voucherBreakDown
        /// </summary>
        /// <param name="voucherBreakDown"></param>
        /// <returns></returns> 
        [Route("VoucherBreakDown/{id}")]
        [HttpPut]
        public async Task<ActionResult> UpdateVoucherBreakdown(int id, [FromBody] VoucherBreakDown voucherBreakDown)
        {
            if (voucherBreakDown == null || id != voucherBreakDown.ID) { return BadRequest("VoucherBreakDowns does not match with id"); }
            //if (voucherBreakDown.voucherAmount < 0)
            //{
            //    return BadRequest("Negative value does not allowed");
            //}
            string[] codes = (voucherBreakDown.voucherIHAC ?? "").Split('_');
            if (codes.Length > 3)
            {
                var voucher = await _purchaseOrderContext.vouchers.Where(x => x.Id == voucherBreakDown.voucherID && x.OrgAccountId == OrgAccountId).FirstOrDefaultAsync();
                var progRef = await _purchaseOrderContext.IHCPrograms.Where(x => x.code == codes[0] && x.OrgAccountId == OrgAccountId).FirstOrDefaultAsync();
                if (progRef != null && voucher != null && voucher.voucherWrittenDate.Date < progRef.startDate.Date)
                {
                    return BadRequest("You can't add Inactive program");
                }
                var departmentRef = await _purchaseOrderContext.IHCDepartments.Where(x => x.code == codes[1] && x.OrgAccountId == OrgAccountId).FirstOrDefaultAsync();
                if (departmentRef != null && voucher != null && voucher.voucherWrittenDate.Date < departmentRef.startDate.Date)
                {
                    return BadRequest("You can't add Inactive Department");
                }
                var accountRef = await _purchaseOrderContext.IHCAccounts.Where(x => x.code == codes[2] && x.OrgAccountId == OrgAccountId).FirstOrDefaultAsync();
                if (accountRef != null && voucher != null && voucher.voucherWrittenDate.Date < accountRef.startDate.Date)
                {
                    return BadRequest("You can't add Inactive Account");
                }
                var subAccountRef = await _purchaseOrderContext.IHCSubAccounts.Where(x => x.code == codes[3] && x.OrgAccountId == OrgAccountId).FirstOrDefaultAsync();
                if (subAccountRef != null && voucher != null && voucher.voucherWrittenDate.Date < subAccountRef.startDate.Date)
                {
                    return BadRequest("You can't add Inactive SubAccount");
                }
            }
            try
            {
                var voucherBreakDownEntity = await _purchaseOrderContext.VoucherBreakDowns.FirstOrDefaultAsync(x => x.ID == id && x.OrgAccountId == OrgAccountId);
                if (voucherBreakDownEntity == null)
                {
                    return BadRequest("VoucherBreakDowns does not exist");
                }
                voucherBreakDown.OrgAccountId = OrgAccountId;
                voucherBreakDown.IhpoLineItemID = voucherBreakDownEntity.IhpoLineItemID;
                voucherBreakDown.createdDate = voucherBreakDownEntity.createdDate;
                voucherBreakDown.createdBy = voucherBreakDownEntity.createdBy;
                _purchaseOrderContext.Entry(voucherBreakDownEntity).State = EntityState.Detached;
                _purchaseOrderContext.VoucherBreakDowns.Update(voucherBreakDown);

                await _purchaseOrderContext.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
            }
            return Ok(voucherBreakDown);

        }
        /// <summary>
        /// delete voucherBreakDown
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [Route("VoucherBreakDown/{id}")]
        [HttpDelete]
        public async Task<ActionResult> DeleteVoucherBreakdown(int id)
        {
            try
            {
                var voucherBreakDown = await _purchaseOrderContext.VoucherBreakDowns.FirstOrDefaultAsync(x => x.ID == id && x.OrgAccountId == OrgAccountId);
                if (voucherBreakDown == null)
                {
                    return BadRequest("VoucherBreakDowns does not exist");
                }
                _purchaseOrderContext.VoucherBreakDowns.Remove(voucherBreakDown);

                await _purchaseOrderContext.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return Ok(false);
            }
            return Ok(true);

        }

        /// <summary>
        /// get all VoucherInvoiceLineItems
        /// </summary>
        /// <returns></returns>
        [Route("VoucherInvoiceLineItem")]
        [HttpGet]
        public async Task<IActionResult> GetVoucherInvoiceLineItems(int? skip = null, int? pageCount = null)
        {
            try
            {

                var voucherInvoiceLineItems = new List<VoucherInvoiceLineItem>();
                var total = 0;
                if (skip != null && pageCount != null)
                {
                    var v = await _purchaseOrderContext.VoucherInvoiceLineItems.AsNoTracking().ToListAsync();
                    total = v.Count();
                    voucherInvoiceLineItems = v.Skip(skip.Value).Take(pageCount.Value).ToList();

                }
                else
                {
                    voucherInvoiceLineItems = await _purchaseOrderContext.VoucherInvoiceLineItems.AsNoTracking().ToListAsync();
                    total = voucherInvoiceLineItems.Count();
                }

                if (voucherInvoiceLineItems == null || !voucherInvoiceLineItems.Any())
                {
                    return BadRequest("VoucherInvoiceLineItem does not exist");
                }
                return Ok(new { voucherInvoiceLineItems, total });



            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
            }
            return Ok(null);

        }
        /// <summary>
        /// get VoucherInvoiceLineItems by id
        /// </summary>
        /// <param name="orgId"></param>
        /// <returns></returns>
        [Route("VoucherInvoiceLineItem/{id}")]
        [HttpGet]
        public async Task<IActionResult> GetVoucherInvoiceLineItemsById(int id)
        {
            try
            {
                var voucherInvoiceLineItems = await _purchaseOrderContext.VoucherInvoiceLineItems.Where(x => x.Id == id).FirstOrDefaultAsync();
                if (voucherInvoiceLineItems == null)
                {
                    return BadRequest("VoucherInvoiceLineItem does not exist");
                }
                return Ok(voucherInvoiceLineItems);

            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
            }
            return Ok(null);

        }
        /// <summary>
        /// get VoucherInvoiceLineItems by id
        /// </summary>
        /// <param name="orgId"></param>
        /// <returns></returns>
        [Route("VoucherInvoiceLineItemByVoucherId/{voucherId}")]
        [HttpGet]
        public async Task<IActionResult> GetVoucherInvoiceLineItemsByVoucherId(int voucherId)
        {
            try
            {
                var voucherInvoiceLineItems = await _purchaseOrderContext.VoucherInvoiceLineItems.Where(vl => vl.voucherID == voucherId).ToListAsync();
                if (voucherInvoiceLineItems == null)
                {
                    return BadRequest("VoucherInvoiceLineItem does not exist");
                }
                foreach (var item in voucherInvoiceLineItems)
                {
                    if (item.ihpoId != null)
                    {
                        item.ihpoNumber = await _purchaseOrderContext.IHPO.Where(x => x.ID == item.ihpoId).Select(x => x.reqNumber).FirstOrDefaultAsync();
                    }
                }
                return Ok(voucherInvoiceLineItems);

            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
            }
            return Ok(null);

        }
        /// <summary>
        /// create voucherInvoiceLineItem
        /// </summary>
        /// <param name=")"></param>
        /// <returns></returns>
        [Route("VoucherInvoiceLineItem")]
        [HttpPost]
        public async Task<ActionResult> CreateVoucherInvoiceLineItem([FromBody] VoucherInvoiceLineItem voucherInvoiceLineItem)
        {
            if (voucherInvoiceLineItem == null) { return BadRequest("VoucherInvoiceLineItem does not exist"); }

            voucherInvoiceLineItem.OrgAccountId = OrgAccountId;

            //if (voucherInvoiceLineItem.amount < 0)
            //{
            //    return BadRequest("Negative value does not allowed");
            //}
            try
            {

                var voucher = await _purchaseOrderContext.vouchers.Where(x => x.Id == voucherInvoiceLineItem.voucherID).FirstOrDefaultAsync();
                if (voucher != null)
                {
                    if (voucher.voucherWrittenDate.Date < voucherInvoiceLineItem.invoiceDate.Date)
                    {
                        return BadRequest("You cannot pay for future Invoices");
                    }
                    decimal voucherAmount = await _purchaseOrderContext.VoucherInvoiceLineItems.Where(x => x.voucherID == voucher.Id).Select(x => x.amount).SumAsync();
                    voucherAmount = voucherAmount + voucherInvoiceLineItem.amount;
                    var setting = await _purchaseOrderContext.SettingsValue.Where(x => x.settingsId == 21 && x.OrgAccountId == OrgAccountId).Select(x => x.settingValue).FirstOrDefaultAsync();
                    if (setting == null || setting.Equals("0"))
                    {
                        var poBalance = await _purchaseOrderContext.CountyPOPricing.Where(x => x.poId == voucher.poId).Select(x => x.poBalance).FirstOrDefaultAsync();
                        if (voucherAmount > poBalance)
                        {
                            return BadRequest("Voucher amount can't Exceed PO amount");
                        }
                    }
                    _purchaseOrderContext.VoucherInvoiceLineItems.Add(voucherInvoiceLineItem);
                    await _purchaseOrderContext.SaveChangesAsync();
                    voucher.voucherAmount = voucherAmount;
                    if (voucherInvoiceLineItem.ihpoId != null)
                    {
                        voucher.ihpoId = voucherInvoiceLineItem.ihpoId;
                    }
                    _purchaseOrderContext.vouchers.Update(voucher);
                    await _purchaseOrderContext.SaveChangesAsync();
                    var ihpo = await _purchaseOrderContext.IHPO.FindAsync(voucherInvoiceLineItem.ihpoId);

                    await _purchaseOrderContext.VoucherIHPO.AddAsync(new VoucherIHPO
                    {
                        IHPOLineID = voucherInvoiceLineItem.IhpoLineItemID,
                        VoucheredAmont = voucherInvoiceLineItem.amount,
                        VoucherID = voucherInvoiceLineItem.voucherID,
                        VoucherIHPOLineID = voucherInvoiceLineItem.Id
                    });

                    if (voucherInvoiceLineItem.IhpoLineItemID.HasValue)
                    {
                        var ihpoLineItem = await _purchaseOrderContext.IHPOLineItem.FirstOrDefaultAsync(x => x.ID == voucherInvoiceLineItem.IhpoLineItemID);
                        if (ihpoLineItem != null)
                        {
                            var amountUsed = _purchaseOrderContext.VoucherIHPO.Where(x => x.VoucheredAmont.HasValue && x.IHPOLineID == ihpoLineItem.ID).Sum(x => x.VoucheredAmont!.Value) + voucherInvoiceLineItem.amount;
                            ihpoLineItem.balance = amountUsed >= ihpoLineItem.reqDTotal ? 0 : ihpoLineItem.reqDTotal - amountUsed;
                        }
                    }

                    await _purchaseOrderContext.SaveChangesAsync();


                    if (ihpo != null)
                    {
                        await FundCalculation.SetIHPOBalance(ihpo.ID, _purchaseOrderContext);
                    }
                }
                if (voucher != null && voucher.poId != null)
                {
                    await FundCalculation.CalculateAndStorePOBalance((int)voucher.poId, _purchaseOrderContext);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
            }
            return Ok(voucherInvoiceLineItem);

        }
        /// <summary>
        /// update voucherInvoiceLineItem
        /// </summary>
        /// <param name="voucherInvoiceLineItem"></param>
        /// <returns></returns>
        [Route("VoucherInvoiceLineItem/{id}")]
        [HttpPut]
        public async Task<ActionResult> UpdateVoucherInvoiceLineItem(int id, [FromBody] VoucherInvoiceLineItem voucherInvoiceLineItem)
        {
            voucherInvoiceLineItem.OrgAccountId = OrgAccountId;
            if (voucherInvoiceLineItem == null || id != voucherInvoiceLineItem.Id) { return BadRequest("VoucherInvoiceLineItem does not match with id"); }
            //if (voucherInvoiceLineItem.amount < 0)
            //{
            //    return BadRequest("Negative value does not allowed");
            //}
            try
            {
                var voucherInvoiceLineItemEntity = await _purchaseOrderContext.VoucherInvoiceLineItems.FindAsync(id);
                if (voucherInvoiceLineItemEntity == null)
                {
                    return BadRequest("VoucherInvoiceLineItem does not exist");
                }

                var voucher = await _purchaseOrderContext.vouchers.Where(x => x.Id == voucherInvoiceLineItem.voucherID).FirstOrDefaultAsync();
                if (voucher != null)
                {
                    if (voucher.voucherWrittenDate.Date < voucherInvoiceLineItem.invoiceDate.Date)
                    {
                        return BadRequest("You cannot pay for future Invoices");
                    }
                    decimal voucherAmount = await _purchaseOrderContext.VoucherInvoiceLineItems.Where(x => x.voucherID == voucher.Id).Select(x => x.amount).SumAsync();
                    voucherAmount = voucherAmount + (voucherInvoiceLineItem.amount - voucherInvoiceLineItemEntity.amount);
                    var setting = await _purchaseOrderContext.SettingsValue.Where(x => x.settingsId == 21 && x.OrgAccountId == OrgAccountId).Select(x => x.settingValue).FirstOrDefaultAsync();
                    if (setting == null || setting.Equals("0"))
                    {
                        var poBalance = await _purchaseOrderContext.CountyPOPricing.Where(x => x.poId == voucher.poId).Select(x => x.poBalance).FirstOrDefaultAsync();
                        if (voucherAmount > poBalance)
                        {
                            return BadRequest("Voucher amount can't Exceed PO amount");
                        }
                    }
                    if (voucherInvoiceLineItem.ihpoId != null)
                    {
                        voucher.ihpoId = voucherInvoiceLineItem.ihpoId;
                    }
                    voucher.voucherAmount = voucherAmount;
                    voucherInvoiceLineItem.IhpoLineItemID = voucherInvoiceLineItemEntity.IhpoLineItemID;
                    voucherInvoiceLineItem.createdDate = voucherInvoiceLineItemEntity.createdDate;
                    voucherInvoiceLineItem.createdBy = voucherInvoiceLineItemEntity.createdBy;
                    _purchaseOrderContext.Entry(voucherInvoiceLineItemEntity).State = EntityState.Detached;
                    _purchaseOrderContext.VoucherInvoiceLineItems.Update(voucherInvoiceLineItem);
                    await _purchaseOrderContext.SaveChangesAsync();
                    _purchaseOrderContext.vouchers.Update(voucher);
                    await _purchaseOrderContext.SaveChangesAsync();

                    var voucherIHPO = await _purchaseOrderContext.VoucherIHPO.FirstOrDefaultAsync(x => x.VoucherIHPOLineID == voucherInvoiceLineItem.Id);
                    if (voucherIHPO != null)
                    {
                        voucherIHPO.VoucheredAmont = voucherInvoiceLineItem.amount;
                        if (voucherIHPO.IHPOLineID.HasValue)
                        {
                            var ihpoLineItem = await _purchaseOrderContext.IHPOLineItem.FirstOrDefaultAsync(x => x.ID == voucherIHPO.IHPOLineID);
                            if (ihpoLineItem != null)
                            {
                                var amountUsed = _purchaseOrderContext.VoucherIHPO.Where(x => x.ID != voucherIHPO.ID && x.VoucheredAmont.HasValue && x.IHPOLineID== voucherIHPO.IHPOLineID).Sum(x => x.VoucheredAmont!.Value) + voucherInvoiceLineItem.amount;
                                ihpoLineItem.balance = amountUsed >= ihpoLineItem.reqDTotal ? 0 : ihpoLineItem.reqDTotal - amountUsed;
                            }
                        }
                    }

                    await _purchaseOrderContext.SaveChangesAsync();

                    var ihpo = await _purchaseOrderContext.IHPO.FindAsync(voucherInvoiceLineItem.ihpoId);
                    if (ihpo != null)
                    {
                        await FundCalculation.SetIHPOBalance(ihpo.ID, _purchaseOrderContext);
                    }
                }
                if (voucher != null && voucher.poId != null)
                {
                    await FundCalculation.CalculateAndStorePOBalance((int)voucher.poId, _purchaseOrderContext);
                }

            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
            }
            return Ok(voucherInvoiceLineItem);

        }
        /// <summary>
        /// delete voucherInvoiceLineItem
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [Route("VoucherInvoiceLineItem/{id}")]
        [HttpDelete]
        public async Task<ActionResult> DeleteVoucherInvoiceLineItem(int id)
        {
            try
            {
                var voucherInvoiceLineItem = await _purchaseOrderContext.VoucherInvoiceLineItems.FindAsync(id);
                if (voucherInvoiceLineItem == null)
                {
                    return BadRequest("VoucherInvoiceLineItem does not exist");
                }
                _purchaseOrderContext.VoucherInvoiceLineItems.Remove(voucherInvoiceLineItem);
                var voucherIhpo = await _purchaseOrderContext.VoucherIHPO.FirstOrDefaultAsync(x => voucherInvoiceLineItem.Id == x.VoucherIHPOLineID);
                if (voucherIhpo != null)
                    _purchaseOrderContext.VoucherIHPO.Remove(voucherIhpo);

                await _purchaseOrderContext.SaveChangesAsync();

                var voucher = await _purchaseOrderContext.vouchers.Where(x => x.Id == voucherInvoiceLineItem.voucherID).FirstOrDefaultAsync();
                if (voucher != null)
                {
                    decimal voucherAmount = await _purchaseOrderContext.VoucherInvoiceLineItems.Where(x => x.voucherID == voucher.Id).Select(x => x.amount).SumAsync();
                    voucher.voucherAmount = voucherAmount;
                    _purchaseOrderContext.vouchers.Update(voucher);

                    if (voucherInvoiceLineItem.IhpoLineItemID.HasValue)
                    {
                        var ihpoLineItem = await _purchaseOrderContext.IHPOLineItem.FirstOrDefaultAsync(x => x.ID == voucherInvoiceLineItem.IhpoLineItemID);
                        if (ihpoLineItem != null)
                        {
                            var amountUsed = _purchaseOrderContext.VoucherIHPO.Where(x => x.VoucheredAmont.HasValue && voucherInvoiceLineItem.Id != x.VoucherIHPOLineID).Sum(x => x.VoucheredAmont!.Value) + voucherInvoiceLineItem.amount;
                            ihpoLineItem.balance = amountUsed >= ihpoLineItem.reqDTotal ? 0 : ihpoLineItem.reqDTotal - amountUsed;
                        }
                    }

                    await _purchaseOrderContext.SaveChangesAsync();
                    var ihpo = await _purchaseOrderContext.IHPO.FindAsync(voucherInvoiceLineItem.ihpoId);
                    if (ihpo != null)
                    {
                        await FundCalculation.SetIHPOBalance(ihpo.ID, _purchaseOrderContext);
                    }
                }
                if (voucher != null && voucher.poId != null)
                {
                    await FundCalculation.CalculateAndStorePOBalance((int)voucher.poId, _purchaseOrderContext);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return Ok(false);
            }
            return Ok(true);

        }

        [HttpPost("TemporaryVoucherNumber")]
        public async Task<ActionResult<string>> GetTemporaryVoucherNumber(Voucher voucher)
        {
            var number = await FundCalculation.GetVoucherNumber(voucher, OrgAccountId, _purchaseOrderContext);
            if (number != null)
            {
                return Ok(number);
            }
            else
            {
                return BadRequest("Voucher number does not exist");
            }
        }



        //Voucher Filter
        [Route("Filter")]
        [HttpPost]
        public async Task<ActionResult> Filter(bool desc, string sortKey = "modifiedDate", string? VoucherDescription = "", string? voucherAmount = "", string? VoucherBalance = "", string? name = "", string? VoucherVouchNo = "", string? poNumber = "", string? search = "", string? approve = "", DateTime? writtenDate = null, DateTime? postDate = null, DateOnly? approvalDate = null, int ihpoId = 0, int poId = 0, string? year = "", int skip = 0, int take = 0)
        {
            int.TryParse(year, out var yearVal);
            //if (!string.IsNullOrEmpty(year))
            //    yearVal = Convert.ToInt32(year);

            ListResultController<Voucher> _cmnCntrlr = new ListResultController<Voucher>();

            try
            {
                if (VoucherDescription == "" && voucherAmount == "" && VoucherBalance == "" && VoucherVouchNo == "" && name == "" && poNumber == "" && search == "" && ihpoId == 0 && poId == 0 && writtenDate == null && postDate == null && approvalDate == null && approve == "")
                {
                    var vchlistQuery = _purchaseOrderContext.vouchers.Include(v => v.vendor).Include(v => v.CountyPO).Where(p =>
                    p.OrgAccountId == OrgAccountId
                        // && p.voucherWrittenDate.Year >= DateTime.Now.Year
                        ).OrderByCustom(sortKey, desc);

                    if (string.IsNullOrEmpty(year))
                        vchlistQuery = vchlistQuery.Where(p => p.voucherWrittenDate.Year >= DateTime.Now.Year - 1);
                    else
                        vchlistQuery = vchlistQuery.Where(p => p.voucherWrittenDate.Year == yearVal);

                    var vchlist = await vchlistQuery.ToListAsync();

                    if (take == 0)
                    {
                        return Ok(new { data = vchlist, Total = vchlist.Count });
                    }
                    else
                    {
                        return Ok(new { data = vchlist.Skip(skip).Take(take).ToList(), Total = vchlist.Count });

                    }
                }
                else if (search == "")
                {
                    var voucherQuery = _purchaseOrderContext.vouchers.Include(v => v.vendor).Include(v => v.CountyPO)
                        .Where(p => p.OrgAccountId == OrgAccountId);

                    if (!string.IsNullOrEmpty(VoucherDescription))
                        voucherQuery = voucherQuery.Where(p => p.voucherDescription.Contains(VoucherDescription));
                    if (!string.IsNullOrEmpty(voucherAmount))
                        voucherQuery = voucherQuery.Where(p => p.voucherAmount.ToString().Contains(voucherAmount));
                    if (!string.IsNullOrEmpty(name))
                        voucherQuery = voucherQuery.Where(p => p.vendor.name.Contains(name));
                    if (!string.IsNullOrEmpty(VoucherBalance))
                        voucherQuery = voucherQuery.Where(p => p.voucherBalance.ToString().Contains(VoucherBalance));
                    if (!string.IsNullOrEmpty(VoucherVouchNo))
                        voucherQuery = voucherQuery.Where(p => p.voucherVouchNo.Contains(VoucherVouchNo));
                    if (!string.IsNullOrEmpty(poNumber))
                        voucherQuery = voucherQuery.Where(p => p.CountyPO.poNumber.Contains(poNumber));
                    if (writtenDate != null)
                        voucherQuery = voucherQuery.Where(p => p.voucherWrittenDate == writtenDate.Value.Date);
                    if (postDate != null)
                        voucherQuery = voucherQuery.Where(p => p.postDate.Value.Date == postDate.Value.Date);
                    if (approvalDate != null)
                        voucherQuery = voucherQuery.Where(p => p.approvalDate == approvalDate);
                    if (!string.IsNullOrEmpty(approve))
                        voucherQuery = voucherQuery.Where(p => p.approved.ToString().Contains(approve));
                    if (ihpoId != 0)
                        voucherQuery = voucherQuery.Where(p => p.ihpoId == ihpoId);
                    if (poId != 0)
                        voucherQuery = voucherQuery.Where(p => p.poId == poId);
                    if (yearVal != 0)
                        voucherQuery = voucherQuery.Where(p => p.voucherWrittenDate.Year == yearVal);

                    voucherQuery = voucherQuery.OrderByCustom(sortKey, desc);

                    //vchlist = FilterVouchers(vchlist, ihpoId, poId);

                    return await _cmnCntrlr.returnResponse(take, skip, voucherQuery, 0);

                    //if (take == 0)
                    //{
                    //    return Ok(new { data = vchlist, Total = vchlist.Count });
                    //}
                    //else
                    //{
                    //    return Ok(new { data = vchlist.Skip(skip).Take(take).ToList(), Total = vchlist.Count });

                    //}
                }
                else
                {
                    search = string.IsNullOrEmpty(search) ? "" : search;
                    var voucherQuery = _purchaseOrderContext.vouchers.Include(v => v.vendor).Include(v => v.CountyPO).Where(p => (
                    p.voucherDescription.Contains(search) ||
                    p.voucherAmount.ToString().Contains(search) ||
                    p.vendor.name.Contains(search) ||
                    p.voucherBalance.ToString().Contains(search) ||
                    p.CountyPO.poNumber.Contains(search) ||
                    p.voucherVouchNo.Contains(search) ||
                    p.approved.ToString().Contains(search))
                    && p.OrgAccountId == OrgAccountId);

                    if (ihpoId != 0)
                        voucherQuery = voucherQuery.Where(p => p.ihpoId == ihpoId);
                    if (poId != 0)
                        voucherQuery = voucherQuery.Where(p => p.poId == poId);

                    if (yearVal != 0)
                        voucherQuery = voucherQuery.Where(p => p.voucherWrittenDate.Year == yearVal);

                    voucherQuery = voucherQuery.OrderByCustom(sortKey, desc);
                    //List = FilterVouchers(List, ihpoId, poId);

                    return await _cmnCntrlr.returnResponse(take, skip, voucherQuery, 0);

                    //if (take == 0)
                    //{
                    //    return Ok(new { data = List, Total = List.Count });
                    //}
                    //else
                    //{
                    //    return Ok(new { data = List.Skip(skip).Take(take).ToList(), Total = List.Count });

                    //}
                }
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        //private List<Voucher> FilterVouchers(List<Voucher> vouchers, int ihpoId, int poId)
        //{
        //    if (vouchers.Count > 0 && ihpoId != 0 && poId != 0)
        //    {
        //        return vouchers.Where(x => x.poId == poId && x.ihpoId == ihpoId).ToList();
        //    }
        //    else if (vouchers.Count > 0 && poId != 0)
        //    {
        //        return vouchers.Where(x => x.poId == poId).ToList();
        //    }
        //    else if (vouchers.Count > 0 && ihpoId != 0)
        //    {
        //        return vouchers.Where(x => x.ihpoId == ihpoId).ToList();
        //    }
        //    else
        //    {
        //        return vouchers;
        //    }
        //}

        [Route("BatchPostVouchers")]
        [HttpPost]
        public async Task<ActionResult<string>> BatchPostVouchers(DateTime startDate, DateTime endDate, DateTime postDate)
        {
            List<Voucher> vouchers = await _purchaseOrderContext.vouchers.Where(v => v.voucherWrittenDate.Date >= startDate.Date && v.voucherWrittenDate.Date <= endDate.Date).ToListAsync();
            foreach (Voucher voucher in vouchers)
            {
                voucher.postDate = postDate;
                voucher.posted = true;
            }
            _purchaseOrderContext.vouchers.UpdateRange(vouchers);
            await _purchaseOrderContext.SaveChangesAsync();
            return Ok("Posted");
        }
        [Route("UnPostVoucher/{id}")]
        [HttpPut]
        public async Task<ActionResult<string>> UnPostVouchers(int id)
        {
            Voucher voucher = await _purchaseOrderContext.vouchers.Where(v => v.Id == id).FirstOrDefaultAsync();
           
                voucher.postDate = null;
                voucher.posted = false;
            
            _purchaseOrderContext.vouchers.Update(voucher);
            await _purchaseOrderContext.SaveChangesAsync();
            return Ok("UnPosted");
        }

        [Route("BatchVoucher")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<VoucherBatch>>> GetBatchVouchers(string id = "", DateOnly? writtenDate = null, DateOnly? postdate = null, DateOnly? printDate = null, string? search = "", int skip = 0, int take = 0)
        {
            if (search == "")
            {
                var list = await _purchaseOrderContext.VoucherBatchs.Where(x =>
                x.ID.ToString().Contains(string.IsNullOrEmpty(id) ? "" : id)
                && x.OrgAccountId == OrgAccountId).OrderByDescending(a => a.ID).ToListAsync();

                list = FilterVoucherBatch(list, writtenDate, postdate, printDate);
                if (take == 0)
                {
                    return Ok(new { data = list, total = list.Count });
                }
                else
                {
                    return Ok(new { data = list.Skip(skip).Take(take).ToList(), total = list.Count });
                }
            }
            else
            {
                var list = await _purchaseOrderContext.VoucherBatchs.Where(x =>
                x.ID.ToString().Contains(string.IsNullOrEmpty(search) ? "" : search)
                && x.OrgAccountId == OrgAccountId).OrderByDescending(a => a.ID).ToListAsync();
                if (take == 0)
                {
                    return Ok(new { data = list, total = list.Count });
                }
                else
                {
                    return Ok(new { data = list.Skip(skip).Take(take).ToList(), total = list.Count });
                }
            }

        }
        private List<VoucherBatch> FilterVoucherBatch(List<VoucherBatch> batches, DateOnly? writtenDate, DateOnly? postDate, DateOnly? printDate)
        {
            if (writtenDate != null && postDate != null && printDate != null)
            {
                DateOnly wDate = (DateOnly)writtenDate;
                DateOnly poDate = (DateOnly)postDate;
                DateOnly prDate = (DateOnly)printDate;
                return batches.Where(x => x.dateWritten.Equals(wDate)
                && x.datePosted.Equals(poDate)
                && x.datePrinted.Equals(prDate)).ToList();
            }
            else if (writtenDate != null && postDate != null)
            {
                DateOnly wDate = (DateOnly)writtenDate;
                DateOnly poDate = (DateOnly)postDate;
                return batches.Where(x => x.dateWritten.Equals(wDate)
                && x.datePosted.Equals(poDate)).ToList();
            }
            else if (postDate != null && printDate != null)
            {
                DateOnly pDate = (DateOnly)postDate;
                DateOnly prDate = (DateOnly)printDate;
                return batches.Where(x => x.datePosted.Equals(pDate)
                && x.datePrinted.Equals(prDate)).ToList();
            }
            else if (writtenDate != null && printDate != null)
            {
                DateOnly wDate = (DateOnly)writtenDate;
                DateOnly prDate = (DateOnly)printDate;
                return batches.Where(x => x.dateWritten.Equals(wDate) && x.datePrinted.Equals(prDate)).ToList();
            }
            else if (writtenDate != null)
            {
                DateOnly wDate = (DateOnly)writtenDate;
                return batches.Where(x => x.dateWritten.Equals(wDate)).ToList();
            }
            else if (postDate != null)
            {
                DateOnly pDate = (DateOnly)postDate;
                return batches.Where(x => x.datePosted.Equals(pDate)).ToList();
            }
            else if (printDate != null)
            {
                DateOnly prDate = (DateOnly)printDate;
                return batches.Where(x => x.datePrinted.Equals(prDate)).ToList();
            }
            else
            {
                return batches;
            }
        }
        [Route("BatchVoucher/{id}")]
        [HttpGet]
        public async Task<ActionResult<VoucherBatch>> GetBatchVoucher(int id)
        {
            var voucherBatch = await _purchaseOrderContext.VoucherBatchs.Where(x => x.ID == id && x.OrgAccountId == OrgAccountId).FirstOrDefaultAsync();
            if (voucherBatch == null)
            {
                return BadRequest("VoucherBatch does not exist");
            }
            return Ok(voucherBatch);
        }
        [Route("BatchVoucher")]
        [HttpPost]
        public async Task<ActionResult<VoucherBatch>> CreateVoucherBatch(VoucherBatch voucherBatch)
        {
            if (voucherBatch == null)
            {
                return BadRequest("VoucherBatch does not exist");
            }
            voucherBatch.OrgAccountId = OrgAccountId;
            voucherBatch.dateWritten = DateOnly.FromDateTime(DateTime.Now);
            _purchaseOrderContext.VoucherBatchs.Add(voucherBatch);
            await _purchaseOrderContext.SaveChangesAsync();
            return Ok(voucherBatch);
        }
        [Route("BatchVoucher")]
        [HttpPut]
        public async Task<ActionResult<VoucherBatch>> UpdateVoucherBatch(int id, VoucherBatch voucherBatch)
        {
            var batch = await _purchaseOrderContext.VoucherBatchs.FindAsync(id);
            if (batch == null)
            {
                return BadRequest("VoucherBatch does not exist");
            }
            if (id != voucherBatch.ID)
            {
                return BadRequest("VoucherBatch does not match with id");
            }
            voucherBatch.OrgAccountId = OrgAccountId;
            _purchaseOrderContext.VoucherBatchs.Entry(batch).State = EntityState.Detached;
            _purchaseOrderContext.VoucherBatchs.Update(voucherBatch);
            await _purchaseOrderContext.SaveChangesAsync();
            return Ok(voucherBatch);
        }
        [Route("BatchVoucher/{id}")]
        [HttpDelete]
        public async Task<ActionResult<VoucherBatch>> DeleteVoucherBatch(int id)
        {
            var batch = await _purchaseOrderContext.VoucherBatchs.Where(x => x.ID == id && x.OrgAccountId == OrgAccountId).FirstOrDefaultAsync();
            if (batch == null)
            {
                return BadRequest("VoucherBatch does not exist");
            }
            var batchLinks = await _purchaseOrderContext.voucherBatchLink.Where(x => x.batchId == id).ToListAsync();
            if (batchLinks.Count > 0)
            {
                foreach (var link in batchLinks)
                {
                    var voucher = await _purchaseOrderContext.vouchers.Where(x => x.Id == link.voucherId).FirstOrDefaultAsync();
                    if (voucher != null && voucher.postDate != null)
                    {
                        voucher.postDate = null;
                        voucher.posted = false;
                    }
                    _purchaseOrderContext.vouchers.Update(voucher);
                    await _purchaseOrderContext.SaveChangesAsync();
                }
                _purchaseOrderContext.voucherBatchLink.RemoveRange(batchLinks);
            }
            _purchaseOrderContext.VoucherBatchs.Remove(batch);
            await _purchaseOrderContext.SaveChangesAsync();
            return Ok(true);
        }
        [Route("AddVouhersToBatch")]
        [HttpPost]
        public async Task<ActionResult<IEnumerable<Voucher>>> AddVouhersToBatch(List<int> ids, int batchId)
        {
            List<VoucherBatchLink> batchLinks = new List<VoucherBatchLink>();
            foreach (var id in ids)
            {
                var voucher = await _purchaseOrderContext.vouchers.Where(x => x.Id == id && x.OrgAccountId == OrgAccountId).FirstOrDefaultAsync();
                if (voucher != null && voucher.voucherAmount > 0)
                {
                    VoucherBatchLink voucherBatchLink = new VoucherBatchLink();
                    voucherBatchLink.batchId = batchId;
                    voucherBatchLink.voucherId = id;
                    voucherBatchLink.OrgAccountId = OrgAccountId;
                    batchLinks.Add(voucherBatchLink);
                }
            }
            _purchaseOrderContext.voucherBatchLink.AddRange(batchLinks);
            await _purchaseOrderContext.SaveChangesAsync();
            return Ok(true);
        }
        [Route("RemoveVouhersFromBatch")]
        [HttpPost]
        public async Task<ActionResult<IEnumerable<Voucher>>> RemoveVouhersFromBatch(List<int> ids, int batchId)
        {
            var batchLinks = await _purchaseOrderContext.voucherBatchLink.Where(x => ids.Contains(x.voucherId) && x.batchId == batchId && x.OrgAccountId == OrgAccountId).ToListAsync();
            _purchaseOrderContext.voucherBatchLink.RemoveRange(batchLinks);
            await _purchaseOrderContext.SaveChangesAsync();
            return Ok(true);
        }
        [Route("GetBatchVoucherByBatchId/{batchId}")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Voucher>>> GetBatchVoucherByBatchId(int batchId)
        {
            var voucherIds = await _purchaseOrderContext.voucherBatchLink.Where(x => x.batchId == batchId && x.OrgAccountId == OrgAccountId).Select(x => x.voucherId).ToListAsync();
            List<Voucher> vouchers = new List<Voucher>();
            if (voucherIds != null)
            {
                vouchers = await _purchaseOrderContext.vouchers.Include(v => v.vendor).Include(v => v.CountyPO).Where(x => voucherIds.Contains(x.Id) && x.OrgAccountId == OrgAccountId).ToListAsync();
                return vouchers;
            }
            return vouchers;
        }
        [Route("PostBatchVouchers/{id}")]
        [HttpPost]
        public async Task<ActionResult<string>> PostBatchVouchers(int id, DateTime dateTime)
        {
            var batch = await _purchaseOrderContext.VoucherBatchs.FirstOrDefaultAsync(x => x.OrgAccountId == OrgAccountId && x.ID == id);
            if (batch == null)
            {
                return BadRequest("VoucherBatch does not exist");
            }
            batch.datePosted = DateOnly.FromDateTime(dateTime);
            _purchaseOrderContext.VoucherBatchs.Update(batch);
            await _purchaseOrderContext.SaveChangesAsync();

            var batchLink = await _purchaseOrderContext.voucherBatchLink.Where(x => x.batchId == id && x.OrgAccountId == OrgAccountId).Select(x => x.voucherId).ToListAsync();
            if (batchLink != null)
            {
                var vouchers = await _purchaseOrderContext.vouchers.Where(x => batchLink.Contains(x.Id) && x.OrgAccountId == OrgAccountId).ToListAsync();
                foreach (var voucher in vouchers)
                {
                    voucher.postDate = dateTime;
                    voucher.posted = true;
                }
                _purchaseOrderContext.vouchers.UpdateRange(vouchers);
                await _purchaseOrderContext.SaveChangesAsync();
                return Ok("Posted");
            }
            else
            {
                return BadRequest("Vouchers Not found for batch");
            }
        }

        [Route("GetVouchersByDateSpan")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Voucher>>> GetVouchersByDateSpan(DateTime startDate, DateTime endDate)
        {
            var batches = await _purchaseOrderContext.voucherBatchLink.Where(x => x.OrgAccountId == OrgAccountId).Select(x => x.voucherId).ToListAsync();

            var useApprove = await _purchaseOrderContext.SettingsValue.Where(v => v.settingsId == 59 && v.OrgAccountId == OrgAccountId).Select(v => v.settingValue).FirstOrDefaultAsync();
            var approvedOnly = useApprove != null && useApprove == "1";

                List<Voucher> vouchers = await _purchaseOrderContext.vouchers.Include(v => v.vendor).Include(v => v.CountyPO)
                .Where(v => v.voucherWrittenDate.Date >= startDate.Date
            && !batches.Contains(v.Id)
            && (approvedOnly==false || v.approved==true)
            && v.voucherWrittenDate.Date <= endDate.Date && v.posted == false
            && v.voucherAmount > 0).ToListAsync();
            return Ok(vouchers);
        }
        [Route("VoucherInvoiceLineItems")]
        [HttpPost]
        public async Task<ActionResult> CreateVoucherInvoiceLineItems([FromBody] List<VoucherInvoiceLineItem> voucherInvoiceLineItems)
        {
            //voucherInvoiceLineItems.OrgId = OrgAccountId;
            if (voucherInvoiceLineItems == null || voucherInvoiceLineItems.Count <= 0) { return BadRequest("VoucherInvoiceLineItems does not exist"); }
            try
            {
                foreach (var voucherInvoiceLineItem in voucherInvoiceLineItems)
                {
                    return await CreateVoucherInvoiceLineItem(voucherInvoiceLineItem);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
            }
            return Ok(voucherInvoiceLineItems);

        }
        [Route("ApproveBatchVouchers/{id}")]
        [HttpPost]
        public async Task<ActionResult<string>> ApproveBatchVouchers(int id)
        {
            var useApprove = await _purchaseOrderContext.SettingsValue.Where(v => v.settingsId == 59 && v.OrgAccountId == OrgAccountId).Select(v => v.settingValue).FirstOrDefaultAsync();
            if (useApprove != null && useApprove == "1")
            {

                var batch = await _purchaseOrderContext.VoucherBatchs.FirstOrDefaultAsync(x => x.OrgAccountId == OrgAccountId && x.ID == id);
                if (batch == null)
                {
                    return BadRequest("VoucherBatch does not exist");
                }
                batch.approvalDate = DateOnly.FromDateTime(DateTime.Now);
                _purchaseOrderContext.VoucherBatchs.Update(batch);
                await _purchaseOrderContext.SaveChangesAsync();

                var batchLink = await _purchaseOrderContext.voucherBatchLink.Where(x => x.batchId == id && x.OrgAccountId == OrgAccountId).Select(x => x.voucherId).ToListAsync();
                if (batchLink != null)
                {
                    var vouchers = await _purchaseOrderContext.vouchers.Where(x => batchLink.Contains(x.Id) && x.OrgAccountId == OrgAccountId).ToListAsync();
                    foreach (var voucher in vouchers)
                    {
                        voucher.approvalDate = DateOnly.FromDateTime(DateTime.Now);
                        voucher.approved = true;
                    }
                    _purchaseOrderContext.vouchers.UpdateRange(vouchers);
                    await _purchaseOrderContext.SaveChangesAsync();
                    return Ok("Approved");
                }
                else
                {
                    return BadRequest("Vouchers Not found for batch");
                }
            }
            else
            {
                return BadRequest("Please enable configuration to Approve batch vouchers");
            }
        }
    }
}
