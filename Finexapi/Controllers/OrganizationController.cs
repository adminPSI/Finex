using FinexAPI.Data;
using FinexAPI.Helper;
using FinexAPI.Models;
using FinexAPI.Models.Organization;
using FinexAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace FinexAPI.Controllers
{
    [Authorize]
    public class OrganizationController : BaseController
    {
        private readonly FinexAppContext _organizationContext;
        private readonly ILogger _logger;
       
        public OrganizationController(IHttpContextAccessor contextAccessor, FinexAppContext organizationContext, ILogger<OrganizationController> logger) : base(contextAccessor)
        {
            _organizationContext = organizationContext;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Organization>>> GetOrgnizations(bool desc, string sortKey = "modifiedDate", string? name = "", string? countyName = "", string? addressLine = "",
            string? contactNumber = "", string? city = "", string? state = "", string? zipCode = "", string? phoneNumber = "", string? taxExcemptNum = "",
            string? search = "", int take = 0, int skip = 0)
        {
            ListResultController<Organization> _cmnCntrlr = new ListResultController<Organization>();
            //List<Organization> organizations = new List<Organization>();
            if (search == "")
            {
                var organizations = _organizationContext.Organizations.Include(x => x.OrgnizationAccount).Include(x => x.OrgnizationLocation).
                    Where(x => x.Name.Contains(string.IsNullOrEmpty(name) ? "" : name)
                    && (string.IsNullOrEmpty(countyName) || x.OrgnizationLocation.countyName.Contains(string.IsNullOrEmpty(countyName) ? "" : countyName))
                    && (string.IsNullOrEmpty(addressLine) || x.OrgnizationLocation.addressLine.Contains(string.IsNullOrEmpty(addressLine) ? "" : addressLine))
                    && (string.IsNullOrEmpty(contactNumber) || x.OrgnizationLocation.contactNumber.Contains(string.IsNullOrEmpty(contactNumber) ? "" : contactNumber))
                    && (string.IsNullOrEmpty(city) || x.OrgnizationLocation.city.Contains(string.IsNullOrEmpty(city) ? "" : city))
                    && (string.IsNullOrEmpty(state) || x.OrgnizationLocation.state.Contains(string.IsNullOrEmpty(state) ? "" : state))
                    && (string.IsNullOrEmpty(zipCode) || x.OrgnizationLocation.zipCode.Contains(string.IsNullOrEmpty(zipCode) ? "" : zipCode))
                    && (string.IsNullOrEmpty(phoneNumber) || x.phoneNumber.Contains(string.IsNullOrEmpty(phoneNumber) ? "" : phoneNumber))
                    && (string.IsNullOrEmpty(taxExcemptNum) || x.taxExemptNum.Contains(string.IsNullOrEmpty(taxExcemptNum) ? "" : taxExcemptNum))).OrderByCustom(sortKey, desc);

                organizations = FilterOrganizations(organizations);
                return await _cmnCntrlr.returnResponse(take, skip, organizations, 0);
            }
            else
            {
                search = string.IsNullOrEmpty(search) ? "" : search;
                var organizations = _organizationContext.Organizations.Include(x => x.OrgnizationAccount).Include(x => x.OrgnizationLocation).
                    Where(x => x.Name.Contains(string.IsNullOrEmpty(search) ? "" : search)
                    || x.OrgnizationLocation.countyName.Contains(string.IsNullOrEmpty(search) ? "" : search)
                    || x.OrgnizationLocation.addressLine.Contains(string.IsNullOrEmpty(search) ? "" : search)
                    || x.OrgnizationLocation.contactNumber.Contains(string.IsNullOrEmpty(search) ? "" : search)
                    || x.OrgnizationLocation.city.Contains(string.IsNullOrEmpty(search) ? "" : search)
                    || x.OrgnizationLocation.state.Contains(string.IsNullOrEmpty(search) ? "" : search)
                    || x.OrgnizationLocation.zipCode.Contains(string.IsNullOrEmpty(search) ? "" : search)
                    || x.phoneNumber.Contains(string.IsNullOrEmpty(search) ? "" : search)
                    || x.taxExemptNum.Contains(string.IsNullOrEmpty(search) ? "" : search));

                organizations = FilterOrganizations(organizations);

                return await _cmnCntrlr.returnResponse(take, skip, organizations, 0);
            }
        }
        private IQueryable<Organization> FilterOrganizations(IQueryable<Organization> organizations)
        {
            _logger.LogInformation("Organization Account Id: " + OrgAccountId);
            System.Diagnostics.Debug.WriteLine("Organization Account Id: " + OrgAccountId);
            if (OrgAccountId == -1 || OrgAccountId == 0)
            {
                return organizations;
            }
            else
            {
                var orgaccountobject = _organizationContext.orgnizationAccounts.Where(x => x.Id == OrgAccountId).FirstOrDefault();
                return organizations.Where(x => x.Id == orgaccountobject.orgId);
                //return organizations.Where(x => x.OrgnizationAccount.Id == OrgAccountId).ToList();
            }
        }
        [HttpGet("{id}")]
        public async Task<ActionResult<Organization>> GetOrganization(int id)
        {
            var org = await _organizationContext.Organizations.Include(x => x.OrgnizationAccount).Include(x => x.OrgnizationLocation).Where(x => x.Id == id).FirstOrDefaultAsync();
            if (org == null)
            {
                return BadRequest("Organization does not exist");
            }
            return Ok(org);
        }
        [HttpPost]
        public async Task<ActionResult<Organization>> CreateOrganization(Organization organization)
        {
            if (organization == null)
            {
                return BadRequest("Organization does not exist");
            }
            _organizationContext.Organizations.Add(organization);
            await _organizationContext.SaveChangesAsync();
            return Ok(organization);
        }
        [HttpPost]
        [Route("OrganizationLocation")]
        public async Task<ActionResult> CreateOrganizationLocation(OrgnizationLocation orgnizationLocation)
        {
            if (orgnizationLocation == null)
            {
                return BadRequest("OrgnizationLocation does not exist");
            }
            var orgLocation = await _organizationContext.orgnizationLocations.Where(x => x.orgId == orgnizationLocation.orgId).FirstOrDefaultAsync();
            if (orgLocation == null)
            {
                _organizationContext.orgnizationLocations.Add(orgnizationLocation);
                await _organizationContext.SaveChangesAsync();
                OrgnizationAccount orgnizationAccount = new OrgnizationAccount();
                orgnizationAccount.orgId = orgnizationLocation.orgId;
                orgnizationAccount.locationId = orgnizationLocation.Id;
                _organizationContext.orgnizationAccounts.Add(orgnizationAccount);
                await _organizationContext.SaveChangesAsync();
                _organizationContext.CreateihpoSequenceValue("vouchersequence_" + orgnizationAccount.Id + "_");
                _organizationContext.CreateihpoSequenceValue("countyrevenuesequence_" + orgnizationAccount.Id + "_");
                _organizationContext.CreateihpoSequenceValue("accountreceivablesequence_" + orgnizationAccount.Id + "_");
                _organizationContext.CreateihpoSequenceValue("ihposequence_" + orgnizationAccount.Id + "_");
                _organizationContext.CreateihpoSequenceValue("posequence_" + orgnizationAccount.Id + "_");
                IHCProgram program = new IHCProgram();
                IHCDepartment department = new IHCDepartment();
                IHCAccount account = new IHCAccount();
                IHCSubAccount subAccount = new IHCSubAccount();
                account.code = subAccount.code = "0000";
                program.code = department.code = "00";
                program.description = department.description = account.description = subAccount.description = "N/A";
                program.OrgAccountId = department.OrgAccountId = account.OrgAccountId = subAccount.OrgAccountId = orgnizationAccount.Id;
                program.revenueCheck = department.revenueCheck = account.revenueCheck = subAccount.revenueCheck = "Y";
                program.expenseCheck = department.expenseCheck = account.expenseCheck = subAccount.expenseCheck = "Y";
                program.salaryBenefits = department.salaryBenefits = account.salaryBenefits = subAccount.salaryBenefits = "Y";
                program.isActive = department.isActive = account.isActive = subAccount.isActive = "Y";
                program.startDate = department.startDate = account.startDate = subAccount.startDate = subAccount.startDate = DateTime.Now;
                _organizationContext.IHCPrograms.Add(program);
                _organizationContext.IHCDepartments.Add(department);
                _organizationContext.IHCAccounts.Add(account);
                _organizationContext.IHCSubAccounts.Add(subAccount);
                await _organizationContext.SaveChangesAsync();
                await AddSetting.AddSettingValues(_organizationContext, account.OrgAccountId);
                await AddIHPOWorkFlows.AddIHPOWorkFlow(_organizationContext, account.OrgAccountId);
                return Ok(orgnizationLocation);
            }
            else
            {
                return BadRequest("Organization Location Already Exist");
            }
        }
        [HttpPut]
        public async Task<ActionResult<Organization>> UpdateOrganization(int id, Organization organization)
        {
            if (id != organization.Id)
            {
                return BadRequest("Organization does not match with id");
            }
            var org = await _organizationContext.Organizations.FindAsync(id);
            if (org == null)
            {
                return BadRequest("Organization does not exist");
            }
            organization.createdBy = org.createdBy;
            organization.createdDate = org.createdDate;
            _organizationContext.Organizations.Entry(org).State = EntityState.Detached;
            _organizationContext.Organizations.Update(organization);
            await _organizationContext.SaveChangesAsync();
            return Ok(organization);
        }
        [HttpPut]
        [Route("OrganizationLocation")]
        public async Task<ActionResult<Organization>> UpdateOrganizationLocation(int id, OrgnizationLocation orgnizationLocation)
        {
            if (id != orgnizationLocation.Id)
            {
                return BadRequest("orgnizationLocation does not match with id");
            }
            var org = await _organizationContext.orgnizationLocations.FindAsync(id);
            if (org == null)
            {
                return BadRequest("orgnizationLocation does not exist");
            }
            orgnizationLocation.createdBy = org.createdBy;
            orgnizationLocation.createdDate = org.createdDate;
            _organizationContext.orgnizationLocations.Entry(org).State = EntityState.Detached;
            _organizationContext.orgnizationLocations.Update(orgnizationLocation);
            await _organizationContext.SaveChangesAsync();
            return Ok(orgnizationLocation);
        }
    }
}
