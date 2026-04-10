using FinexAPI.Data;
using FinexAPI.Helper;
using FinexAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;

namespace FinexAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AssetsAndInventoryController : BaseController
    {
        private readonly FinexAppContext _assetContext;

        public AssetsAndInventoryController(IHttpContextAccessor httpContextAccessor, FinexAppContext assetContext) : base(httpContextAccessor)
        {
            _assetContext = assetContext;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Asset>>> GetInventories(bool assetFlag)
        {
            if (assetFlag)
            {
                return await _assetContext.Assets.Where(p => p.assetFlag.Equals(true) ).ToListAsync();
            }
            else
            {
                return await _assetContext.Assets.Where(p => p.assetFlag.Equals(false) ).ToListAsync();
            }
        }
        [Route("GetAssetsAndInventoriesWithFilter")]
        [HttpPost]
        public async Task<ActionResult> GetAssetsAndInventoriesWithFilter(bool assetFlag, bool desc, string sortKey = "Asset.modifiedDate", string? isActive = "", string? inventoryNo = "", string? description = "", string? itemDescription = "", string? manufacturer = "", string? supplier = "", string? value = "", DateTime? dateReceived = null, string? search = "", int skip = 0, int take = 0)
        {
            try
            {

                if (search == "")
                {
                    //var list = await _assetContext.Assets.Include(a => a.Vendor).
                    //     Where(a => (string.IsNullOrEmpty(inventoryNo) || a.inventoryNo.Contains(string.IsNullOrEmpty(inventoryNo) ? "" : inventoryNo))
                    //        && (string.IsNullOrEmpty(description) || a.description.Contains(string.IsNullOrEmpty(description) ? "" : description))
                    //        && (string.IsNullOrEmpty(itemDescription) || a.itemDescription.Contains(string.IsNullOrEmpty(itemDescription) ? "" : itemDescription))
                    //        && (string.IsNullOrEmpty(manufacturer) || a.manufacturer.Contains(string.IsNullOrEmpty(manufacturer) ? "" : manufacturer))
                    //        && a.isActive.Contains(string.IsNullOrEmpty(isActive) ? "" : isActive)
                    //        && (string.IsNullOrEmpty(supplier) || a.Vendor.name.Contains(string.IsNullOrEmpty(supplier) ? "" : supplier))
                    //        && (string.IsNullOrEmpty(value) || a.cost.ToString().Contains(string.IsNullOrEmpty(value) ? "" : value))
                    //        && a.assetFlag.Equals(assetFlag)
                    //        && (dateReceived == null || a.dateReceived.Value.Date == dateReceived.Value.Date)
                    //        ).OrderByCustom(sortKey, desc).ToListAsync();
                    //test
                    var list = await (
                        from a in _assetContext.Assets

                        join al in _assetContext.AssetLocations on a.Id equals al.assetId into alJoin
                        from al in alJoin.DefaultIfEmpty()

                        join area in _assetContext.AssetLookups on al.area equals area.Id into areaJoin
                        from area in areaJoin.DefaultIfEmpty()

                        join building in _assetContext.AssetLookups on al.building equals building.Id into buildingJoin
                        from building in buildingJoin.DefaultIfEmpty()
                        where
                        (string.IsNullOrEmpty(inventoryNo) || a.inventoryNo.Contains(string.IsNullOrEmpty(inventoryNo) ? "" : inventoryNo))
                                && (string.IsNullOrEmpty(description) || a.description.Contains(string.IsNullOrEmpty(description) ? "" : description))
                                && (string.IsNullOrEmpty(itemDescription) || a.itemDescription.Contains(string.IsNullOrEmpty(itemDescription) ? "" : itemDescription))
                                && (string.IsNullOrEmpty(manufacturer) || a.manufacturer.Contains(string.IsNullOrEmpty(manufacturer) ? "" : manufacturer))
                                && a.isActive.Contains(string.IsNullOrEmpty(isActive) ? "" : isActive)
                                && (string.IsNullOrEmpty(supplier) || a.Vendor.name.Contains(string.IsNullOrEmpty(supplier) ? "" : supplier))
                                && (string.IsNullOrEmpty(value) || a.cost.ToString().Contains(string.IsNullOrEmpty(value) ? "" : value))
                                && a.assetFlag.Equals(assetFlag)
                                && (dateReceived == null || a.dateReceived.Value.Date == dateReceived.Value.Date)
                        select new
                        {
                            a.Id,
                            a.modifiedBy,
                            a.modifiedDate,
                            a.createdDate,
                            a.createdBy,
                            a.description,
                            a.purchaseDate,
                            a.usefulLife,
                            a.cost,
                            a.depreciationAmount,
                            a.account,
                            a.lastYearDepreciation,
                            a.yearRemoved,
                            a.propertyNo,
                            a.serialNo,
                            a.location,
                            a.inventoryNo,
                            a.itemDescription,
                            a.manufacturer,
                            a.funding,
                            a.supplier,
                            a.color,
                            a.size,
                            a.voucherNo,
                            a.modelNo,
                            a.voucherDate,
                            a.poNO,
                            a.poDate,
                            a.countyNo,
                            a.dateReceived,
                            a.assetArea,
                            a.installOn,
                            a.source,
                            a.leased,
                            a.manual,
                            a.originalDisk,
                            a.diskOnSite,
                            a.comCode,
                            a.comments,
                            a.others,
                            a.repValue,
                            a.memo,
                            a.projectCas,
                            a.isActive,
                            a.disposalVendor,
                            a.disposalPrice,
                            a.assetFlag,
                            a.salvageValue,
                            a.invCatId,
                            a.firstYearToDepreciate,
                            a.mrddNo,
                            a.ciscoServiceId,
                            a.ciscoContract,
                            a.ciscoExpirationDate,
                            a.dateRemoved,
                            a.inventoryMemo,
                            al.building,
                            al.area,
                            al.resPer,
                            AreaName = area != null ? area.name : null,
                            BuildingName = building != null ? building.name : null
                        }
                        ).OrderByCustom(sortKey, desc).ToListAsync();
                    if (take == 0)
                    {
                        return Ok(new { data = list, Total = list.Count });
                    }
                    else
                    {
                        return Ok(new { data = list.Skip(skip).Take(take).ToList(), Total = list.Count });

                    }
                }
                else
                {
                    //var list = await _assetContext.Assets.Include(a => a.Vendor).
                    //    Where(a => (a.inventoryNo.Contains(string.IsNullOrEmpty(search) ? "" : search)
                    //       || a.description.Contains(string.IsNullOrEmpty(search) ? "" : search)
                    //       || a.itemDescription.Contains(string.IsNullOrEmpty(search) ? "" : search)
                    //       || a.manufacturer.Contains(string.IsNullOrEmpty(search) ? "" : search)
                    //       || a.cost.ToString().Contains(string.IsNullOrEmpty(search) ? "" : search)
                    //       || a.Vendor.name.Contains(string.IsNullOrEmpty(search) ? "" : search))
                    //       && a.isActive.Contains(string.IsNullOrEmpty(isActive) ? "" : isActive)
                    //       && a.assetFlag.Equals(assetFlag)
                    //       ).OrderByCustom(sortKey, desc).ToListAsync();
                    var list = await (
                       from a in _assetContext.Assets

                       join al in _assetContext.AssetLocations on a.Id equals al.assetId into alJoin
                       from al in alJoin.DefaultIfEmpty()

                       join area in _assetContext.AssetLookups on al.area equals area.Id into areaJoin
                       from area in areaJoin.DefaultIfEmpty()

                       join building in _assetContext.AssetLookups on al.building equals building.Id into buildingJoin
                       from building in buildingJoin.DefaultIfEmpty()
                       where
                           (a.inventoryNo.Contains(string.IsNullOrEmpty(search) ? "" : search)
                          || a.description.Contains(string.IsNullOrEmpty(search) ? "" : search)
                          || a.itemDescription.Contains(string.IsNullOrEmpty(search) ? "" : search)
                          || a.manufacturer.Contains(string.IsNullOrEmpty(search) ? "" : search)
                          || a.cost.ToString().Contains(string.IsNullOrEmpty(search) ? "" : search)
                          || a.Vendor.name.Contains(string.IsNullOrEmpty(search) ? "" : search))
                          && a.isActive.Contains(string.IsNullOrEmpty(isActive) ? "" : isActive)
                          && a.assetFlag.Equals(assetFlag)
                       select new
                       {
                           a.Id,
                           a.modifiedBy,
                           a.modifiedDate,
                           a.createdDate,
                           a.createdBy,
                           a.description,
                           a.purchaseDate,
                           a.usefulLife,
                           a.cost,
                           a.depreciationAmount,
                           a.account,
                           a.lastYearDepreciation,
                           a.yearRemoved,
                           a.propertyNo,
                           a.serialNo,
                           a.location,
                           a.inventoryNo,
                           a.itemDescription,
                           a.manufacturer,
                           a.funding,
                           a.supplier,
                           a.color,
                           a.size,
                           a.voucherNo,
                           a.modelNo,
                           a.voucherDate,
                           a.poNO,
                           a.poDate,
                           a.countyNo,
                           a.dateReceived,
                           a.assetArea,
                           a.installOn,
                           a.source,
                           a.leased,
                           a.manual,
                           a.originalDisk,
                           a.diskOnSite,
                           a.comCode,
                           a.comments,
                           a.others,
                           a.repValue,
                           a.memo,
                           a.projectCas,
                           a.isActive,
                           a.disposalVendor,
                           a.disposalPrice,
                           a.assetFlag,
                           a.salvageValue,
                           a.invCatId,
                           a.firstYearToDepreciate,
                           a.mrddNo,
                           a.ciscoServiceId,
                           a.ciscoContract,
                           a.ciscoExpirationDate,
                           a.dateRemoved,
                           a.inventoryMemo,
                           al.building,
                           al.area,
                           al.resPer,
                           AreaName = area != null ? area.name : null,
                           BuildingName = building != null ? building.name : null
                       }
                       ).OrderByCustom(sortKey, desc).ToListAsync();

                    if (take == 0)
                    {
                        return Ok(new { data = list, Total = list.Count });
                    }
                    else
                    {
                        return Ok(new { data = list.Skip(skip).Take(take).ToList(), Total = list.Count });

                    }
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Asset>> GetInventory(int id)
        {
            var inventory = await _assetContext.Assets.Where(p => p.Id == id).FirstOrDefaultAsync();
            if (inventory != null)
            {
                inventory.AssetLocation = await _assetContext.AssetLocations.Where(l => l.assetId.Equals(inventory.Id)).FirstOrDefaultAsync();

                return Ok(inventory);
            }
            else
            {
                return BadRequest("Asset or Inventory does not exist");
            }
        }
        [HttpPost]
        public async Task<ActionResult<Asset>> PostInventory(Asset asset)
        {
            _assetContext.Assets.Add(asset);
            await _assetContext.SaveChangesAsync();
            if (asset.AssetLocation.program != null || asset.AssetLocation.area != null || asset.AssetLocation.building != null || asset.AssetLocation.resPer != null)
            {
                asset.AssetLocation.assetId = asset.Id;
                _assetContext.AssetLocations.Add(asset.AssetLocation);
                await _assetContext.SaveChangesAsync();
            }
            return CreatedAtAction("GetInventory", new { id = asset.Id }, asset);
        }
        [HttpPut("{id}")]
        public async Task<ActionResult<Asset>> PutInventory(int id, Asset asset)
        {
            if (id != asset.Id)
            {
                return BadRequest("Asset or Inventory does not match with id");
            }
            var assetRef = await _assetContext.Assets.FirstOrDefaultAsync(x => x.Id == id);
            if (assetRef == null)
            {
                return BadRequest("Asset or Inventory does not exist");
            }
            asset.createdBy = assetRef.createdBy;
            asset.createdDate = assetRef.createdDate;
            _assetContext.Assets.Entry(assetRef).State = EntityState.Detached;
            _assetContext.Assets.Update(asset);
            if (asset.AssetLocation.program != null || asset.AssetLocation.area != null || asset.AssetLocation.building != null || asset.AssetLocation.resPer != null)
            {
                asset.AssetLocation.assetId = asset.Id;
                _assetContext.AssetLocations.Update(asset.AssetLocation);
            }

            await _assetContext.SaveChangesAsync();
            return Ok(asset);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<Asset>> DeleteInventory(int id)
        {

            var asset = await _assetContext.Assets.Where(p => p.Id == id).FirstOrDefaultAsync();
            if (asset == null)
            {
                return BadRequest("Asset or Inventory does not exist");
            }
            _assetContext.Assets.Remove(asset);
            await _assetContext.SaveChangesAsync();
            return Ok(asset);
        }
        [Route("AssetLocation/{id}")]
        [HttpGet]
        public async Task<ActionResult<AssetLocation>> GetAssetLocation(int id)
        {
            var assetLocation = await _assetContext.AssetLocations.Where(a => a.Id == id).FirstOrDefaultAsync();
            if (assetLocation == null)
            {
                return BadRequest("AssetLocation does not exist");
            }
            return Ok(assetLocation);
        }
        [Route("AssetLocation")]
        [HttpPost]
        public async Task<ActionResult<AssetLocation>> PostAssetLocation(AssetLocation assetLocation)
        {
            _assetContext.AssetLocations.Add(assetLocation);
            await _assetContext.SaveChangesAsync();
            return CreatedAtAction("GetAssetLocation", new { id = assetLocation.Id }, assetLocation);
        }
        [Route("AssetLocation/{id}")]
        [HttpPut]
        public async Task<ActionResult<AssetLocation>> PutAssetLocation(int id, AssetLocation assetLocation)
        {
            if (id != assetLocation.Id)
            {
                return BadRequest("AssetLocation does not match with id");
            }
            _assetContext.AssetLocations.Update(assetLocation);
            await _assetContext.SaveChangesAsync();
            return CreatedAtAction("GetAssetLocation", new { id = assetLocation.Id }, assetLocation);
        }
        [Route("AssetLocation/{id}")]
        [HttpDelete]
        public async Task<ActionResult<AssetLocation>> DeleteAssetLocation(int id)
        {
            var assetLocation = await _assetContext.AssetLocations.Where(a => a.Id == id).FirstOrDefaultAsync();
            if (assetLocation == null)
            {
                return BadRequest("AssetLocation does not exist");
            }
            _assetContext.AssetLocations.Remove(assetLocation);
            await _assetContext.SaveChangesAsync();
            return Ok(assetLocation);
        }
        [Route("AssetSacAmount")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AssetSacAmount>>> GetAssetSacAmounts()
        {
            return await _assetContext.AssetSacAmounts.ToListAsync();
        }
        [Route("AssetSacAmount/{id}")]
        [HttpGet]
        public async Task<ActionResult<AssetSacAmount>> GetAssetSacAmount(int id)
        {
            var sacAmount = await _assetContext.AssetSacAmounts.Where(s => s.Id == id).FirstOrDefaultAsync();
            if (sacAmount == null)
            {
                return BadRequest("AssetSacAmount does not exist");
            }
            return Ok(sacAmount);
        }
        [Route("AssetSacAmountByAssetId/{assetId}")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AssetSacAmount>>> GetAssetSacAmountByAssetId(int assetId)
        {
            List<AssetSacAmount> sacAmounts = await _assetContext.AssetSacAmounts.Where(sa => sa.assetId == assetId).ToListAsync();
            if (sacAmounts.Count < 0)
            {
                return BadRequest("AssetSacAmounts does not exist");
            }
            return Ok(sacAmounts);
        }
        [Route("AssetSacAmount")]
        [HttpPost]
        public async Task<ActionResult<AssetSacAmount>> PostAssetSacAmount(AssetSacAmount assetSacAmount)
        {
            if (assetSacAmount.amount < 0)
            {
                return BadRequest("Negative amount does not allowed");
            }
            _assetContext.AssetSacAmounts.Add(assetSacAmount);
            await _assetContext.SaveChangesAsync();
            return CreatedAtAction("GetAssetSacAmount", new { id = assetSacAmount.Id }, assetSacAmount);
        }
        [Route("AssetSacAmount/{id}")]
        [HttpPut]
        public async Task<ActionResult<AssetSacAmount>> PutAssetSacAmount(int id, AssetSacAmount assetSacAmount)
        {
            if (assetSacAmount.amount < 0)
            {
                return BadRequest("Negative amount does not allowed");
            }
            if (id != assetSacAmount.Id)
            {
                return BadRequest("AssetSacAmount does not match with id");
            }
            var sacRef = await _assetContext.AssetSacAmounts.FirstOrDefaultAsync(x => x.Id == id);
            if (sacRef == null)
            {
                return BadRequest("AssetSacAmount does not exist");
            }
            assetSacAmount.createdBy = sacRef.createdBy;
            assetSacAmount.createdDate = sacRef.createdDate;
            _assetContext.AssetSacAmounts.Entry(sacRef).State = EntityState.Detached;
            _assetContext.AssetSacAmounts.Update(assetSacAmount);
            await _assetContext.SaveChangesAsync();
            return CreatedAtAction("GetAssetSacAmount", new { id = assetSacAmount.Id }, assetSacAmount);
        }
        [Route("AssetSacAmount/{id}")]
        [HttpDelete]
        public async Task<ActionResult<AssetSacAmount>> DeleteAssetSacAmount(int id)
        {
            var sacAmount = await _assetContext.AssetSacAmounts.Where(a => a.Id == id).FirstOrDefaultAsync();
            if (sacAmount == null)
            {
                return BadRequest("AssetSacAmount does not exist");
            }
            _assetContext.AssetSacAmounts.Remove(sacAmount);
            await _assetContext.SaveChangesAsync();
            return Ok(sacAmount);
        }

        [Route("AssetLookups")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AssetLookup>>> GetAssetLookups()
        {
            var lookups = await _assetContext.AssetLookups.ToListAsync();
            if (lookups.Count < 0)
            {
                return BadRequest("AssetLookups does not exist");
            }
            foreach (var lookup in lookups)
            {
                lookup.typename = await _assetContext.CodeValues.Where(x => x.Id == lookup.type).Select(x => x.value).FirstOrDefaultAsync();
            }
            return lookups;
        }

        [Route("AssetLookupsByType/{type}")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AssetLookup>>> GetAssetLookupsByType(int type)
        {
            var lookups = await _assetContext.AssetLookups.Where(x => x.type == type).ToListAsync();
            if (lookups.Count < 0)
            {
                return BadRequest("AssetLookups does not exist");
            }
            foreach (var lookup in lookups)
            {
                lookup.typename = await _assetContext.CodeValues.Where(x => x.Id == lookup.type).Select(x => x.value).FirstOrDefaultAsync();
            }
            return lookups;
        }

        [Route("AssetLookup/{id}")]
        [HttpGet]
        public async Task<ActionResult<AssetLookup>> GetAssetLookup(int id)
        {
            var lookup = await _assetContext.AssetLookups.FirstOrDefaultAsync(x => x.Id == id);
            if (lookup == null)
            {
                return BadRequest("AssetLookup does not exist");
            }
            lookup.typename = await _assetContext.CodeValues.Where(x => x.Id == lookup.type).Select(x => x.value).FirstOrDefaultAsync();
            return lookup;
        }

        [Route("AssetLookup")]
        [HttpPost]
        public async Task<ActionResult<AssetLookup>> CreateAssetLookup(AssetLookup assetLookup)
        {
            var lookupRef = await _assetContext.AssetLookups.Where(x => x.type == assetLookup.type && x.name == assetLookup.name).FirstOrDefaultAsync();
            if (lookupRef != null)
            {
                return BadRequest("Type and Name already Exist");
            }

            _assetContext.AssetLookups.Add(assetLookup);
            await _assetContext.SaveChangesAsync();
            return CreatedAtAction("GetAssetLookup", new { id = assetLookup.Id }, assetLookup);
        }

        [Route("AssetLookup/{id}")]
        [HttpPut]
        public async Task<ActionResult<AssetLookup>> UpdateAssetLookup(int id, AssetLookup assetLookup)
        {
            if (id != assetLookup.Id)
            {
                return BadRequest("AssetLookup does not match with id");
            }
            var lookup = await _assetContext.AssetLookups.FirstOrDefaultAsync(x => x.Id == id);
            if (lookup == null)
            {
                return BadRequest("AssetLookup does not exist");
            }
            assetLookup.createdBy = lookup.createdBy;
            assetLookup.createdDate = lookup.createdDate;
            _assetContext.AssetLookups.Entry(lookup).State = EntityState.Detached;
            _assetContext.AssetLookups.Update(assetLookup);
            await _assetContext.SaveChangesAsync();
            return Ok(assetLookup);
        }
        [Route("AssetLookup/{id}")]
        [HttpDelete]
        public async Task<ActionResult<string>> DeleteAssetLookup(int id)
        {
            var lookup = await _assetContext.AssetLookups.FirstOrDefaultAsync(x => x.Id == id);
            if (lookup == null)
            {
                return BadRequest("AssetLookup does not exist");
            }
            var locationRef = await _assetContext.AssetLocations.Where(x => x.building == lookup.Id || x.area == lookup.Id || x.program == lookup.Id).ToListAsync();
            var asset = await _assetContext.Assets.Where(x => x.assetType == lookup.Id || x.invCatId == lookup.Id).ToListAsync();
            if (locationRef.Count > 0 || asset.Count > 0)
            {
                return BadRequest("AssetLookup is associated with Asset details");
            }
            _assetContext.AssetLookups.Remove(lookup);
            await _assetContext.SaveChangesAsync();
            return Ok(true);
        }
    }
}
