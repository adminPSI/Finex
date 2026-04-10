using FinexAPI.Data;
using FinexAPI.Helper;
using FinexAPI.Models;
using FinexAPI.Models.PayrollDefaults;
using FinexAPI.Models.PayrollEmployee;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using System.Net;

namespace FinexAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PayrollDefaultsController : BaseController
    {
        private readonly FinexAppContext _context;
        public PayrollDefaultsController(FinexAppContext context, IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor)
        {
            _context = context;
        }
        /* PayrollDefaultValues*/
        // Get All DefaultValues
        [HttpGet]
        public async Task<ActionResult<PayrollDefaultValues>> GetDefaultValues()
        {
            var defaultValues = await _context.PayrollDefaultValues.FirstOrDefaultAsync();
            if (defaultValues == null)
            {
                return BadRequest("Default Values does not exist for the organization");
            }
            return Ok(defaultValues);
        }
        //Get DefaultValues By Id

        [HttpGet("{id}")]
        public async Task<ActionResult<PayrollDefaultValues>> GetDefaultValuesByID(int id)
        {
            var defaultvalue = await _context.PayrollDefaultValues.FirstOrDefaultAsync(d => d.Id == id);
            if (defaultvalue == null)
            {
                return BadRequest("Default Values does not exist");
            }
            return Ok(defaultvalue);
        }
        //Add new DefaultValues

        [HttpPost]
        public async Task<IActionResult> PostDefaultValues(PayrollDefaultValues defaultvalue)
        {
            var orgData = await _context.PayrollDefaultValues.FirstOrDefaultAsync();
            if (orgData != null)
            {
                defaultvalue.Id = orgData.Id;
                return await UpdateDefaultValues(defaultvalue!.Id, defaultvalue);
            }

            if (defaultvalue == null)
            {
                return BadRequest("Request can't be null");
            }
            _context.PayrollDefaultValues.Add(defaultvalue);
            await _context.SaveChangesAsync();
            // return Ok();
            return CreatedAtAction("GetDefaultValuesByID", new { id = defaultvalue.Id }, defaultvalue);
        }
        //Update DefaultValues

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDefaultValues(int id, PayrollDefaultValues defaultValues)
        {
            if (id != defaultValues.Id)
            {
                return BadRequest("Default value request does not match with id");
            }
            var defaultvaluesRef = await _context.PayrollDefaultValues.FindAsync(id);
            if (defaultvaluesRef == null)
            {
                return BadRequest("PayrollDefaultValues does not exist");
            }
            defaultValues.createdBy = defaultvaluesRef.createdBy;
            defaultValues.createdDate = defaultvaluesRef.createdDate;
            _context.PayrollDefaultValues.Entry(defaultvaluesRef).State = EntityState.Detached;
            _context.PayrollDefaultValues.Update(defaultValues);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)

            {
                if (!DefaultValuesExists(id))
                {
                    return BadRequest("Default values does not exist");
                }

                else
                {
                    throw;
                }
            }
            //  return Ok();
            return CreatedAtAction("GetDefaultValuesByID", new { id = defaultValues.Id }, defaultValues);

        }
        private bool DefaultValuesExists(int id)
        {
            return _context.PayrollDefaultValues.Any(e => e.Id == id && e.OrgAccountId == OrgAccountId);
        }

        //Delete DefaultValues

        [HttpDelete("{id}")]
        public async Task<ActionResult<PayrollDefaultValues>> DeleteDefaultValues(int id)
        {
            var defaultvalue = await _context.PayrollDefaultValues.Where(d => d.OrgAccountId == OrgAccountId && d.Id == id).FirstOrDefaultAsync();
            if (defaultvalue == null)
            {
                return BadRequest("Default values does not exist");
            }

            _context.PayrollDefaultValues.Remove(defaultvalue);
            await _context.SaveChangesAsync();

            return defaultvalue;
        }

        /* BENEFITS*/
        // Get All BENEFITS
        [Route("Benefits")]
        [HttpGet]
        public async Task<ActionResult> GetBenefits(bool desc, string sortKey = "benefitsName", bool inActive = false, string? benefitFilter = "", string? benefitsPercentFilter = "", string? amountFilter = "", string? typeOfBenefitFilter = "", string? search = "", string? createdDateFilter = "", string? createdByFilter = "", string? modifyDateFilter = "", string? modifyByFilter = "", int skip = 0, int take = 10)
        {
            try
            {
                var list = _context.Benefits.Include(b => b.BenefitType)
                        .Where(p => p.OrgAccountId == OrgAccountId);

                list = list.Where(x => x.inactive == inActive);

                if (!string.IsNullOrEmpty(search))
                {
                    search = search.ToLower();
                    list = list.Where(p => (!string.IsNullOrEmpty(p.benefitsName) && p.benefitsName.ToLower().Contains(search))
                                   || p.benefitsPercent.ToString().Contains(string.IsNullOrEmpty(search) ? "" : search)
                                   || p.benefitsExclude.ToString().Contains(string.IsNullOrEmpty(search) ? "" : search)
                                   || p.inactive.ToString().Contains(string.IsNullOrEmpty(search) ? "" : search)
                                   || (p.amount != null && p.amount.ToString().Contains(search))
                                   || (p.BenefitType != null && !string.IsNullOrEmpty(p.BenefitType.typeOfBenefit) && p.BenefitType.typeOfBenefit.Contains(string.IsNullOrEmpty(search) ? "" : search)));
                }
                if (!string.IsNullOrEmpty(benefitFilter))
                {
                    benefitFilter = benefitFilter.ToLower();
                    list = list.Where(p => (!string.IsNullOrEmpty(p.benefitsName) && p.benefitsName.ToLower().Contains(benefitFilter)));
                }
                if (!string.IsNullOrEmpty(benefitsPercentFilter))
                {
                    list = list.Where(p => p.benefitsPercent.HasValue && p.benefitsPercent.Value.ToString().Contains(benefitsPercentFilter));
                }
                if (!string.IsNullOrEmpty(amountFilter))
                {
                    list = list.Where(p => p.amount.HasValue && p.amount.Value.ToString().Contains(amountFilter));
                }
                if (!string.IsNullOrEmpty(typeOfBenefitFilter))
                {
                    typeOfBenefitFilter = typeOfBenefitFilter.ToLower();
                    list = list.Where(p => (p.BenefitType != null && !string.IsNullOrEmpty(p.BenefitType.typeOfBenefit) && p.BenefitType.typeOfBenefit.ToLower().Contains(typeOfBenefitFilter)));
                }

                if (!string.IsNullOrEmpty(createdDateFilter))
                {
                    DateTime formatDate;
                    if (DateTime.TryParse(createdDateFilter, out formatDate))
                    {
                        list = list.Where(x => x.createdDate.HasValue && x.createdDate.Value.Date == formatDate);
                    }
                }
                if (!string.IsNullOrEmpty(createdByFilter))
                {
                    createdByFilter = createdByFilter.Trim().ToLower();
                    list = list.Where(x => !string.IsNullOrEmpty(x.createdBy) && x.createdBy.ToLower() == createdByFilter);
                }
                if (!string.IsNullOrEmpty(modifyDateFilter))
                {
                    DateTime formatDate;
                    if (DateTime.TryParse(modifyDateFilter, out formatDate))
                    {
                        list = list.Where(x => x.modifiedDate.HasValue && x.modifiedDate.Value.Date == formatDate);
                    }
                }
                if (!string.IsNullOrEmpty(modifyByFilter))
                {
                    modifyByFilter = modifyByFilter.Trim().ToLower();
                    list = list.Where(x => !string.IsNullOrEmpty(x.modifiedBy) && x.modifiedBy.ToLower() == modifyByFilter);
                }

                var pagedResult = await list.OrderByCustom(sortKey, desc).ToListAsync();

                var totalCount = pagedResult.Count();
                if (take != 0)
                {
                    pagedResult = pagedResult.Skip(skip).Take(take).ToList();
                }
                return Ok(new { data = pagedResult, Total = totalCount });
            }
            catch (Exception)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, "Internal server error!!");
            }
        }
        //Get Benefits By BenefitId
        [Route("Benefits/{id}")]
        [HttpGet]
        public async Task<ActionResult<Benefits>> GetBenefitsById(int id)
        {
            var benefit = await _context.Benefits.Include(b => b.BenefitType).Where(b => b.OrgAccountId == OrgAccountId && b.Id == id).FirstOrDefaultAsync();
            if (benefit == null)
            {
                return BadRequest("Benefits does not exist");
            }
            return Ok(benefit);
        }
        // Get Benefits By Benefit Type
        [Route("BenefitsByBenefitType/{BenefitsType}")]
        [HttpGet]
        public async Task<ActionResult<Benefits>> GetBenefitBYBenefitType(int BenefitsType)
        {
            var benefit = await _context.Benefits.Include(b => b.BenefitType).Where(b => b.OrgAccountId == OrgAccountId && b.benefitsType == BenefitsType).ToListAsync();
            if (benefit == null)
            {
                return BadRequest("Benefits does not exist");
            }
            return Ok(benefit);
        }
        //Add new Benefits
        [Route("Benefits")]
        [HttpPost]
        public async Task<ActionResult<Benefits>> PostBenefit(Benefits benefits)
        {
            benefits.OrgAccountId = OrgAccountId;
            if (benefits == null)
            {
                return BadRequest("Benefits does not exist");
            }
            if (string.IsNullOrEmpty(benefits.benefitsName))
            {
                return BadRequest("Benefits name is required");
            }
            var checkExisting = await _context.Benefits.FirstOrDefaultAsync(x => !string.IsNullOrEmpty(x.benefitsName) && x.benefitsName.ToLower() == benefits.benefitsName && x.OrgAccountId == OrgAccountId);
            if (checkExisting != null)
            {
                return BadRequest("Benefitsalready exist with name '" + benefits.benefitsName + "'");
            }
            await _context.Benefits.AddAsync(benefits);
            await _context.SaveChangesAsync();
            //return Ok();
            return CreatedAtAction("GetBenefitsById", new { id = benefits.Id }, benefits);
        }
        //Update Benefits
        [Route("Benefits/{id}")]
        [HttpPut]
        public async Task<IActionResult> UpdateBenefit(int id, Benefits benefits)
        {
            if (id != benefits.Id)
            {
                return BadRequest("Benefits does not match with id");
            }
            if (string.IsNullOrEmpty(benefits.benefitsName))
            {
                return BadRequest("Benefits name is required");
            }
            var checkExisting = await _context.Benefits.FirstOrDefaultAsync(x => !string.IsNullOrEmpty(x.benefitsName) && x.benefitsName.ToLower() == benefits.benefitsName.ToLower() && x.Id != id && x.OrgAccountId == OrgAccountId);

            if (checkExisting != null)
            {
                return BadRequest("Benefitsalready exist with name '" + benefits.benefitsName + "'");
            }
            var benefitRef = await _context.Benefits.FindAsync(id);
            if (benefitRef == null)
            {
                return BadRequest("Benefits does not exist");
            }
            benefits.createdBy = benefitRef.createdBy;
            benefits.createdDate = benefitRef.createdDate;
            _context.Benefits.Entry(benefitRef).State = EntityState.Detached;
            benefits.OrgAccountId = OrgAccountId;
            _context.Benefits.Update(benefits);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)

            {
                if (!BenefitsExists(id))
                {
                    return BadRequest("Benefits does not exist");
                }

                else
                {
                    throw;
                }
            }
            //return Ok();
            return CreatedAtAction("GetBenefitsById", new { id = benefits.Id }, benefits);

        }
        private bool BenefitsExists(int id)
        {
            return _context.Benefits.Any(e => e.Id == id && e.OrgAccountId == OrgAccountId);
        }

        //Delete Benefits
        [Route("Benefits/{id}")]
        [HttpDelete]
        public async Task<ActionResult<Benefits>> DeleteBenefit(int id)
        {
            var benefit = await _context.Benefits.Where(b => b.OrgAccountId == OrgAccountId && b.Id == id).FirstOrDefaultAsync();
            if (benefit == null)
            {
                return BadRequest("Benefits does not exist");
            }

            var benefitLink = await _context.BenefitPackageBenefitLinks.Where(x => x.bennyId == id).FirstOrDefaultAsync();
            if (benefitLink != null)
            {
                _context.BenefitPackageBenefitLinks.Remove(benefitLink);
            }

            _context.Benefits.Remove(benefit);
            await _context.SaveChangesAsync();

            return benefit;
        }

        [Route("BenefitPackageLink/{id}")]
        [HttpDelete]
        public async Task<ActionResult<BenefitPackageBenefitLink>> DeleteBenefitPackageLink(int id)
        {
            var benefitPackageLink = await _context.BenefitPackageBenefitLinks.Where(b => b.OrgAccountId == OrgAccountId && b.Id == id).FirstOrDefaultAsync();
            if (benefitPackageLink == null)
            {
                return BadRequest("Benefits does not exist");
            }
            _context.BenefitPackageBenefitLinks.Remove(benefitPackageLink);

            await _context.SaveChangesAsync();

            return benefitPackageLink;
        }

        //update Benefits status active and inactive
        [Route("Benefits/updatestatus/{id}")]
        [HttpPut]
        public async Task<ActionResult<Benefits>> MarkActiveBenefitStatus(int id, bool status)
        {
            var benefit = await _context.Benefits.Where(b => b.OrgAccountId == OrgAccountId && b.Id == id).FirstOrDefaultAsync();
            if (benefit == null)
            {
                return BadRequest("Benefits does not exist");
            }
            benefit.inactive = status;
            _context.Benefits.Update(benefit);
            await _context.SaveChangesAsync();

            return benefit;
        }

        /*Benefit Types*/
        [Route("BenefitTypes")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BenefitType>>> GetBenefitTypes()
        {
            return await _context.BenefitTypes.OrderBy(x => x.typeOfBenefit).ToListAsync();
        }

        /* Payroll Default Vacation Rates*/
        // Get All Vacation Rates
        [Route("VacationRates")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PayrollDefaultVacationrates>>> GetVacationRates()
        {
            return await _context.PayrollDefaultVacationrates.OrderBy(x => x.yearsWorkedStart).ToListAsync();
        }
        //Get Vacation Rates  By Id
        [Route("VacationRates/{id}")]
        [HttpGet]
        public async Task<ActionResult<PayrollDefaultVacationrates>> GetByVacationID(int id)
        {
            var vacation = await _context.PayrollDefaultVacationrates.Where(v => v.ID == id).FirstOrDefaultAsync();
            if (vacation == null)
            {
                return BadRequest("PayrollDefaultVacationrates does not exist");
            }
            return Ok(vacation);
        }
        //Add new Vacation Rates
        [Route("VacationRates")]
        [HttpPost]
        public async Task<ActionResult<PayrollDefaultVacationrates>> AddVacationRate(PayrollDefaultVacationrates vacation)
        {

            vacation.OrgAccountId = OrgAccountId;
            if (vacation == null)
            {
                return BadRequest("PayrollDefaultVacationrates does not exist");
            }
            var checkExist = await _context.PayrollDefaultVacationrates.FirstOrDefaultAsync(x => x.OrgAccountId == OrgAccountId
            && x.yearsWorkedStart <= vacation.yearsWorkedEnd && vacation.yearsWorkedStart <= x.yearsWorkedEnd);

            if (checkExist != null)
            {
                return BadRequest("Year range conflicts with existing ranges.");
            }
            await _context.PayrollDefaultVacationrates.AddAsync(vacation);
            await _context.SaveChangesAsync();
            //return Ok();
            return CreatedAtAction("GetByVacationID", new { id = vacation.ID }, vacation);
        }
        //Update Vacation Rates
        [Route("VacationRates/{id}")]
        [HttpPut]
        public async Task<IActionResult> UpdateVacationRates(int id, PayrollDefaultVacationrates vacation)
        {
            if (id != vacation.ID)
            {
                return BadRequest("PayrollDefaultVacationrates does not match with id");
            }

            var checkExist = await _context.PayrollDefaultVacationrates.FirstOrDefaultAsync(x => x.ID != id
            && x.OrgAccountId == OrgAccountId
            && x.yearsWorkedStart <= vacation.yearsWorkedEnd && vacation.yearsWorkedStart <= x.yearsWorkedEnd
            );

            if (checkExist != null)
            {
                return BadRequest("Year range conflicts with existing ranges.");
            }

            var vacationRef = await _context.PayrollDefaultVacationrates.FindAsync(id);
            if (vacationRef == null)
            {
                return BadRequest("PayrollDefaultVacationrates does not exist");
            }
            vacation.createdBy = vacationRef.createdBy;
            vacation.createdDate = vacationRef.createdDate;
            _context.PayrollDefaultVacationrates.Entry(vacationRef).State = EntityState.Detached;
            vacation.OrgAccountId = OrgAccountId;
            _context.PayrollDefaultVacationrates.Update(vacation);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)

            {
                if (!VacationExists(id))
                {
                    return BadRequest("PayrollDefaultVacationrates does not exist");
                }

                else
                {
                    throw;
                }
            }
            //  return Ok();
            return CreatedAtAction("GetByVacationID", new { id = vacation.ID }, vacation);

        }
        private bool VacationExists(int id)
        {
            return _context.PayrollDefaultVacationrates.Any(e => e.ID == id && e.OrgAccountId == OrgAccountId);
        }

        //Delete Vacation Rates
        [Route("VacationRates/{id}")]
        [HttpDelete]
        public async Task<ActionResult<PayrollDefaultVacationrates>> DeleteVacation(int id)
        {
            var vacation = await _context.PayrollDefaultVacationrates.Where(v => v.OrgAccountId == OrgAccountId && v.ID == id).FirstOrDefaultAsync();
            if (vacation == null)
            {
                return BadRequest("PayrollDefaultVacationrates does not exist");
            }

            _context.PayrollDefaultVacationrates.Remove(vacation);
            await _context.SaveChangesAsync();

            return vacation;
        }




        /* UnionPayrolldefaultsVacationRates*/
        // Get All DefaultVacation
        [Route("UnionVacationRates")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UnionPayrolldefaultsVacationRates>>> GetDefaultVacation()
        {
            return await _context.UnionPayrolldefaultsVacationRates.Where(p => p.OrgAccountId == OrgAccountId).ToListAsync();
        }
        //Get DefaultVacation By Id
        [Route("UnionVacationRates/{id}")]
        [HttpGet]
        public async Task<ActionResult<UnionPayrolldefaultsVacationRates>> GetDefaultVacationByID(int id)
        {

            var defaultvacation = await _context.UnionPayrolldefaultsVacationRates.Where(u => u.OrgAccountId == OrgAccountId && u.Id == id).FirstOrDefaultAsync();
            if (defaultvacation == null)
            {
                return BadRequest("UnionPayrolldefaultsVacationRates does not exist");
            }
            return Ok(defaultvacation);
        }
        //Add new DefaultVacation
        [Route("UnionVacationRates")]
        [HttpPost]
        public async Task<ActionResult<UnionPayrolldefaultsVacationRates>> AddDefaultVacation(UnionPayrolldefaultsVacationRates defaultvacation)
        {
            defaultvacation.OrgAccountId = OrgAccountId;
            if (defaultvacation == null)
            {
                return BadRequest("UnionPayrolldefaultsVacationRates does not exist");
            }
            await _context.UnionPayrolldefaultsVacationRates.AddAsync(defaultvacation);
            await _context.SaveChangesAsync();
            // return Ok();
            return CreatedAtAction("GetDefaultVacationByID", new { id = defaultvacation.Id }, defaultvacation);
        }
        //Update DefaultVacation
        [Route("UnionVacationRates/{id}")]
        [HttpPut]
        public async Task<IActionResult> UpdateDefaultVacation(int id, UnionPayrolldefaultsVacationRates defaultvacation)
        {
            if (id != defaultvacation.Id)
            {
                return BadRequest("UnionPayrolldefaultsVacationRates does not exist");
            }
            var unionVacationRef = await _context.UnionPayrolldefaultsVacationRates.FindAsync(id);
            if (unionVacationRef == null)
            {
                return BadRequest("UnionPayrolldefaultsVacationRates does not exist");
            }
            defaultvacation.createdBy = unionVacationRef.createdBy;
            defaultvacation.createdDate = unionVacationRef.createdDate;
            _context.UnionPayrolldefaultsVacationRates.Entry(unionVacationRef).State = EntityState.Detached;
            defaultvacation.OrgAccountId = OrgAccountId;
            _context.UnionPayrolldefaultsVacationRates.Update(defaultvacation);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)

            {
                if (!DefaultVacationExists(id))
                {
                    return BadRequest("UnionPayrolldefaultsVacationRates does not exist");
                }

                else
                {
                    throw;
                }
            }
            //  return Ok();
            return CreatedAtAction("GetDefaultVacationByID", new { id = defaultvacation.Id }, defaultvacation);

        }
        private bool DefaultVacationExists(int id)
        {
            return _context.UnionPayrolldefaultsVacationRates.Any(e => e.Id == id && e.OrgAccountId == OrgAccountId);
        }

        //Delete DefaultVacation
        [Route("UnionVacationRates/{id}")]
        [HttpDelete]
        public async Task<ActionResult<UnionPayrolldefaultsVacationRates>> DeleteDefaultVacation(int id)
        {
            var defaultvacation = await _context.UnionPayrolldefaultsVacationRates.Where(v => v.OrgAccountId == OrgAccountId && v.Id == id).FirstOrDefaultAsync();
            if (defaultvacation == null)
            {
                return BadRequest("UnionPayrolldefaultsVacationRates does not exist");
            }

            _context.UnionPayrolldefaultsVacationRates.Remove(defaultvacation);
            await _context.SaveChangesAsync();

            return defaultvacation;
        }


        /*BENEFIT PACKAGE*/
        // Get All Benefit Packages
        [Route("BenefitPackages")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BenefitPackage>>> GetBenefitPackages(bool desc, bool isactive = true, string sortKey = "benMacroName", string? benMacroNameFilter = "", string? search = "", string? createdDateFilter = "", string? createdByFilter = "", string? modifyDateFilter = "", string? modifyByFilter = "", int skip = 0, int take = 10)
        {

            try
            {
                var list = _context.BenefitPackages.Where(p => p.OrgAccountId == OrgAccountId);
                list = list.Where(x => x.activeInd == isactive);
                if (!string.IsNullOrEmpty(search))
                {
                    search = search.ToLower();
                    list = list.Where(p => (string.IsNullOrEmpty(search) || p.benMacroName.ToLower().Contains(search)));
                }
                if (!string.IsNullOrEmpty(benMacroNameFilter))
                {
                    benMacroNameFilter = benMacroNameFilter.ToLower();
                    list = list.Where(p => p.benMacroName.ToLower().Contains(benMacroNameFilter));
                }

                if (!string.IsNullOrEmpty(createdDateFilter))
                {
                    DateTime formatDate;
                    if (DateTime.TryParse(createdDateFilter, out formatDate))
                    {
                        list = list.Where(x => x.createdDate.HasValue && x.createdDate.Value.Date == formatDate);
                    }
                }
                if (!string.IsNullOrEmpty(createdByFilter))
                {
                    createdByFilter = createdByFilter.Trim().ToLower();
                    list = list.Where(x => !string.IsNullOrEmpty(x.createdBy) && x.createdBy.ToLower() == createdByFilter);
                }
                if (!string.IsNullOrEmpty(modifyDateFilter))
                {
                    DateTime formatDate;
                    if (DateTime.TryParse(modifyDateFilter, out formatDate))
                    {
                        list = list.Where(x => x.modifiedDate.HasValue && x.modifiedDate.Value.Date == formatDate);
                    }
                }
                if (!string.IsNullOrEmpty(modifyByFilter))
                {
                    modifyByFilter = modifyByFilter.Trim().ToLower();
                    list = list.Where(x => !string.IsNullOrEmpty(x.modifiedBy) && x.modifiedBy.ToLower() == modifyByFilter);
                }
                var pagedResult = await list.OrderByCustom(sortKey, desc).ToListAsync();

                var totalCount = pagedResult.Count();
                if (take != 0)
                {
                    pagedResult = pagedResult.Skip(skip).Take(take).ToList();
                }
                return Ok(new { data = pagedResult, Total = totalCount });
            }
            catch (Exception)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, "Internal server error!!");
            }
        }
        //Get Benefit Packages By Id
        [Route("BenefitPackages/{id}")]
        [HttpGet]
        public async Task<ActionResult<BenefitPackage>> GetBenefitPackageByID(int id)
        {
            var package = await _context.BenefitPackages.Where(p => p.OrgAccountId == OrgAccountId && p.Id == id).FirstOrDefaultAsync();

            if (package == null)
            {
                return BadRequest("BenefitPackage does not exist");
            }
            return Ok(package);
        }
        //Add new benefit Packages
        [Route("BenefitPackages")]
        [HttpPost]
        public async Task<ActionResult<BenefitPackage>> AddBenefitPackage(BenefitPackage package)
        {

            package.OrgAccountId = OrgAccountId;
            if (package == null)
            {
                return BadRequest("BenefitPackage does not exist");
            }
            if (string.IsNullOrEmpty(package.benMacroName))
            {
                return BadRequest("BenefitPackage name is required");
            }
            var checkExisting = await _context.BenefitPackages.FirstOrDefaultAsync(x => !string.IsNullOrEmpty(x.benMacroName) && x.benMacroName.ToLower() == package.benMacroName.ToLower() && x.OrgAccountId == OrgAccountId);

            if (checkExisting != null)
            {
                return BadRequest("BenefitPackage already exist with name '" + package.benMacroName + "'");
            }
            await _context.BenefitPackages.AddAsync(package);
            await _context.SaveChangesAsync();
            //return Ok();
            return CreatedAtAction("GetBenefitPackageByID", new { id = package.Id }, package);
        }
        //Update Benefit Packages
        [Route("BenefitPackages/{id}")]
        [HttpPut]
        public async Task<IActionResult> UpdateBenefitPackages(int id, BenefitPackage package)
        {
            if (id != package.Id)
            {
                return BadRequest("BenefitPackage does not exist");
            }
            if (string.IsNullOrEmpty(package.benMacroName))
            {
                return BadRequest("BenefitPackage name is required");
            }
            var checkExisting = await _context.BenefitPackages.FirstOrDefaultAsync(x => !string.IsNullOrEmpty(x.benMacroName) && x.benMacroName.ToLower() == package.benMacroName.ToLower() && x.Id != id && x.OrgAccountId == OrgAccountId);

            if (checkExisting != null)
            {
                return BadRequest("BenefitPackage already exist with name '" + package.benMacroName + "'");
            }
            var packageRef = await _context.BenefitPackages.FindAsync(id);
            if (packageRef == null)
            {
                return BadRequest("BenefitPackage does not exist");
            }
            package.createdBy = packageRef.createdBy;
            package.createdDate = packageRef.createdDate;
            _context.BenefitPackages.Entry(packageRef).State = EntityState.Detached;
            package.OrgAccountId = OrgAccountId;
            _context.BenefitPackages.Update(package);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)

            {
                if (!PackageExists(id))
                {
                    return BadRequest("BenefitPackage does not exist");
                }

                else
                {
                    throw;
                }
            }
            //  return Ok();
            return CreatedAtAction("GetBenefitPackageByID", new { id = package.Id }, package);

        }
        private bool PackageExists(int id)
        {
            return _context.BenefitPackages.Any(e => e.Id == id);
        }

        //Delete Benefit Packages
        [Route("BenefitPackages/{id}")]
        [HttpDelete]
        public async Task<ActionResult<BenefitPackage>> DeleteBenefitPackage(int id)
        {
            var package = await _context.BenefitPackages.Where(p => p.OrgAccountId == OrgAccountId && p.Id == id).FirstOrDefaultAsync();
            if (package == null)
            {
                return BadRequest("BenefitPackage does not exist");
            }

            _context.BenefitPackages.Remove(package);
            await _context.SaveChangesAsync();

            return package;
        }


        /*JOB CODES*/
        // Get All Job Codes
        [Route("JobCodes")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<JobCodes>>> GetJobCodes(string? jobCode = "", string? jobName = "", string? search = "", int skip = 0, int take = 10)
        {
            try
            {
                if (!string.IsNullOrEmpty(search))
                {
                    search = search.ToLower();
                }

                if (search == "")
                {
                    var list = _context.JobCodes.Include(x => x.PayrollJobDescription).
                        Where(x => (string.IsNullOrEmpty(jobCode) || x.jobCode.Contains(string.IsNullOrEmpty(jobCode) ? "" : jobCode))
                        && (string.IsNullOrEmpty(jobName) || x.PayrollJobDescription.empJobDescription.ToLower().Contains(string.IsNullOrEmpty(jobName) ? "" : jobName)));//.ToListAsync();

                    var totalCount = await list.CountAsync();

                    if (take == 0)
                    {
                        var listData = await list.ToListAsync();
                        return Ok(new { data = listData, Total = totalCount });
                    }
                    else
                    {
                        var listData = await list.Skip(skip).Take(take).ToListAsync();
                        return Ok(new { data = listData, Total = totalCount });
                    }
                }
                else
                {
                    var list = _context.JobCodes.Include(x => x.PayrollJobDescription).
                        Where(x => x.jobCode.Contains(string.IsNullOrEmpty(search) ? "" : search)
                        && x.PayrollJobDescription.empJobDescription.ToLower().Contains(string.IsNullOrEmpty(search) ? "" : search));

                    var totalCount = await list.CountAsync();

                    if (take == 0)
                    {
                        var listData = await list.ToListAsync();
                        return Ok(new { data = listData, Total = totalCount });
                    }
                    else
                    {
                        var listData = await list.Skip(skip).Take(take).ToListAsync();
                        return Ok(new { data = listData.Skip(skip).Take(take).ToList(), Total = totalCount });
                    }
                }
            }
            catch (Exception ex)
            {
                throw;
            }
        }
        //Get Job Codes By Id
        [Route("JobCodes/{id}")]
        [HttpGet]
        public async Task<ActionResult<JobCodes>> GetJobCodeByID(int id)
        {
            var job = await _context.JobCodes.Include(x => x.PayrollJobDescription).Where(p => p.OrgAccountId == OrgAccountId && p.Id == id).FirstOrDefaultAsync();
            if (job == null)
            {
                return BadRequest("JobCodes does not exist");
            }
            return Ok(job);
        }
        //Add new Job Codes
        [Route("JobCodes")]
        [HttpPost]
        public async Task<ActionResult<JobCodes>> AddJobCode(JobCodes job)
        {

            job.OrgAccountId = OrgAccountId;
            if (job == null)
            {
                return BadRequest("JobCodes does not exist");
            }
            await _context.JobCodes.AddAsync(job);
            await _context.SaveChangesAsync();
            //return Ok();
            return CreatedAtAction("GetJobCodeByID", new { id = job.Id }, job);
        }
        //Update Job Codes
        [Route("JobCodes/{id}")]
        [HttpPut]
        public async Task<IActionResult> UpdateJobCode(int id, JobCodes job)
        {
            if (id != job.Id)
            {
                return BadRequest("JobCodes does not exist");
            }
            job.OrgAccountId = OrgAccountId;
            _context.JobCodes.Update(job);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)

            {
                if (!JobExists(id))
                {
                    return BadRequest("JobCodes does not exist");
                }

                else
                {
                    throw;
                }
            }
            //  return Ok();
            return CreatedAtAction("GetJobCodeByID", new { id = job.Id }, job);

        }
        private bool JobExists(int id)
        {
            return _context.JobCodes.Any(e => e.Id == id && e.OrgAccountId == OrgAccountId);
        }

        //Delete Job Codes
        [Route("JobCodes/{id}")]
        [HttpDelete]
        public async Task<ActionResult<JobCodes>> DeleteJobCodes(int id)
        {
            var job = await _context.JobCodes.Where(p => p.OrgAccountId == OrgAccountId && p.Id == id).FirstOrDefaultAsync();
            if (job == null)
            {
                return BadRequest("JobCodes does not exist");
            }

            _context.JobCodes.Remove(job);
            await _context.SaveChangesAsync();

            return job;
        }

        /* BENEFIT PACKAGE BENEFIT LINK*/
        // Get All Benefit Links
        [Route("BenefitLinks")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BenefitPackageBenefitLink>>> GetBenefitLinks()
        {
            return await _context.BenefitPackageBenefitLinks.Where(p => p.OrgAccountId == OrgAccountId).ToListAsync();
        }
        //Get Benefit Links By Id
        [Route("BenefitLinks/{id}")]
        [HttpGet]
        public async Task<ActionResult<BenefitPackageBenefitLink>> GetBenefitLinkByID(int id)
        {
            var link = await _context.BenefitPackageBenefitLinks.Where(p => p.OrgAccountId == OrgAccountId && p.Id == id).FirstOrDefaultAsync(); if (link == null)
            {
                return BadRequest("BenefitPackageBenefitLink does not exist");
            }
            return Ok(link);
        }
        //Add new benefit Links
        [Route("BenefitLinks")]
        [HttpPost]
        public async Task<ActionResult<BenefitPackageBenefitLink>> AddBenefitPackage(BenefitPackageBenefitLink link)
        {

            link.OrgAccountId = OrgAccountId;
            if (link == null)
            {
                return BadRequest("BenefitPackageBenefitLink does not exist");
            }
            await _context.BenefitPackageBenefitLinks.AddAsync(link);
            await _context.SaveChangesAsync();
            //return Ok();
            return CreatedAtAction("GetBenefitLinkByID", new { id = link.Id }, link);
        }
        //Update Benefit Links
        [Route("BenefitLinks/{id}")]
        [HttpPut]
        public async Task<IActionResult> UpdateBenefitLinks(int id, BenefitPackageBenefitLink link)
        {
            if (id != link.Id)
            {
                return BadRequest("BenefitPackageBenefitLink does not match with id");
            }
            var packageLinkRef = await _context.BenefitPackageBenefitLinks.FindAsync(id);
            if (packageLinkRef == null)
            {
                return BadRequest("BenefitPackageBenefitLink does not exist");
            }
            link.createdBy = packageLinkRef.createdBy;
            link.createdDate = packageLinkRef.createdDate;
            _context.BenefitPackageBenefitLinks.Entry(packageLinkRef).State = EntityState.Detached;
            link.OrgAccountId = OrgAccountId;
            _context.BenefitPackageBenefitLinks.Update(link);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)

            {
                if (!LinkExists(id))
                {
                    return BadRequest("BenefitPackageBenefitLink does not exist");
                }

                else
                {
                    throw;
                }
            }
            //  return Ok();
            return CreatedAtAction("GetBenefitLinkByID", new { id = link.Id }, link);

        }
        private bool LinkExists(int id)
        {
            return _context.BenefitPackageBenefitLinks.Any(e => e.Id == id && e.OrgAccountId == OrgAccountId);
        }

        //Delete Benefit Links
        [Route("BenefitLinks/{id}")]
        [HttpDelete]
        public async Task<ActionResult<BenefitPackageBenefitLink>> DeleteBenefitLink(int id)
        {
            var link = await _context.BenefitPackageBenefitLinks.Where(p => p.OrgAccountId == OrgAccountId && p.Id == id).FirstOrDefaultAsync();
            if (link == null)
            {
                return BadRequest("BenefitPackageBenefitLink does not exist");
            }

            _context.BenefitPackageBenefitLinks.Remove(link);
            await _context.SaveChangesAsync();

            return link;
        }
        /* PAY CODES*/
        // Get All Pay Codes
        [Route("PayCodes")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PayCodes>>> GetPayCodes()
        {
            return await _context.PayCodes.Where(p => p.OrgAccountId == OrgAccountId)
                .ToListAsync();
        }
        //Get Pay Codes By Id
        [Route("PayCodes/{id}")]
        [HttpGet]
        public async Task<ActionResult<PayCodes>> GetPayCodeByID(int id)
        {
            var pay = await _context.PayCodes.Where(p => p.OrgAccountId == OrgAccountId && p.Id == id).FirstOrDefaultAsync();
            if (pay == null)
            {
                return BadRequest("PayCodes does not exist");
            }
            return Ok(pay);
        }
        //Add new Pay Codes
        [Route("PayCodes")]
        [HttpPost]
        public async Task<ActionResult<PayCodes>> AddPayCode(PayCodes pay)
        {

            pay.OrgAccountId = OrgAccountId;
            if (pay == null)
            {
                return BadRequest("PayCodes does not exist");
            }
            await _context.PayCodes.AddAsync(pay);
            await _context.SaveChangesAsync();
            //return Ok();
            return CreatedAtAction("GetPayCodeByID", new { id = pay.Id }, pay);
        }
        //Update Pay Codes
        [Route("PayCodes/{id}")]
        [HttpPut]
        public async Task<IActionResult> UpdatePayCodes(int id, PayCodes pay)
        {
            if (id != pay.Id)
            {
                return BadRequest("PayCodes does not match with id");
            }
            pay.OrgAccountId = OrgAccountId;
            _context.PayCodes.Update(pay);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)

            {
                if (!PayExists(id))
                {
                    return BadRequest("PayCodes does not exist");
                }

                else
                {
                    throw;
                }
            }
            //  return Ok();
            return CreatedAtAction("GetPayCodeByID", new { id = pay.Id }, pay);

        }
        private bool PayExists(int id)
        {
            return _context.PayCodes.Any(e => e.Id == id && e.OrgAccountId == OrgAccountId);
        }

        //Delete Pay Codes
        [Route("PayCodes/{id}")]
        [HttpDelete]
        public async Task<ActionResult<PayCodes>> DeletePayCode(int id)
        {
            var pay = await _context.PayCodes.Where(p => p.OrgAccountId == OrgAccountId && p.Id == id).FirstOrDefaultAsync();
            if (pay == null)
            {
                return BadRequest("PayCodes does not exist");
            }

            _context.PayCodes.Remove(pay);
            await _context.SaveChangesAsync();

            return pay;
        }

        /* PAY ROLL RANGES*/
        // Get All Payroll Ranges
        [Route("PayrollRanges")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PayrollRanges>>> GetPayrollRanges()
        {
            return await _context.PayrollRanges.Where(p => p.OrgAccountId == OrgAccountId)
                .ToListAsync();
        }
        //Get Pay Codes By Id
        [Route("PayrollRanges/{id}")]
        [HttpGet]
        public async Task<ActionResult<PayrollRanges>> GetPayrollRangeByID(int id)
        {
            var payrange = await _context.PayrollRanges.Where(p => p.OrgAccountId == OrgAccountId && p.Id == id).FirstOrDefaultAsync();
            if (payrange == null)
            {
                return BadRequest("PayrollRanges does not exist");
            }
            return Ok(payrange);
        }
        //Add new Payroll Ranges
        [Route("PayrollRanges")]
        [HttpPost]
        public async Task<ActionResult<PayrollRanges>> AddPayrollRange(PayrollRanges payrange)
        {

            payrange.OrgAccountId = OrgAccountId;
            if (payrange == null)
            {
                return BadRequest("PayrollRanges does not exist");
            }
            await _context.PayrollRanges.AddAsync(payrange);
            await _context.SaveChangesAsync();
            //return Ok();
            return CreatedAtAction("GetPayrollRangeByID", new { id = payrange.Id }, payrange);
        }
        //Update Payroll Ranges
        [Route("PayrollRanges/{id}")]
        [HttpPut]
        public async Task<IActionResult> UpdatePayrollRanges(int id, PayrollRanges payrange)
        {
            if (id != payrange.Id)
            {
                return BadRequest("PayrollRanges does not match with id");
            }
            payrange.OrgAccountId = OrgAccountId;
            _context.PayrollRanges.Update(payrange);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)

            {
                if (!PayrangeExists(id))
                {
                    return BadRequest("PayrollRanges does not exist");
                }

                else
                {
                    throw;
                }
            }
            //  return Ok();
            return CreatedAtAction("GetPayrollRangeByID", new { id = payrange.Id }, payrange);

        }
        private bool PayrangeExists(int id)
        {
            return _context.PayrollRanges.Any(e => e.Id == id && e.OrgAccountId == OrgAccountId);
        }

        //Delete Payroll Ranges
        [Route("PayrollRanges/{id}")]
        [HttpDelete]
        public async Task<ActionResult<PayrollRanges>> DeletePayrollRange(int id)
        {
            var payrange = await _context.PayrollRanges.Where(p => p.OrgAccountId == OrgAccountId && p.Id == id).FirstOrDefaultAsync();
            if (payrange == null)
            {
                return BadRequest("PayrollRanges does not exist");
            }

            _context.PayrollRanges.Remove(payrange);
            await _context.SaveChangesAsync();

            return payrange;
        }

        /*PAYROLL JOB DESCRIPTION*/
        //Get all Payroll Job Description
        [Route("PayrollJobDescription")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PayrollJobDescription>>> GetPayrollJobDescription()
        {
            return await _context.PayrollJobDescriptions.Where(d => d.OrgAccountId == OrgAccountId).OrderBy(x=>x.empJobDescription).ToListAsync();
        }
        //Get  Payroll Job Description by id
        [Route("PayrollJobDescription/{id}")]
        [HttpGet]
        public async Task<ActionResult<PayrollJobDescription>> GetPayrollJobDescriptionByID(int id)
        {
            var payjobdesc = await _context.PayrollJobDescriptions.FirstOrDefaultAsync(d => d.OrgAccountId == OrgAccountId && d.Id == id);
            if (payjobdesc == null)
            {
                return BadRequest("PayrollJobDescription does not exist");
            }
            return Ok(payjobdesc);
        }
        //Add  Payroll Job Description
        [Route("PayrollJobDescription")]
        [HttpPost]
        public async Task<ActionResult<PayrollJobDescription>> AddPayrollJobDescription(PayrollJobDescription payjobdesc)
        {
            payjobdesc.OrgAccountId = OrgAccountId;
            if (payjobdesc == null)
            {
                return BadRequest("PayrollJobDescription does not exist");
            }
            await _context.PayrollJobDescriptions.AddAsync(payjobdesc);
            await _context.SaveChangesAsync();
            //return Ok();
            return CreatedAtAction("GetPayrollJobDescriptionByID", new { id = payjobdesc.Id }, payjobdesc);
        }
        //Update Payroll Job Description
        [Route("PayrollJobDescription/{id}")]
        [HttpPut]
        public async Task<IActionResult> UpdatePayrollJobDescription(int id, PayrollJobDescription payjobdesc)
        {
            if (id != payjobdesc.Id)
            {
                return BadRequest("PayrollJobDescription does not match with id");
            }
            var jobDescriptionRef = await _context.PayrollJobDescriptions.FindAsync(id);
            if (jobDescriptionRef == null)
            {
                return BadRequest("PayrollJobDescription does not exist");
            }
            payjobdesc.createdBy = jobDescriptionRef.createdBy;
            payjobdesc.createdDate = jobDescriptionRef.createdDate;
            _context.PayrollJobDescriptions.Entry(jobDescriptionRef).State = EntityState.Detached;
            payjobdesc.OrgAccountId = OrgAccountId;
            _context.PayrollJobDescriptions.Update(payjobdesc);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)

            {
                if (!PayJobDescExists(id))
                {
                    return BadRequest("PayrollJobDescription does not exist");
                }

                else
                {
                    throw;
                }
            }
            //  return Ok();
            return CreatedAtAction("GetPayrollJobDescriptionByID", new { id = payjobdesc.Id }, payjobdesc);


        }
        private bool PayJobDescExists(int id)
        {
            return _context.PayrollJobDescriptions.Any(e => e.Id == id);
        }
        //Delete Payroll Job Description
        [Route(" PayrollJobDescription/{id}")]
        [HttpDelete]
        public async Task<ActionResult<PayrollJobDescription>> DeletePayrollJobDesc(int id)
        {
            var payjobdesc = await _context.PayrollJobDescriptions.FirstOrDefaultAsync(d => d.OrgAccountId == OrgAccountId && d.Id == id);
            if (payjobdesc == null)
            {
                return BadRequest("PayrollJobDescription does not exist");
            }
            _context.PayrollJobDescriptions.Remove(payjobdesc);
            await _context.SaveChangesAsync();
            return payjobdesc;
        }

        [Route("PayrollUnion")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Union>>> GetAllUnion()
        {
            try
            {
                return await _context.Unions.Where(p => p.OrgAccountId == OrgAccountId).OrderBy(x => x.description).ToListAsync();
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        /*Payroll Job Classification*/
        //Get all  Payroll Job Classification
        [Route("PayrollJobClassification")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PayrollJobClassification>>> GetAllJobClassifications(bool activeOnly = true)
        {
            if (activeOnly)
                return await _context.PayrollJobClassifications.Where(p => p.OrgAccountId == OrgAccountId && !p.inactive).OrderBy(x => x.jobClassification).ToListAsync();
            else
                return await _context.PayrollJobClassifications.Where(p => p.OrgAccountId == OrgAccountId).OrderBy(x => x.jobClassification).ToListAsync();
        }

        //Get Payroll Job Classification By Id
        [Route("PayrollJobClassification/{id}")]
        [HttpGet]
        public async Task<ActionResult<PayrollJobClassification>> GetPayrollJobClassificationById(int id)
        {
            var jobclass = await _context.PayrollJobClassifications.FirstOrDefaultAsync(j => j.OrgAccountId == OrgAccountId && j.Id == id);
            if (jobclass == null)
            {
                return BadRequest("PayrollJobClassification does not exist");
            }
            return Ok(jobclass);
        }
        //Add New Payroll Job Classification
        [Route("PayrollJobClassification")]
        [HttpPost]
        public async Task<ActionResult<PayrollJobClassification>> AddJobClassification(PayrollJobClassification jobclass)
        {
            jobclass.OrgAccountId = OrgAccountId;
            if (jobclass == null)
            {
                return BadRequest("PayrollJobClassification does not exist");
            }
            await _context.PayrollJobClassifications.AddAsync(jobclass);
            await _context.SaveChangesAsync();
            // return Ok();
            return CreatedAtAction("GetPayrollJobClassificationById", new { id = jobclass.Id }, jobclass);
        }
        //Update Payroll Job Classification
        [Route("PayrollJobClassification/{id}")]
        [HttpPut]
        public async Task<IActionResult> UpdateJobClassification(int id, PayrollJobClassification jobclass)
        {
            if (id != jobclass.Id)
            {
                return BadRequest("PayrollJobClassification does not match with id");
            }
            var jobClassificationRef = await _context.PayrollJobClassifications.FindAsync(id);
            if (jobClassificationRef == null)
            {
                return BadRequest("PayrollJobClassification does not exist");
            }
            jobclass.createdBy = jobClassificationRef.createdBy;
            jobclass.createdDate = jobClassificationRef.createdDate;
            _context.PayrollJobClassifications.Entry(jobClassificationRef).State = EntityState.Detached;
            jobclass.OrgAccountId = OrgAccountId;
            _context.PayrollJobClassifications.Update(jobclass);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)

            {
                if (!PayJobClassExists(id))
                {
                    return BadRequest("PayrollJobClassification does not exist");
                }

                else
                {
                    throw;
                }
            }
            //  return Ok();
            return CreatedAtAction("GetPayrollJobClassificationById", new { id = jobclass.Id }, jobclass);


        }
        private bool PayJobClassExists(int id)
        {
            return _context.PayrollJobClassifications.Any(e => e.Id == id);
        }
        //Delete Payroll Job Classification
        [Route("PayrollJobClassification/{id}")]
        [HttpDelete]
        public async Task<ActionResult<PayrollJobClassification>> DeleteJobClass(int id)
        {
            var jobclass = await _context.PayrollJobClassifications.FirstOrDefaultAsync(j => j.OrgAccountId == OrgAccountId && j.Id == id);
            if (jobclass == null)
            {
                return BadRequest("PayrollJobClassification does not exist");
            }
            _context.PayrollJobClassifications.Remove(jobclass);
            await _context.SaveChangesAsync();
            return Ok(jobclass);
        }

        [Route("PayrollEmpYearsList")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PayrollEmpYear>>> PayrollEmpYearsList()
        {
            try
            {
                return await _context.PayrollEmpYears
                    .Where(x => x.empYrEnd.Value.Year >= DateTime.Now.Year)
                    .OrderBy(x => x.empYrStart)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        /*PAYROLL EMP YEAR*/
        //get all emp years
        [Route("PayrollEmpYears")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PayrollEmpYear>>> GetPayrollEmpYears()
        {
            try
            {
                return await _context.PayrollEmpYears
                    //.Where(x => x.empYrEnd.Value.Year >= DateTime.Now.Year)
                    //.OrderBy(x=>x.empYrStart)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                throw;
            }
        }
        //Get Payroll emp years By Id
        [Route("PayrollEmpYears/{id}")]
        [HttpGet]
        public async Task<ActionResult<PayrollEmpYear>> GetPayrolEmpYearByID(int id)
        {
            var payempyear = await _context.PayrollEmpYears.FindAsync(id);
            if (payempyear == null)
            {
                return BadRequest("PayrollEmpYear does not exist");
            }
            return Ok(payempyear);
        }
        //Add new PayrollEmpYears
        [Route("PayrollEmpYears")]
        [HttpPost]
        public async Task<ActionResult<PayrollEmpYear>> AddPayrollEmpYears(PayrollEmpYear payempyear)
        {

            if (payempyear == null)
            {
                return BadRequest("PayrollEmpYear does not exist");
            }
            payempyear.OrgAccountId = OrgAccountId;
            if (payempyear.empYrStart == null)
            {
                return BadRequest("Payroll emp start date is required");
            }
            if (payempyear.empYrEnd == null)
            {
                return BadRequest("Payroll emp end date is required");
            }

            var checkExist = await _context.PayrollEmpYears.FirstOrDefaultAsync(x => x.OrgAccountId == OrgAccountId
            && x.empYrStart == payempyear.empYrStart && x.empYrEnd == payempyear.empYrEnd && x.months == payempyear.months);

            if (checkExist != null)
            {
                return BadRequest("Contract years already exist with date " + payempyear.empYrStart.Value.Date.ToString("MM/dd/yyyy") + " to " + payempyear.empYrEnd.Value.Date.ToString("MM/dd/yyyy"));
            }
            await _context.PayrollEmpYears.AddAsync(payempyear);
            await _context.SaveChangesAsync();
            //return Ok();
            return CreatedAtAction("GetPayrolEmpYearByID", new { id = payempyear.Id }, payempyear);
        }
        //Update PayrollEmpYears
        [Route("PayrollEmpYears/{id}")]
        [HttpPut]
        public async Task<IActionResult> UpdatePayrollEmpYears(int id, PayrollEmpYear payempyear)
        {
            if (id != payempyear.Id)
            {
                return BadRequest("PayrollEmpYear does not match with id");
            }
            if (payempyear.empYrStart == null)
            {
                return BadRequest("Payroll emp start date is required");
            }
            if (payempyear.empYrEnd == null)
            {
                return BadRequest("Payroll emp end date is required");
            }

            var checkExist = await _context.PayrollEmpYears.FirstOrDefaultAsync(x => x.Id != id && x.OrgAccountId == OrgAccountId
            && x.empYrStart == payempyear.empYrStart && x.empYrEnd == payempyear.empYrEnd && x.months == payempyear.months);

            if (checkExist != null)
            {
                return BadRequest("Contract years already exist with date " + payempyear.empYrStart.Value.Date.ToString("MM/dd/yyyy") + " to " + payempyear.empYrEnd.Value.Date.ToString("MM/dd/yyyy"));
            }
            var empYearRef = await _context.PayrollEmpYears.FindAsync(id);
            if (empYearRef == null)
            {
                return BadRequest("PayrollEmpYear does not exist");
            }

            if (empYearRef.months == payempyear.months)
            {
                var empWithSameRange = await _context.EmployeePayrollSetups.Where(x => x.empWorkMonths == empYearRef.months && x.workYrStart == empYearRef.empYrStart && x.workYrStop == empYearRef.empYrEnd).ToListAsync();
                foreach ( var emp in empWithSameRange )
                {
                    emp.workYrStart = payempyear.empYrStart;
                    emp.workYrStop = payempyear.empYrEnd;
                }
            }

            payempyear.createdDate = empYearRef.createdDate;
            payempyear.createdBy = empYearRef.createdBy;
            _context.PayrollEmpYears.Entry(empYearRef).State = EntityState.Detached;
            payempyear.OrgAccountId = OrgAccountId;
            _context.PayrollEmpYears.Update(payempyear);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)

            {
                if (!PayEmpYearExists(id))
                {
                    return BadRequest("PayrollEmpYear does not exist");
                }

                else
                {
                    throw;
                }
            }
            //  return Ok();
            return CreatedAtAction("GetPayrolEmpYearByID", new { id = payempyear.Id }, payempyear);


        }
        private bool PayEmpYearExists(int id)
        {
            return _context.PayrollEmpYears.Any(e => e.Id == id);
        }

        //Delete PayrollEmpYears
        [Route("PayrollEmpYears/{id}")]
        [HttpDelete]
        public async Task<ActionResult<PayrollEmpYear>> DeletePayrollEmpYears(int id)
        {
            var payempyear = await _context.PayrollEmpYears.FindAsync(id);
            if (payempyear == null)
            {
                return BadRequest("PayrollEmpYear does not exist");
            }

            _context.PayrollEmpYears.Remove(payempyear);
            await _context.SaveChangesAsync();

            return payempyear;
        }

        [Route("BenefitsByPackage/{packageId}")]
        [HttpGet]
        public async Task<IEnumerable<Benefits>> GetBenefitsByPackage(int packageId)
        {
            List<Benefits> benefits = new List<Benefits>();
            List<BenefitPackageBenefitLink> benefitLinks = await _context.BenefitPackageBenefitLinks.Where(x => x.macroNameId == packageId && x.OrgAccountId == OrgAccountId).ToListAsync();
            foreach (var benefitLink in benefitLinks)
            {
                var benefit = await _context.Benefits.Where(x => x.Id == benefitLink.bennyId).FirstOrDefaultAsync();
                if (benefit != null)
                {
                    benefit.CountyAccountCode = await _context.AccountingCodes.Where(x => x.Id == benefitLink.cacId).Select(x => x.countyExpenseCode).FirstOrDefaultAsync();
                    benefit.BenefitPackageLinkID = benefitLink.Id;
                    benefits.Add(benefit);
                }
            }
            return benefits;

        }

        [Route("AddBenefitToPackage")]
        [HttpPost]
        public async Task<ActionResult> AddBenefitToPackage(List<BenefitPackageBenefitLink> requests)
        {
            var existingBenefits = await _context.BenefitPackageBenefitLinks.Where(x => x.macroNameId == requests[0].macroNameId).ToListAsync();
            foreach (var item in requests)
            {
                if (!existingBenefits.Any(x => x.bennyId == item.bennyId && x.cacId == item.cacId))
                {
                    BenefitPackageBenefitLink benefitLink = new BenefitPackageBenefitLink();
                    benefitLink.bennyId = item.bennyId;
                    benefitLink.OrgAccountId = OrgAccountId;
                    benefitLink.cacId = item.cacId;
                    benefitLink.macroNameId = item.macroNameId;
                    benefitLink.createdBy = item.createdBy;
                    benefitLink.createdDate = item.createdDate;
                    benefitLink.modifiedDate = item.modifiedDate;
                    benefitLink.modifiedBy = item.modifiedBy;
                    _context.BenefitPackageBenefitLinks.Add(benefitLink);
                }
            }

            await _context.SaveChangesAsync();
            return Ok(requests);

            /* var package = await _context.BenefitPackages.Where(x => x.Id == packageId && x.OrgAccountId == OrgAccountId).FirstOrDefaultAsync();
            if (package == null)
            {
                return BadRequest("Package Not Found");
            }
            benefit.OrgAccountId = OrgAccountId;
            _context.Benefits.Add(benefit);
            await _context.SaveChangesAsync();
            BenefitPackageBenefitLink benefitLink = new BenefitPackageBenefitLink();
            benefitLink.BennyId = benefit.Id;
            benefitLink.OrgAccountId = OrgAccountId;
            benefitLink.MacroNameId = packageId;
            benefitLink.CreatedBy = benefit.CreatedBy;
            benefitLink.CreatedDate = benefit.CreatedDate;
            benefitLink.ModifiedDate = benefit.ModifiedDate;
            benefitLink.ModifiedBy = benefit.ModifiedBy;
            _context.BenefitPackageBenefitLinks.Add(benefitLink);
            await _context.SaveChangesAsync();
            return Ok(benefit);
            */

        }
        [Route("UpdateBenefitToPackage")]
        [HttpPut]
        public async Task<ActionResult> UpdateBenefitToPackage(BenefitPackageBenefitLink request)
        {
            var benefitPacakgeLink = await _context.BenefitPackageBenefitLinks.FirstOrDefaultAsync(x => x.Id == request.Id);
            if (benefitPacakgeLink == null)
            {
                return BadRequest("Benefit does not exists.");
            }

            if (await _context.BenefitPackageBenefitLinks.AnyAsync(x => x.macroNameId == benefitPacakgeLink.macroNameId && x.Id != request.Id && x.bennyId == request.bennyId && x.cacId == request.cacId)) {
                return BadRequest("Benefit with same name and CAC already exists.");
            }

            //BenefitPackageBenefitLink benefitLink = new BenefitPackageBenefitLink();
            benefitPacakgeLink.bennyId = request.bennyId;
            benefitPacakgeLink.cacId = request.cacId;
            //benefitPacakgeLink.modifiedDate = item.modifiedDate;
            //benefitPacakgeLink.modifiedBy = item.modifiedBy;
            _context.BenefitPackageBenefitLinks.Update(benefitPacakgeLink);
            await _context.SaveChangesAsync();

            return Ok(request);
        }
    }
}
