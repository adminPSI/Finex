using FinexAPI.Data;
using FinexAPI.Helper;
using FinexAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections;
using System.Collections.Generic;

namespace FinexAPI.Controllers
{
    [Authorize]
    public class VendorController : BaseController
    {
        private readonly FinexAppContext _vendorContext;
     

        public VendorController(IHttpContextAccessor contextAccessor, FinexAppContext vendorContext)
            : base(contextAccessor)
        {
            _vendorContext = vendorContext;
        }
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Vendor>>> GetVendors()
        {
            return await _vendorContext.Vendors.Include(x => x.VendorType).Where(x => x.OrgAccountId == OrgAccountId && x.isActive == "Y").ToListAsync();
        }
        [Route("Filter")]
        [HttpPost]
        public async Task<ActionResult> Filter(bool desc, string sortKey = "modifiedDate", string? name = "", string? isActive = "", string? vendorType = "", string? accountNo = "", string? search = "", int skip = 0, int take = 0)
        {
            ListResultController<Vendor> _cmnCntrlr = new ListResultController<Vendor>();
            if (search == "")
            {
                var list = _vendorContext.Vendors.Include(x => x.VendorType).Where(v => v.OrgAccountId == OrgAccountId
                && v.name.Contains(string.IsNullOrEmpty(name) ? "" : name)
                && v.isActive.Contains(string.IsNullOrEmpty(isActive) ? "" : isActive)
                && (string.IsNullOrEmpty(accountNo) || v.accountNo.Contains(string.IsNullOrEmpty(accountNo) ? "" : accountNo))
                && v.VendorType.value.Contains(string.IsNullOrEmpty(vendorType) ? "" : vendorType)
                ).OrderByCustom(sortKey, desc);

                return await _cmnCntrlr.returnResponse(take, skip, list, 0);
            }
            else
            {
                var list = _vendorContext.Vendors.Include(x => x.VendorType).Where(v => v.OrgAccountId == OrgAccountId
                && (v.name.Contains(string.IsNullOrEmpty(search) ? "" : search)
                || v.accountNo.Contains(string.IsNullOrEmpty(search) ? "" : search)
                || v.VendorType.value.Contains(string.IsNullOrEmpty(search) ? "" : search)
                || v.isActive.Contains(string.IsNullOrEmpty(search) ? "" : search))
                ).OrderByCustom(sortKey, desc);

                return await _cmnCntrlr.returnResponse(take, skip, list, 0);
            }
        }
        [HttpGet("{id}")]
        public async Task<ActionResult<Vendor>> GetVendor(int id)
        {
            var vendor = await _vendorContext.Vendors.Include(x => x.VendorType).FirstOrDefaultAsync(x => x.Id == id && x.OrgAccountId == OrgAccountId);
            if (vendor == null)
            {
                return BadRequest("Vendor does not exist");
            }
            return Ok(vendor);
        }
        private bool VendorExists(int Id)
        {
            return _vendorContext.Vendors.Any(v => v.Id == Id && v.OrgAccountId == OrgAccountId);
        }
        [HttpPost]
        public async Task<ActionResult<Vendor>> PostVendor(Vendor vendor)
        {
            vendor.OrgAccountId = OrgAccountId;
            _vendorContext.Vendors.Add(vendor);
            await _vendorContext.SaveChangesAsync();
            return CreatedAtAction("GetVendor", new { id = vendor.Id }, vendor);
        }
        [HttpPut("{id}")]
        public async Task<ActionResult<Vendor>> PutVendor(int id, Vendor vendor)
        {
            if (id != vendor.Id)
            {
                return BadRequest("Vendor does not match with id");
            }
            var vendorRef = await _vendorContext.Vendors.FirstOrDefaultAsync(x => x.OrgAccountId == OrgAccountId && x.Id == id);
            if (vendorRef == null)
            {
                return BadRequest("Vendor does not exist");
            }
            vendor.createdBy = vendorRef.createdBy;
            vendor.createdDate = vendorRef.createdDate;
            vendor.OrgAccountId = OrgAccountId;
            _vendorContext.Vendors.Entry(vendorRef).State = EntityState.Detached;
            _vendorContext.Vendors.Update(vendor);
            try
            {
                await _vendorContext.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!VendorExists(id))
                {
                    return BadRequest("Vendor does not exist");
                }
                else
                {
                    throw;
                }
            }
            return CreatedAtAction("GetVendor", new { id = vendor.Id }, vendor);
        }
        [HttpDelete("{id}")]
        public async Task<ActionResult<Vendor>> DeleteVendor(int id)
        {
            var vendor = await _vendorContext.Vendors.FirstOrDefaultAsync(x => x.Id == id && x.OrgAccountId == OrgAccountId);
            if (vendor == null) { return BadRequest("Vendor does not exist"); }
            var accountRecievableRef = await _vendorContext.AccountReceivables.Where(x => x.vendorID == id).ToListAsync();
            var accountRevenue = await _vendorContext.CountyRevenue.Where(x => x.rev_From == id).ToListAsync();
            var pos = await _vendorContext.CountyPODetails.Where(x => x.poVendorNo == id).ToListAsync();
            var ihpos = await _vendorContext.IHPODetails.Where(x => x.reqVendor == id).ToListAsync();
            var vouchers = await _vendorContext.vouchers.Where(x => x.vendorNo == id).ToListAsync();
            if (accountRecievableRef.Any() || accountRevenue.Any() || pos.Any() || ihpos.Any() || vouchers.Any())
            {
                vendor.isActive = "N";
                _vendorContext.Vendors.Update(vendor);
                await _vendorContext.SaveChangesAsync();
            }
            else
            {
                _vendorContext.Vendors.Remove(vendor);
                await _vendorContext.SaveChangesAsync();
            }
            return Ok(vendor);
        }
    }
}
