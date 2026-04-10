using FinexAPI.Data;
using FinexAPI.Helper;
using FinexAPI.Models;
using FinexAPI.Models.PurchaseOrder;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace FinexAPI.Controllers
{
    [Authorize]
    public class FundTransController : BaseController
    {
        private readonly FinexAppContext _appContext;


        public FundTransController(IHttpContextAccessor contextAccessor, FinexAppContext appContext)
            : base(contextAccessor)
        {
            _appContext = appContext;
        }
        [HttpGet]
        public async Task<ActionResult> GetFundTrans(string? search = "", int skip = 0, int take = 0, string yearFilter = "")
        {
            int.TryParse(yearFilter, out var yearVal);
            //var data = _appContext.FundTranses.AsQueryable();
            var data = from ft in _appContext.FundTranses
                        join ac in _appContext.AccountingCodes
                        on ft.Trans_CAC_From equals ac.Id into accGroup
                        from ac in accGroup.DefaultIfEmpty()
                        select new FundTrans
                        {
                            Id = ft.Id,
                            Trans_Date =ft.Trans_Date,
                            Trans_Amount = ft.Trans_Amount,
                            IsPayroll = ft.IsPayroll,
                            TransCACId = ft.TransCACId,
                            OrgAccountId = ft.OrgAccountId,
                            createdBy = ft.createdBy,
                            createdDate = ft.createdDate,
                            modifiedDate = ft.modifiedDate,
                            modifiedBy = ft.modifiedBy,
                            Trans_IHAC_From = ft.Trans_IHAC_From,
                            Trans_CAC_From = ft.Trans_CAC_From,
                            Trans_SAC_From =ft.Trans_SAC_From,
                            Trans_Description = ft.Trans_Description,
                            countyExpenseCode = ac.countyExpenseCode,

                        };
            if (yearVal != 0)
                //data = data.Where(p => p.Trans_Date.Value.Year >= DateTime.Now.Year - 1);
                data = data.Where(p => p.Trans_Date.Value.Year == yearVal);
            

            data = data.OrderByCustom("modifiedDate", true);
            ListResultController<FundTrans> _cmnCntrl = new ListResultController<FundTrans>();
            return await _cmnCntrl.returnResponse(take, skip, data, 0);

            //var result = new
            //{
            //    data = await data.Skip(skip).Take(take).ToListAsync(),
            //    Total = await data.CountAsync()
            //};
            //return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Vendor>> GetFundTrans(int id)
        {
            var vendor = await _appContext.FundTranses.FirstOrDefaultAsync(x => x.Id == id);
            if (vendor == null)
            {
                return BadRequest("FundTrans does not exist");
            }
            return Ok(vendor);
        }

        [HttpPost]
        public async Task<ActionResult<Vendor>> PostFundTrans(FundTrans fundTrans)
        {
            try
            {
                fundTrans.IsPayroll = fundTrans.IsPayroll ?? false;
                _appContext.FundTranses.Add(fundTrans);
                await _appContext.SaveChangesAsync();

                return CreatedAtAction("GetFundTrans", new { id = fundTrans.Id }, fundTrans);
            }catch (Exception ex) {
                return BadRequest("Something went wrong.");
            }
        }
        [HttpPut("{id}")]
        public async Task<ActionResult<Vendor>> PutFundTrans(int id, FundTrans fundTrans)
        {
            if (id != fundTrans.Id)
            {
                return BadRequest("FundTrans does not match with id");
            }
            var vendorRef = await _appContext.FundTranses.FirstOrDefaultAsync(x => x.Id == id);
            if (vendorRef == null)
            {
                return BadRequest("FundTrans does not exist");
            }
            fundTrans.createdBy = vendorRef.createdBy;
            fundTrans.createdDate = vendorRef.createdDate;
            fundTrans.OrgAccountId = OrgAccountId;
            _appContext.FundTranses.Entry(vendorRef).State = EntityState.Detached;
            _appContext.FundTranses.Update(fundTrans);
            try
            {
                await _appContext.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                //if (!VendorExists(id))
                //{
                //    return BadRequest("Vendor does not exist");
                //}
                //else
                //{
                //    throw;
                //}
            }
            return CreatedAtAction("GetFundTrans", new { id = fundTrans.Id }, fundTrans);
        }
        [HttpDelete("{id}")]
        public async Task<ActionResult<Vendor>> DeleteFundTrans(int id)
        {
            var fundTrans = await _appContext.FundTranses.FirstOrDefaultAsync(x => x.Id == id);
            _appContext.FundTranses.Remove(fundTrans);
            await _appContext.SaveChangesAsync();

            return Ok(fundTrans);
        }
    }
}
