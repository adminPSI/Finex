using FinexAPI.Common;
using FinexAPI.Data;
using FinexAPI.Dtos;
using FinexAPI.Helper;
using FinexAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using System.Runtime.Intrinsics.X86;

namespace FinexAPI.Controllers
{

    [Authorize]
    public class IHACController : BaseController
    {
        private readonly FinexAppContext _context;


        public IHACController(IHttpContextAccessor httpContextAccessor, FinexAppContext context)
            : base(httpContextAccessor)
        {
            _context = context;
        }

        [Route("Filter")]
        [HttpPost]
        public async Task<ActionResult> Filter(int typeCode, bool desc, string sortKey = "modifiedDate", string? code = "", string? stateAccountCode = "", string? countyAccountCode = "",
            string? isActive = "", string? description = "", string? programCode = "", string? departmentCode = "", string? AccountCode = "",
            string? subAccountCode = "", string? search = "", DateTime? startDate = null, int skip = 0, int take = 0)
        {
            ListResultController<IHACCode> _cmnCntrlr = new ListResultController<IHACCode>();
            if (search == "")
            {
                var List = _context.IHACCodes.Include(x => x.IHACProgram).Include(x => x.IHACDepartment)
                    .Include(x => x.IHACAccount).Include(x => x.IHACSubAccount).Include(x => x.AccountingCode)
                    .Where(p => p.OrgAccountId == OrgAccountId &&
                p.ihacCode.Contains(string.IsNullOrEmpty(code) ? "" : code)
                && p.isActive.Contains(string.IsNullOrEmpty(isActive) ? "" : isActive)
                && (string.IsNullOrEmpty(description) || p.description.Contains(string.IsNullOrEmpty(description) ? "" : description))
                && (string.IsNullOrEmpty(stateAccountCode) || p.stateAccountingCode.Contains(string.IsNullOrEmpty(stateAccountCode) ? "" : stateAccountCode))
                && (string.IsNullOrEmpty(countyAccountCode) || p.AccountingCode.countyExpenseCode.Contains(string.IsNullOrEmpty(countyAccountCode) ? "" : countyAccountCode))
                && p.IHACProgram.code.Contains(string.IsNullOrEmpty(programCode) ? "" : programCode)
                && p.IHACDepartment.code.Contains(string.IsNullOrEmpty(departmentCode) ? "" : departmentCode)
                && p.IHACAccount.code.Contains(string.IsNullOrEmpty(AccountCode) ? "" : AccountCode)
                && p.IHACSubAccount.code.Contains(string.IsNullOrEmpty(subAccountCode) ? "" : subAccountCode)
                && (startDate == null || p.startDate.Date == startDate.Value.Date)
                && p.typeCode.Equals(typeCode)).OrderByCustom(sortKey, desc);
                return await _cmnCntrlr.returnResponse(take, skip, List, 0);
            }
            else
            {
                search = string.IsNullOrEmpty(search) ? "" : search;
                var List = _context.IHACCodes.Include(x => x.IHACProgram).Include(x => x.IHACDepartment)
                    .Include(x => x.IHACAccount).Include(x => x.IHACSubAccount).Include(x => x.AccountingCode)
                    .Where(p => p.OrgAccountId == OrgAccountId &&
                (p.ihacCode.Contains(search)
                || p.stateAccountingCode.Contains(search)
                || p.AccountingCode.countyExpenseCode.Contains(search)
                || p.IHACProgram.code.Contains(search)
                || p.IHACDepartment.code.Contains(search)
                || p.IHACAccount.code.Contains(search)
                || p.IHACSubAccount.code.Contains(search)
                || p.description.Contains(search))
                && p.isActive.Contains(string.IsNullOrEmpty(isActive) ? "" : isActive)
                && p.typeCode.Equals(typeCode)).OrderByCustom(sortKey, desc);
                return await _cmnCntrlr.returnResponse(take, skip, List, 0);
            }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<IHACCode>>> GetIHACCode()
        {
            return await _context.IHACCodes.Where(x => x.OrgAccountId == OrgAccountId).ToListAsync();
        }


        [HttpGet("{id}")]
        public async Task<ActionResult<IHACCode>> GetIHACCode(int id)
        {
            var iHAC = await _context.IHACCodes
                .FirstOrDefaultAsync(x =>  x.Id == id);

            if (iHAC == null)
            {
                return BadRequest("IHAC does not exist");
            }

            return iHAC;
        }

        [HttpGet("getCacSacByIhac/{ihacAccountingCode}")]
        public async Task<ActionResult<CacSacByIHacDto>> GetCacSacByIhac(string ihacAccountingCode)
        {
            ihacAccountingCode = ihacAccountingCode.Replace("-", "").Replace("_", "");
            var iHAC = await _context.IHACCodes.FirstOrDefaultAsync(x => x.ihacCode.Replace("-", "").Replace("_", "") == ihacAccountingCode);

            if (iHAC == null)
            {
                return null;
            }


            CacSacByIHacDto cacSacByIHacDto = new CacSacByIHacDto();
            cacSacByIHacDto.IHACCodeData = iHAC;

            var cac = await _context.AccountingCodes.FirstOrDefaultAsync(x => x.Id == iHAC.countyAccountingCode);

            if (!string.IsNullOrEmpty(iHAC.stateAccountingCode))
            {
                var sacCode = iHAC.stateAccountingCode.Replace("-", "").Replace("_", "");
                var sac = await _context.StateAccountCodeDetails.FirstOrDefaultAsync(x => x.stateAccountCode.Replace("-", "").Replace("_", "") == sacCode);
                cacSacByIHacDto.CACData = cac;
                cacSacByIHacDto.SACData = sac;
            }

            return cacSacByIHacDto;
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutIHACCode(int id, IHACCode iHAC)
        {
            if (id != iHAC.Id)
            {
                return BadRequest("IHAC does not match with id");
            }
            var ihacRef = await _context.IHACCodes.FirstOrDefaultAsync(x => x.OrgAccountId == OrgAccountId && x.Id == id);
            if (ihacRef == null)
            {
                return BadRequest("IHAC does not exist");
            }
            var accountingCode = await _context.AccountingCodes.FirstOrDefaultAsync(x => x.Id == iHAC.countyAccountingCode && x.OrgAccountId == OrgAccountId);
            if (accountingCode != null && iHAC.startDate.Date < accountingCode.startDate.Date)
            {
                return BadRequest("You can't add Future CAC");
            }
            string[] codes = iHAC.ihacCode.Split('_');
            if (iHAC.ihacCode.Contains("-"))
                codes = iHAC.ihacCode.Split('-');

            if (codes.Length > 3)
            {
                var progRef = await _context.IHCPrograms.Where(x => x.code == codes[0] && x.OrgAccountId == OrgAccountId).FirstOrDefaultAsync();
                if (progRef != null && iHAC.startDate.Date < progRef.startDate.Date)
                {
                    return BadRequest("You can't add Inactive program");
                }
                var departmentRef = await _context.IHCDepartments.Where(x => x.code == codes[1] && x.OrgAccountId == OrgAccountId).FirstOrDefaultAsync();
                if (departmentRef != null && iHAC.startDate.Date < departmentRef.startDate.Date)
                {
                    return BadRequest("You can't add Inactive Department");
                }
                var accountRef = await _context.IHCAccounts.Where(x => x.code == codes[2] && x.OrgAccountId == OrgAccountId).FirstOrDefaultAsync();
                if (accountRef != null && iHAC.startDate.Date < accountRef.startDate.Date)
                {
                    return BadRequest("You can't add Inactive Account");
                }
                var subAccountRef = await _context.IHCSubAccounts.Where(x => x.code == codes[3] && x.OrgAccountId == OrgAccountId).FirstOrDefaultAsync();
                if (subAccountRef != null && iHAC.startDate.Date < subAccountRef.startDate.Date)
                {
                    return BadRequest("You can't add Inactive SubAccount");
                }
            }
            iHAC.createdBy = ihacRef.createdBy;
            iHAC.createdDate = ihacRef.createdDate;
            if (iHAC.endDate.HasValue)
            {
                if (iHAC.endDate.Value.Date == DateTime.Today)
                {
                    iHAC.isActive = "N";
                }
                else
                {
                    iHAC.isActive = "Y";
                }
            }
            _context.IHACCodes.Entry(ihacRef).State = EntityState.Detached;
            _context.IHACCodes.Update(iHAC);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)

            {
                if (!IHACExists(id))
                {
                    return BadRequest("IHAC does not exist");
                }

                else
                {
                    throw;
                }
            }


            return CreatedAtAction("GetIHACCode", new { id = iHAC.Id }, iHAC);
        }


        [HttpPost]
        public async Task<ActionResult<IHACCode>> PostIHACCode(IHACCode iHAC)
        {
            var accountingCode = await _context.AccountingCodes.FirstOrDefaultAsync(x => x.Id == iHAC.countyAccountingCode && x.OrgAccountId == OrgAccountId);
            if (accountingCode != null && iHAC.startDate.Date < accountingCode.startDate.Date)
            {
                return BadRequest("You can't add Future CAC");
            }
            string[] codes = iHAC.ihacCode.Split('_');
            if (iHAC.ihacCode.Contains("-"))
                codes = iHAC.ihacCode.Split('-');

            if (codes.Length > 3)
            {
                var progRef = await _context.IHCPrograms.Where(x => x.code == codes[0] && x.OrgAccountId == OrgAccountId).FirstOrDefaultAsync();
                if (progRef != null && iHAC.startDate.Date < progRef.startDate.Date)
                {
                    return BadRequest("You can't add Inactive program");
                }
                var departmentRef = await _context.IHCDepartments.Where(x => x.code == codes[1] && x.OrgAccountId == OrgAccountId).FirstOrDefaultAsync();
                if (departmentRef != null && iHAC.startDate.Date < departmentRef.startDate.Date)
                {
                    return BadRequest("You can't add Inactive Department");
                }
                var accountRef = await _context.IHCAccounts.Where(x => x.code == codes[2] && x.OrgAccountId == OrgAccountId).FirstOrDefaultAsync();
                if (accountRef != null && iHAC.startDate.Date < accountRef.startDate.Date)
                {
                    return BadRequest("You can't add Inactive Account");
                }
                var subAccountRef = await _context.IHCSubAccounts.Where(x => x.code == codes[3] && x.OrgAccountId == OrgAccountId).FirstOrDefaultAsync();
                if (subAccountRef != null && iHAC.startDate.Date < subAccountRef.startDate.Date)
                {
                    return BadRequest("You can't add Inactive SubAccount");
                }
            }
            var ihacRec = await _context.IHACCodes.Where(x => x.ihacCode == iHAC.ihacCode && x.OrgAccountId == OrgAccountId && x.typeCode == iHAC.typeCode).FirstOrDefaultAsync();
            if (ihacRec == null)
            {
                iHAC.OrgAccountId = OrgAccountId;
                _context.IHACCodes.Add(iHAC);
                await _context.SaveChangesAsync();
                return CreatedAtAction("GetIHACCode", new { id = iHAC.Id }, iHAC);
            }
            else
            {
                return BadRequest("IHACCode already Exist");
            }
        }

        private bool IHACExists(int id)
        {
            return _context.IHACCodes.Any(e => e.Id == id && e.OrgAccountId == OrgAccountId);
        }

        [Route("/api/IHCDepartment")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<IHCDepartment>>> GetIHCDepartment(bool forIhpo = false)
        {
            if (forIhpo)
            {
                List<IHCDepartment> list = new List<IHCDepartment>();
                var selectedDepartments = await _context.securityProgDepts.Where(x => x.empId == MemberId).Select(x => x.selectedDepartments).FirstOrDefaultAsync();
                if (selectedDepartments == null)
                {
                    return list;
                }
                return await _context.IHCDepartments.Where(x => selectedDepartments.Contains(x.Id.ToString()) && x.OrgAccountId == OrgAccountId && x.isActive == "Y").OrderBy(x => x.code).ToListAsync();
            }
            else
            {
                return await _context.IHCDepartments.Where(x => x.OrgAccountId == OrgAccountId && x.isActive == "Y").OrderBy(x => x.code).ToListAsync();
            }
        }

        [Route("/api/IHCDepartment/{id}")]
        [HttpGet]
        public async Task<ActionResult<IHCDepartment>> GetIHCDepartment(int id)
        {
            var Department = await _context.IHCDepartments
                .FirstOrDefaultAsync(x => x.OrgAccountId == OrgAccountId && x.Id == id);

            if (Department == null)
            {
                return BadRequest("IHAC Department does not exist");
            }

            return Department;
        }

        [Route("/api/IHCDepartment")]
        [HttpPut]
        public async Task<IActionResult> PutIHCDepartment(int id, IHCDepartment Department)
        {
            if (id != Department.Id)
            {
                return BadRequest("IHAC Department does not match with id");
            }
            var departmentRef = await _context.IHCDepartments.FirstOrDefaultAsync(x => x.OrgAccountId == OrgAccountId && x.Id == id);
            if (departmentRef == null)
            {
                return BadRequest("IHAC Department does not exist");
            }
            if (departmentRef.code == "00")
            {
                return BadRequest("This Department Code cannot update");
            }
            Department.createdBy = departmentRef.createdBy;
            Department.createdDate = departmentRef.createdDate;
            Department.OrgAccountId = OrgAccountId;
            _context.IHCDepartments.Entry(departmentRef).State = EntityState.Detached;
            if (Department.endDate.HasValue)
            {
                if (Department.code == "00")
                {
                    return BadRequest("This Department code cannot inactivate");
                }
                else
                {
                    if (Department.endDate.Value.Date == DateTime.Today)
                    {
                        Department.isActive = "N";
                    }
                    else
                    {
                        Department.isActive = "Y";
                    }
                }
            }
            _context.IHCDepartments.Update(Department);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)

            {
                if (!IHCDepartmentExists(id))
                {
                    return BadRequest("IHAC Department does not exist");
                }

                else
                {
                    throw;
                }
            }


            return CreatedAtAction("GetIHCDepartment", new { id = Department.Id }, Department);
        }

        [Route("/api/IHCDepartment")]
        [HttpPost]
        public async Task<ActionResult<IHCDepartment>> PostDepartment(IHCDepartment department)
        {
            var departmentRec = await _context.IHCDepartments.Where(x => x.code == department.code && x.OrgAccountId == OrgAccountId).FirstOrDefaultAsync();
            if (departmentRec == null)
            {
                department.OrgAccountId = OrgAccountId;
                _context.IHCDepartments.Add(department);
                await _context.SaveChangesAsync();
                return CreatedAtAction("GetIHCDepartment", new { id = department.Id }, department);
            }
            else
            {
                return BadRequest("Department Code Already Exist");
            }
        }

        private bool IHCDepartmentExists(int id)
        {
            return _context.IHCDepartments.Any(e => e.Id == id && e.OrgAccountId == OrgAccountId);
        }

        [Route("/api/IHCProgram")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<IHCProgram>>> GetIHCProgram(bool forIhpo = false)
        {
            List<IHCProgram> list = new List<IHCProgram>();
            if (forIhpo)
            {
                var security = await _context.securityProgDepts.Where(x => x.empId == MemberId).Select(x => x.selectedPrograms).FirstOrDefaultAsync();
                if (security == null)
                {
                    return list;
                }
                return await _context.IHCPrograms.Where(x => security.Contains(x.Id.ToString()) && x.OrgAccountId == OrgAccountId && x.isActive == "Y").OrderBy(x => x.code).ToListAsync();
            }
            else
            {
                return await _context.IHCPrograms.Where(x => x.OrgAccountId == OrgAccountId && x.isActive == "Y").OrderBy(x => x.code).ToListAsync();
            }
        }

        [Route("/api/IHCProgram/{id}")]
        [HttpGet]
        public async Task<ActionResult<IHCProgram>> GetIHCProgram(int id)
        {
            var Program = await _context.IHCPrograms.FirstOrDefaultAsync(x => x.Id == id && x.OrgAccountId == OrgAccountId);

            if (Program == null)
            {
                return BadRequest("IHAC Program does not exist");
            }

            return Program;
        }

        [Route("/api/IHCProgram")]
        [HttpPut]
        public async Task<IActionResult> PutIHCProgram(int id, IHCProgram program)
        {
            if (id != program.Id)
            {
                return BadRequest("IHAC Program does not match with id");
            }
            var programRef = await _context.IHCPrograms.FirstOrDefaultAsync(x => x.OrgAccountId == OrgAccountId && x.Id == id);
            if (programRef == null)
            {
                return BadRequest("IHAC Program does not exist");
            }
            if (programRef.code == "00")
            {
                return BadRequest("This Program Code cannot Update");
            }
            program.createdBy = programRef.createdBy;
            program.createdDate = programRef.createdDate;
            program.OrgAccountId = OrgAccountId;
            _context.IHCPrograms.Entry(programRef).State = EntityState.Detached;
            if (program.endDate.HasValue)
            {
                if (program.code == "00")
                {
                    return BadRequest("This Program code cannot inactivate");
                }
                else
                {
                    if (program.endDate.Value.Date == DateTime.Today)
                    {
                        program.isActive = "N";
                    }
                    else
                    {
                        program.isActive = "Y";
                    }
                }
            }
            _context.IHCPrograms.Update(program);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)

            {
                if (!IHCProgramExists(id))
                {
                    return BadRequest("IHAC Program does not exist");
                }

                else
                {
                    throw;
                }
            }


            return CreatedAtAction("GetIHCProgram", new { id = program.Id }, program);
        }

        [Route("/api/IHCProgram")]
        [HttpPost]
        public async Task<ActionResult<IHCProgram>> PostIHCProgram(IHCProgram program)
        {
            var programRec = await _context.IHCPrograms.Where(x => x.code == program.code && x.OrgAccountId == OrgAccountId).FirstOrDefaultAsync();
            if (programRec == null)
            {
                program.OrgAccountId = OrgAccountId;
                _context.IHCPrograms.Add(program);
                await _context.SaveChangesAsync();
                return CreatedAtAction("GetIHCprogram", new { id = program.Id }, program);
            }
            else
            {
                return BadRequest("Program code Already Exist");
            }
        }

        private bool IHCProgramExists(int id)
        {
            return _context.IHCPrograms.Any(e => e.Id == id && e.OrgAccountId == OrgAccountId);
        }



        [Route("/api/IHCSubAccount")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<IHCSubAccount>>> GetIHCSubAccount()
        {
            return await _context.IHCSubAccounts.Where(x => x.OrgAccountId == OrgAccountId && x.isActive == "Y").OrderBy(x => x.code).ToListAsync();
        }

        [Route("/api/IHCSubAccount/{id}")]
        [HttpGet]
        public async Task<ActionResult<IHCSubAccount>> GetIHCSubAccount(int id)
        {
            var IHAC_SUB_ACCOUNT = await _context.IHCSubAccounts.FirstOrDefaultAsync(x => x.Id == id && x.OrgAccountId == OrgAccountId);

            if (IHAC_SUB_ACCOUNT == null)
            {
                return BadRequest("IHAC SubAccount does not exist");
            }

            return IHAC_SUB_ACCOUNT;
        }

        [Route("/api/IHCSubAccount")]
        [HttpPut]
        public async Task<ActionResult<IHCSubAccount>> PutIHCSubACCOUNT(int id, IHCSubAccount IHAC_SUB_ACCOUNT)
        {
            if (id != IHAC_SUB_ACCOUNT.Id)
            {
                return BadRequest("IHAC SubAccount does not match with id");
            }
            var subRef = await _context.IHCSubAccounts.FirstOrDefaultAsync(x => x.OrgAccountId == OrgAccountId && x.Id == id);
            if (subRef == null)
            {
                return BadRequest("IHAC SubAccount does not exist");
            }
            if (subRef.code == "0000")
            {
                return BadRequest("This SubAccount code cannot Update");
            }
            IHAC_SUB_ACCOUNT.createdBy = subRef.createdBy;
            IHAC_SUB_ACCOUNT.createdDate = subRef.createdDate;
            IHAC_SUB_ACCOUNT.OrgAccountId = OrgAccountId;
            _context.IHCSubAccounts.Entry(subRef).State = EntityState.Detached;
            if (IHAC_SUB_ACCOUNT.endDate.HasValue)
            {
                if (IHAC_SUB_ACCOUNT.code == "0000")
                {
                    return BadRequest("This SubAccount code cannot inactivate");
                }
                else
                {
                    if (IHAC_SUB_ACCOUNT.endDate.Value.Date == DateTime.Today)
                    {
                        IHAC_SUB_ACCOUNT.isActive = "N";
                    }
                    else
                    {
                        IHAC_SUB_ACCOUNT.isActive = "Y";
                    }
                }
            }
            _context.IHCSubAccounts.Update(IHAC_SUB_ACCOUNT);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)

            {
                if (!IHCSubAccountExists(id))
                {
                    return BadRequest("IHAC SubAccount does not exist");
                }

                else
                {
                    throw;
                }
            }
            return CreatedAtAction("GetIHCSubAccount", new { id = IHAC_SUB_ACCOUNT.Id }, IHAC_SUB_ACCOUNT);
        }

        [Route("/api/IHCSubAccount")]
        [HttpPost]
        public async Task<ActionResult<IHCSubAccount>> PostIHCSubAccount(IHCSubAccount IHAC_SUB_ACCOUNT)
        {
            var subAccountRec = await _context.IHCSubAccounts.Where(x => x.code == IHAC_SUB_ACCOUNT.code && x.OrgAccountId == OrgAccountId).FirstOrDefaultAsync();
            if (subAccountRec == null)
            {
                IHAC_SUB_ACCOUNT.OrgAccountId = OrgAccountId;
                _context.IHCSubAccounts.Add(IHAC_SUB_ACCOUNT);
                await _context.SaveChangesAsync();
                return CreatedAtAction("GetIHCSubAccount", new { id = IHAC_SUB_ACCOUNT.Id }, IHAC_SUB_ACCOUNT);
            }
            else
            {
                return BadRequest("SubAccount Code Already Exist");
            }
        }

        private bool IHCSubAccountExists(int id)
        {
            return _context.IHCSubAccounts.Any(e => e.Id == id && e.OrgAccountId == OrgAccountId);
        }

        [Route("/api/IHCAccount")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<IHCAccount>>> GetIHCAccount()
        {
            return await _context.IHCAccounts.Where(x => x.OrgAccountId == OrgAccountId && x.isActive == "Y").OrderBy(x => x.code).ToListAsync();
        }

        [Route("/api/IHCAccount/{id}")]
        [HttpGet]
        public async Task<ActionResult<IHCAccount>> GetIHCAccount(int id)
        {
            var IHAC_ACCOUNT = await _context.IHCAccounts.FirstOrDefaultAsync(x => x.Id == id && x.OrgAccountId == OrgAccountId);

            if (IHAC_ACCOUNT == null)
            {
                return BadRequest("IHAC Account does not exist");
            }

            return IHAC_ACCOUNT;
        }

        [Route("/api/IHCAccount")]
        [HttpPut]
        public async Task<ActionResult<IHCAccount>> PutIHCAccount(int id, IHCAccount iHCAccount)
        {
            if (id != iHCAccount.Id)
            {
                return BadRequest("IHAC Account does not match with id");
            }
            var accountRef = await _context.IHCAccounts.FirstOrDefaultAsync(x => x.OrgAccountId == OrgAccountId && x.Id == id);
            if (accountRef == null)
            {
                return BadRequest("IHAC Account does not exist");
            }
            if (accountRef.code == "0000")
            {
                return BadRequest("This IHAC Account Code cannot update");
            }
            iHCAccount.createdBy = accountRef.createdBy;
            iHCAccount.createdDate = accountRef.createdDate;
            iHCAccount.OrgAccountId = OrgAccountId;
            _context.IHCAccounts.Entry(accountRef).State = EntityState.Detached;
            if (iHCAccount.endDate.HasValue)
            {
                if (iHCAccount.code == "0000")
                {
                    return BadRequest("This Account code cannot inactivate");
                }
                else
                {
                    if (iHCAccount.endDate.Value.Date <= DateTime.Today)
                    {
                        iHCAccount.isActive = "N";
                    }
                    else
                    {
                        iHCAccount.isActive = "Y";
                    }
                }
            }
            _context.IHCAccounts.Update(iHCAccount);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)

            {
                if (!IHCAccountExists(id))
                {
                    return BadRequest("IHAC Program does not exist");
                }

                else
                {
                    throw;
                }
            }
            return CreatedAtAction("GetIHCSubAccount", new { id = iHCAccount.Id }, iHCAccount);
        }

        [Route("/api/IHCAccount")]
        [HttpPost]
        public async Task<ActionResult<IHCAccount>> PostIHCAccount(IHCAccount IHAC_ACCOUNT)
        {
            var accountRec = await _context.IHCAccounts.Where(x => x.code == IHAC_ACCOUNT.code && x.OrgAccountId == OrgAccountId).FirstOrDefaultAsync();
            if (accountRec == null)
            {
                IHAC_ACCOUNT.OrgAccountId = OrgAccountId;
                _context.IHCAccounts.Add(IHAC_ACCOUNT);
                await _context.SaveChangesAsync();
                return CreatedAtAction("GetIHCAccount", new { id = IHAC_ACCOUNT.Id }, IHAC_ACCOUNT);
            }
            else
            {
                return BadRequest("Account code Already Exist");
            }
        }

        private bool IHCAccountExists(int id)
        {
            return _context.IHCSubAccounts.Any(e => e.Id == id && e.OrgAccountId == OrgAccountId);
        }

        [Route("/api/IHACExpenseAmount")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<IHACExpenseAmount>>> GetIHACExpenseAmounts(int ihacCodeId)
        {
            try
            {
                return await _context.IHACExpenseAmounts.Where(p => p.ihacCodeId.Equals(ihacCodeId)).OrderByDescending(x => x.startDate).ThenByDescending(x => x.modifiedDate).ToListAsync();
            }catch (Exception ex)
            {
                throw;
            }
        }

        [Route("IHACExpenseAmount/{id}")]
        [HttpGet]
        public async Task<ActionResult<IHACExpenseAmount>> GetIHACExpenseAmount(int id)
        {
            var amount = await _context.IHACExpenseAmounts.FindAsync(id);
            if (amount == null)
            {
                return BadRequest("IHACExpenseAmount does not exist");
            }
            return Ok(amount);
        }

        [Route("/api/IHACExpenseAmount")]
        [HttpPost]
        public async Task<ActionResult<IHACExpenseAmount>> PostIHACExpenseAmount(IHACExpenseAmount IHAC_EXPENSE_AMOUNT)
        {
            IHAC_EXPENSE_AMOUNT.OrgAccountId = OrgAccountId;
            //if (IHAC_EXPENSE_AMOUNT.amount < 0)
            //{
            //    return BadRequest("Negative value does notallow");
            //}


            if (IHAC_EXPENSE_AMOUNT.ihacCodeId > 0)
            {
                var _ihac = await _context.IHACCodes.FindAsync(IHAC_EXPENSE_AMOUNT.ihacCodeId);
                if (_ihac != null)
                {
                    int actdaydiff = IHAC_EXPENSE_AMOUNT.startDate.Date.CompareTo(_ihac.startDate.Date);
                    int inactdaydiff = IHAC_EXPENSE_AMOUNT.startDate.Date.CompareTo(_ihac.endDate != null ? _ihac.endDate.Value.Date : Constants._DefaultEndDateTime.Date);
                    if (actdaydiff < 0 || inactdaydiff > 0)
                    {
                        return BadRequest("Your IHAC should be active for Cash balance date!");
                    }
                }
            }

            _context.IHACExpenseAmounts.Add(IHAC_EXPENSE_AMOUNT);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetIHACExpenseAmount", new { id = IHAC_EXPENSE_AMOUNT.Id }, IHAC_EXPENSE_AMOUNT);
        }

        [Route("/api/IHACExpenseAmount/{id}")]
        [HttpPut]
        public async Task<ActionResult<IHACExpenseAmount>> PutIHACExpenseAmount(int id, IHACExpenseAmount IHAC_EXPENSE_AMOUNT)
        {
            if (IHAC_EXPENSE_AMOUNT.amount < 0)
            {
                return BadRequest("Negative value does notallow");
            }
            if (id != IHAC_EXPENSE_AMOUNT.Id)
            {
                return BadRequest("IHACExpenseAmount does not match with id");
            }


            if (IHAC_EXPENSE_AMOUNT.ihacCodeId > 0)
            {
                var _ihac = await _context.IHACCodes.FindAsync(IHAC_EXPENSE_AMOUNT.ihacCodeId);
                if (_ihac != null)
                {
                    int actdaydiff = IHAC_EXPENSE_AMOUNT.startDate.Date.CompareTo(_ihac.startDate.Date);
                    int inactdaydiff = IHAC_EXPENSE_AMOUNT.startDate.Date.CompareTo(_ihac.endDate != null ? _ihac.endDate.Value.Date : Constants._DefaultEndDateTime.Date);
                    if (actdaydiff < 0 || inactdaydiff > 0)
                    {
                        return BadRequest("Your IHAC should be active for Cash balance date!");
                    }
                }
            }


            var expenseAmount = await _context.IHACExpenseAmounts.FindAsync(id);
            if (expenseAmount == null)
            {
                return BadRequest("IHACExpenseAmount does not exist");
            }
            IHAC_EXPENSE_AMOUNT.createdBy = expenseAmount.createdBy;
            IHAC_EXPENSE_AMOUNT.createdDate = expenseAmount.createdDate;
            _context.IHACExpenseAmounts.Entry(expenseAmount).State = EntityState.Detached;
            _context.IHACExpenseAmounts.Update(IHAC_EXPENSE_AMOUNT);
            await _context.SaveChangesAsync();
            return CreatedAtAction("GetIHACExpenseAmount", new { id = IHAC_EXPENSE_AMOUNT.Id }, IHAC_EXPENSE_AMOUNT);
        }

        [Route("IHACExpenseAmount/{id}")]
        [HttpDelete]
        public async Task<ActionResult<string>> DeleteIHACExpenseAmount(int id)
        {
            var amount = await _context.IHACExpenseAmounts.FindAsync(id);
            if (amount == null)
            {
                return BadRequest("IHACExpenseAmount does not exist");
            }
            _context.IHACExpenseAmounts.Remove(amount);
            await _context.SaveChangesAsync();
            return Ok("Deleted Successfully");
        }

        [Route("IHCProgramFilter")]
        [HttpPost]
        public async Task<ActionResult> getIHCProgramFilter(bool desc, string sortKey = "modifiedDate", string? description = "", DateTime? startDate = null, string? code = "", string? salaryBenefit = "", string? isActive = "", string? revenueCheck = "", string? expenseCheck = "", string? search = "", int skip = 0, int take = 0)
        {
            ListResultController<IHCProgram> _cmnCntrlr = new ListResultController<IHCProgram>();
            if (search == "")
            {

                //List<IHCProgram> list = new List<IHCProgram>();
                if (startDate == null)
                {
                    var list = _context.IHCPrograms.Where(p => p.OrgAccountId == OrgAccountId &&
                    p.description.Contains(string.IsNullOrEmpty(description) ? "" : description)
                    && p.revenueCheck.Contains(string.IsNullOrEmpty(revenueCheck) ? "" : revenueCheck)
                    && p.expenseCheck.Contains(string.IsNullOrEmpty(expenseCheck) ? "" : expenseCheck)
                    && p.isActive.Contains(string.IsNullOrEmpty(isActive) ? "" : isActive)
                    && p.code.Contains(string.IsNullOrEmpty(code) ? "" : code)
                    && p.salaryBenefits.Contains(string.IsNullOrEmpty(salaryBenefit) ? "" : salaryBenefit)
                    ).OrderByCustom(sortKey, desc);

                    return await _cmnCntrlr.returnResponse(take, skip, list, 0);
                }
                else
                {
                    DateTime dateTime = (DateTime)startDate;
                    var list = _context.IHCPrograms.Where(p => p.OrgAccountId == OrgAccountId &&
                   p.description.Contains(string.IsNullOrEmpty(description) ? "" : description)
                   && p.revenueCheck.Contains(string.IsNullOrEmpty(revenueCheck) ? "" : revenueCheck)
                   && p.expenseCheck.Contains(string.IsNullOrEmpty(expenseCheck) ? "" : expenseCheck)
                   && p.isActive.Contains(string.IsNullOrEmpty(isActive) ? "" : isActive)
                   && p.code.Contains(string.IsNullOrEmpty(code) ? "" : code)
                   && p.salaryBenefits.Contains(string.IsNullOrEmpty(salaryBenefit) ? "" : salaryBenefit)
                   && p.startDate.Year == dateTime.Year
                   && p.startDate.Month == dateTime.Month
                   && p.startDate.Day == dateTime.Day
                   ).OrderByCustom(sortKey, desc);

                    return await _cmnCntrlr.returnResponse(take, skip, list, 0);
                }

            }
            else
            {
                search = string.IsNullOrEmpty(search) ? "" : search;
                var list = _context.IHCPrograms.Where(p => p.OrgAccountId == OrgAccountId &&
                     p.isActive.Contains(string.IsNullOrEmpty(isActive) ? "" : isActive) &&
                 (p.description.Contains(search)
                    || p.revenueCheck.Contains(search)
                    || p.expenseCheck.Contains(search)
                    || p.code.Contains(search)
                    || p.salaryBenefits.Contains(search))
                    ).OrderByCustom(sortKey, desc);

                return await _cmnCntrlr.returnResponse(take, skip, list, 0);
            }
        }

        [Route("IHCDepartmentFilter")]
        [HttpPost]
        public async Task<ActionResult> IHCDepartmentFilter(bool desc, string sortKey = "modifiedDate", string? description = "", string? code = "", DateTime? startDate = null, string? salaryBenefit = "", string? isActive = "", string? revenueCheck = "", string? expenseCheck = "", string? search = "", int skip = 0, int take = 0)
        {
            ListResultController<IHCDepartment> _cmnCntrlr = new ListResultController<IHCDepartment>();
            if (search == "")
            {
                if (startDate == null)
                {
                    var list = _context.IHCDepartments.Where(p => p.OrgAccountId == OrgAccountId &&
                    p.description.Contains(string.IsNullOrEmpty(description) ? "" : description)
                    && p.revenueCheck.Contains(string.IsNullOrEmpty(revenueCheck) ? "" : revenueCheck)
                    && p.expenseCheck.Contains(string.IsNullOrEmpty(expenseCheck) ? "" : expenseCheck)
                    && p.isActive.Contains(string.IsNullOrEmpty(isActive) ? "" : isActive)
                    && p.code.Contains(string.IsNullOrEmpty(code) ? "" : code)
                    && p.salaryBenefits.Contains(string.IsNullOrEmpty(salaryBenefit) ? "" : salaryBenefit)
                    ).OrderByCustom(sortKey, desc);

                    return await _cmnCntrlr.returnResponse(take, skip, list, 0);
                }
                else
                {
                    DateTime dateTime = (DateTime)startDate;
                    var list = _context.IHCDepartments.Where(p => p.OrgAccountId == OrgAccountId &&
                   p.description.Contains(string.IsNullOrEmpty(description) ? "" : description)
                   && p.revenueCheck.Contains(string.IsNullOrEmpty(revenueCheck) ? "" : revenueCheck)
                   && p.expenseCheck.Contains(string.IsNullOrEmpty(expenseCheck) ? "" : expenseCheck)
                   && p.isActive.Contains(string.IsNullOrEmpty(isActive) ? "" : isActive)
                   && p.code.Contains(string.IsNullOrEmpty(code) ? "" : code)
                   && p.salaryBenefits.Contains(string.IsNullOrEmpty(salaryBenefit) ? "" : salaryBenefit)
                   && p.startDate.Year == dateTime.Year
                   && p.startDate.Month == dateTime.Month
                   && p.startDate.Day == dateTime.Day
                   ).OrderByCustom(sortKey, desc);

                    return await _cmnCntrlr.returnResponse(take, skip, list, 0);
                }

            }
            else
            {
                search = string.IsNullOrEmpty(search) ? "" : search;
                var list = _context.IHCDepartments.Where(p => p.OrgAccountId == OrgAccountId &&
                    p.isActive.Contains(string.IsNullOrEmpty(isActive) ? "" : isActive) &&
                 (p.description.Contains(search)
                    || p.revenueCheck.Contains(search)
                    || p.expenseCheck.Contains(search)
                    || p.code.Contains(search)
                    || p.salaryBenefits.Contains(search))
                    ).OrderByCustom(sortKey, desc);

                return await _cmnCntrlr.returnResponse(take, skip, list, 0);
            }
        }
        [Route("IHCAccountFilter")]
        [HttpPost]
        public async Task<ActionResult> IHCAccountFilter(bool desc, string sortKey = "modifiedDate", string? description = "", string? code = "", DateTime? startDate = null, string? salaryBenefit = "", string? isActive = "", string? revenueCheck = "", string? expenseCheck = "", string? search = "", int skip = 0, int take = 0)
        {
            ListResultController<IHCAccount> _cmnCntrlr = new ListResultController<IHCAccount>();
            if (search == "")
            {
                //List<IHCAccount> list = new List<IHCAccount>();
                if (startDate == null)
                {
                    var list = _context.IHCAccounts.Where(p => p.OrgAccountId == OrgAccountId &&
                    p.description.Contains(string.IsNullOrEmpty(description) ? "" : description)
                    && p.revenueCheck.Contains(string.IsNullOrEmpty(revenueCheck) ? "" : revenueCheck)
                    && p.expenseCheck.Contains(string.IsNullOrEmpty(expenseCheck) ? "" : expenseCheck)
                    && p.isActive.Contains(string.IsNullOrEmpty(isActive) ? "" : isActive)
                    && p.code.Contains(string.IsNullOrEmpty(code) ? "" : code)
                    && p.salaryBenefits.Contains(string.IsNullOrEmpty(salaryBenefit) ? "" : salaryBenefit)
                    ).OrderByCustom(sortKey, desc);

                    return await _cmnCntrlr.returnResponse(take, skip, list, 0);
                }
                else
                {
                    DateTime dateTime = (DateTime)startDate;
                    var list = _context.IHCAccounts.Where(p => p.OrgAccountId == OrgAccountId &&
                   p.description.Contains(string.IsNullOrEmpty(description) ? "" : description)
                   && p.revenueCheck.Contains(string.IsNullOrEmpty(revenueCheck) ? "" : revenueCheck)
                   && p.expenseCheck.Contains(string.IsNullOrEmpty(expenseCheck) ? "" : expenseCheck)
                   && p.isActive.Contains(string.IsNullOrEmpty(isActive) ? "" : isActive)
                   && p.code.Contains(string.IsNullOrEmpty(code) ? "" : code)
                   && p.salaryBenefits.Contains(string.IsNullOrEmpty(salaryBenefit) ? "" : salaryBenefit)
                   && p.startDate.Year == dateTime.Year
                   && p.startDate.Month == dateTime.Month
                   && p.startDate.Day == dateTime.Day
                   ).OrderByCustom(sortKey, desc);

                    return await _cmnCntrlr.returnResponse(take, skip, list, 0);
                }

            }
            else
            {
                search = string.IsNullOrEmpty(search) ? "" : search;
                var list = _context.IHCAccounts.Where(p => p.OrgAccountId == OrgAccountId &&
                     p.isActive.Contains(string.IsNullOrEmpty(isActive) ? "" : isActive) &&
                 (p.description.Contains(search)
                    || p.revenueCheck.Contains(search)
                    || p.expenseCheck.Contains(search)
                    || p.code.Contains(search)
                    || p.salaryBenefits.Contains(search))
                    ).OrderByCustom(sortKey, desc);
                return await _cmnCntrlr.returnResponse(take, skip, list, 0);
            }
        }
        [Route("IHCSubAccountFilter")]
        [HttpPost]
        public async Task<ActionResult> IHCSubAccountFilter(bool desc, string sortKey = "modifiedDate", string? description = "", string? code = "", DateTime? startDate = null, string? salaryBenefit = "", string? isActive = "", string? revenueCheck = "", string? expenseCheck = "", string? search = "", int skip = 0, int take = 0)
        {
            ListResultController<IHCSubAccount> _cmnCntrlr = new ListResultController<IHCSubAccount>();
            if (search == "")
            {
                //List<IHCSubAccount> list = new List<IHCSubAccount>();
                if (startDate == null)
                {
                    var list = _context.IHCSubAccounts.Where(p => p.OrgAccountId == OrgAccountId &&
                    p.description.Contains(string.IsNullOrEmpty(description) ? "" : description)
                    && p.revenueCheck.Contains(string.IsNullOrEmpty(revenueCheck) ? "" : revenueCheck)
                    && p.expenseCheck.Contains(string.IsNullOrEmpty(expenseCheck) ? "" : expenseCheck)
                    && p.isActive.Contains(string.IsNullOrEmpty(isActive) ? "" : isActive)
                    && p.code.Contains(string.IsNullOrEmpty(code) ? "" : code)
                    && p.salaryBenefits.Contains(string.IsNullOrEmpty(salaryBenefit) ? "" : salaryBenefit)
                    ).OrderByCustom(sortKey, desc);

                    return await _cmnCntrlr.returnResponse(take, skip, list, 0);
                }
                else
                {
                    DateTime dateTime = (DateTime)startDate;
                    var list = _context.IHCSubAccounts.Where(p => p.OrgAccountId == OrgAccountId &&
                   p.description.Contains(string.IsNullOrEmpty(description) ? "" : description)
                   && p.revenueCheck.Contains(string.IsNullOrEmpty(revenueCheck) ? "" : revenueCheck)
                   && p.expenseCheck.Contains(string.IsNullOrEmpty(expenseCheck) ? "" : expenseCheck)
                   && p.code.Contains(string.IsNullOrEmpty(code) ? "" : code)
                   && p.salaryBenefits.Contains(string.IsNullOrEmpty(salaryBenefit) ? "" : salaryBenefit)
                   && p.startDate.Year == dateTime.Year
                   && p.startDate.Month == dateTime.Month
                   && p.startDate.Day == dateTime.Day
                   ).OrderByCustom(sortKey, desc);

                    return await _cmnCntrlr.returnResponse(take, skip, list, 0);
                }

            }
            else
            {
                search=string.IsNullOrEmpty(search) ? "" : search;
                var list = _context.IHCSubAccounts.Where(p => p.OrgAccountId == OrgAccountId &&
                    p.isActive.Contains(string.IsNullOrEmpty(isActive) ? "" : isActive) &&
                 (p.description.Contains(search)
                    || p.revenueCheck.Contains(search)
                    || p.expenseCheck.Contains(search)
                    || p.isActive.Contains(search)
                    || p.code.Contains(search)
                    || p.salaryBenefits.Contains(search))
                    ).OrderByCustom(sortKey, desc);
                return await _cmnCntrlr.returnResponse(take, skip, list, 0);
            }
        }

        [Route("GetIHACBalance/{ihaccode}")]
        [HttpGet]
        public async Task<ActionResult<decimal>> GetIHACBalance(string ihaccode, int typeCode)
        {
            if(ihaccode==null)
                ihaccode = string.Empty;

            ihaccode = ihaccode.Replace("-", "").Replace("_", "");
            var ihac = await _context.IHACCodes.Where(x => x.ihacCode.Replace("-","").Replace("_","") == ihaccode && x.typeCode == typeCode).FirstOrDefaultAsync();
            if (ihac != null)
            {
                decimal ihacAmount = await _context.IHACExpenseAmounts.Where(x => x.ihacCodeId == ihac.Id).SumAsync(x => x.amount);
                decimal voucherAmount = (decimal)await _context.VoucherBreakDowns.Where(x => x.voucherIHAC.Replace("-", "").Replace("_", "") == ihac.ihacCode.Replace("-", "").Replace("_", "")).SumAsync(x => x.voucherAmount);
                decimal ihpoAmount = (decimal)await _context.IHPOLineItem.Where(x => x.reqIHAC.Replace("-", "").Replace("_", "") == ihac.ihacCode.Replace("-", "").Replace("_", "")).SumAsync(x => x.balance);
                return ihacAmount - (voucherAmount + ihpoAmount);
            }
            else
            {
                return BadRequest("IHAC does not Exist");
            }

        }

        //Calculate IHAC Carryover Amounts
        [Route("CalculateCarryoverAmounts")]
        [HttpPost]
        public async Task<string> CalculateCarryoverAmounts()
        {
            return "";
        }

        // ReCalculate Carryover Adjustment
        [Route("ReCalculateCarryoverAdjustment")]
        [HttpPost]
        public async Task<string> ReCalculateCarryoverAdjustment()
        {
            return "";
        }

        [Route("AddProgDeptForEmployee")]
        [HttpPost]
        public async Task<ActionResult<SecurityProgDept>> AddProgDeptForEmployee(List<int> ids, int empId, string type)
        {
            if (ids.Count == 0 && type == null)
            {
                return BadRequest("No data(ids,type) in request");
            }
            string security = string.Join(",", ids);
            var progDept = await _context.securityProgDepts.Where(x => x.empId == empId).FirstOrDefaultAsync();
            if (progDept == null)
            {
                SecurityProgDept securityProgDept = new SecurityProgDept();
                securityProgDept.empId = empId;
                securityProgDept.OrgAccountId = OrgAccountId;
                if (type == "Program")
                {
                    securityProgDept.selectedPrograms = security;
                }
                if (type == "Department")
                {
                    securityProgDept.selectedDepartments = security;
                }
                _context.securityProgDepts.Add(securityProgDept);
            }
            else
            {

                if (type == "Program")
                {
                    progDept.selectedPrograms = security;
                }
                if (type == "Department")
                {
                    progDept.selectedDepartments = security;
                }
                _context.securityProgDepts.Update(progDept);
            }
            await _context.SaveChangesAsync();
            return Ok();
        }

        [Route("GetProgDeptForEmployee")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable>> GetProgDeptForEmployee(int empId, string type)
        {
            if (type == "Program")
            {
                List<IHCProgram> list = new List<IHCProgram>();
                var security = await _context.securityProgDepts.Where(x => x.empId == empId).Select(x => x.selectedPrograms).FirstOrDefaultAsync();
                if (security == null)
                {
                    return list;
                }
                return await _context.IHCPrograms.Where(x => security.Contains(x.Id.ToString()) && x.OrgAccountId == OrgAccountId && x.isActive == "Y").OrderBy(x => x.code).ToListAsync();
            }
            if (type == "Department")
            {
                List<IHCDepartment> list = new List<IHCDepartment>();
                var selectedDepartments = await _context.securityProgDepts.Where(x => x.empId == empId).Select(x => x.selectedDepartments).FirstOrDefaultAsync();
                if (selectedDepartments == null)
                {
                    return list;
                }
                return await _context.IHCDepartments.Where(x => selectedDepartments.Contains(x.Id.ToString()) && x.OrgAccountId == OrgAccountId && x.isActive == "Y").OrderBy(x => x.code).ToListAsync();
            }
            return new List<IHCDepartment>();
        }
    }
}