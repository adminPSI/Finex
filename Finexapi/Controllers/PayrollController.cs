using FinexAPI.Common;
using FinexAPI.Data;
using FinexAPI.Dtos;
using FinexAPI.Helper;
using FinexAPI.Models;
using FinexAPI.Models.Payroll;
using FinexAPI.Models.PayrollEmployee;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using System.Linq;
using System.Text.RegularExpressions;

namespace FinexAPI.Controllers
{
    [ApiController]
    [Route("api/[Controller]")]
    [Authorize]
    public class PayrollController : BaseController
    {
        private readonly FinexAppContext _payrollContext;

        public PayrollController(IHttpContextAccessor httpContextAccessor, FinexAppContext payrollContext) : base(httpContextAccessor)
        {
            _payrollContext = payrollContext;
        }

        /*ATTENDANCES*/
        //Get all Attendances
        [Route("Attendance")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Attendance>>> GetAllAttendances()
        {
            try
            {
                return await _payrollContext.Attendances.Where(x => x.OrgAccountId == OrgAccountId).ToListAsync();
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        //Get Attendances By Attendance Id
        [Route("Attendance/{id}")]
        [HttpGet]
        public async Task<ActionResult<Attendance>> GetAttendanceById(int id)
        {
            var attendance = await _payrollContext.Attendances.FindAsync(id);
            if (attendance == null)
            {
                return BadRequest("Attendance does not exist");
            }
            return Ok(attendance);
        }

        //Get Attendances By Employee Id
        [Route("AttendanceByEmployeeId/{empId}")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Attendance>>> GetAttendanceByEmployeeId(int empId)
        {
            var attendance = await _payrollContext.Attendances.Where(x => x.employeeId == empId && x.OrgAccountId == OrgAccountId).ToArrayAsync();
            if (attendance == null)
            {
                return BadRequest("Attendance does not exist");
            }
            return Ok(attendance);
        }

        //Add new Attendance
        [Route("Attendance")]
        [HttpPost]
        public async Task<ActionResult<Attendance>> AddAttendance(Attendance attendance)
        {
            if (attendance == null)
            {
                return BadRequest("Attendance does not exist");
            }
            //attendance.OrgAccountId = OrgAccountId;
            await _payrollContext.Attendances.AddAsync(attendance);
            await _payrollContext.SaveChangesAsync();
            //return Ok();
            return CreatedAtAction("GetAttendanceById", new { id = attendance.Id }, attendance);
        }

        //UpdateAttendance
        [Route("Attendance/{id}")]
        [HttpPut]
        public async Task<IActionResult> UpdateAttendance(int id, Attendance attendance)
        {
            if (id != attendance.Id)
            {
                return BadRequest("Attendance does not match with id");
            }
            //attendance.OrgAccountId = OrgAccountId;
            _payrollContext.Attendances.Update(attendance);

            try
            {
                await _payrollContext.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)

            {
                if (!AttendanceExists(id))
                {
                    return BadRequest("Attendance does not exist");
                }

                else
                {
                    throw;
                }
            }
            //  return Ok();
            return CreatedAtAction("GetAttendanceById", new { id = attendance.Id }, attendance);

        }
        private bool AttendanceExists(int id)
        {
            return _payrollContext.Attendances.Any(e => e.Id == id);
        }
        //Delete Attendance
        [Route("Attendance/{id}")]
        [HttpDelete]
        public async Task<ActionResult<Attendance>> DeleteAttendance(int id)
        {
            var attendance = await _payrollContext.Attendances.FindAsync(id);
            if (attendance == null)
            {
                return BadRequest("Attendance does not exists");
            }
            _payrollContext.Attendances.Remove(attendance);
            await _payrollContext.SaveChangesAsync();
            return attendance;
        }


        /* PAYROLL TOTALS */
        //Get All Payroll Totals
        [Route("PayrollTotals")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PayrollTotals>>> GetAllPayrollTotals(DateTime datePaid)
        {
            try
            {
                return await _payrollContext.PayrollTotals.Where(x =>
                x.OrgAccountId == OrgAccountId
                && x.prDatePaid.Value.Date == datePaid.Date).ToListAsync();
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        //Get Payroll Totals By  Id
        [Route("PayrollTotals/{id}")]
        [HttpGet]
        public async Task<ActionResult<Attendance>> GetPayrollTotalsById(int id)
        {
            var totals = await _payrollContext.PayrollTotals.FindAsync(id);
            if (totals == null)
            {
                return BadRequest("Attendance does not exist");
            }
            return Ok(totals);
        }


        //Add new Payroll Totals
        [Route("PayrollTotals")]
        [HttpPost]
        public async Task<ActionResult<PayrollTotals>> AddPAyrollTotals(PayrollTotals totals)
        {
            if (totals == null)
            {
                return BadRequest();
            }
            totals.OrgAccountId = OrgAccountId;
            await _payrollContext.PayrollTotals.AddAsync(totals);
            await _payrollContext.SaveChangesAsync();
            //return Ok();
            return CreatedAtAction("GetPayrollTotalsById", new { id = totals.Id }, totals);
        }

        //Update Payroll Totals
        [Route("PayrollTotals/{id}")]
        [HttpPut]
        public async Task<IActionResult> UpdatePayrollTotals(int id, PayrollTotals totals)
        {
            if (id != totals.Id)
            {
                return BadRequest("PayrollTotals does not match with id");
            }
            totals.OrgAccountId = OrgAccountId;
            _payrollContext.PayrollTotals.Update(totals);

            try
            {
                await _payrollContext.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)

            {
                if (!PayrollTotalsExists(id))
                {
                    return BadRequest("PayrollTotals does not exist");
                }

                else
                {
                    throw;
                }
            }
            //  return Ok();
            return CreatedAtAction("GetPayrollTotalsById", new { id = totals.Id }, totals);

        }
        private bool PayrollTotalsExists(int id)
        {
            return _payrollContext.PayrollTotals.Any(e => e.Id == id);
        }


        //Delete Payroll Totals
        [Route("PayrollTotals/{id}")]
        [HttpDelete]
        public async Task<ActionResult<PayrollTotals>> DeletePayrollTotals(int id)
        {
            var totals = await _payrollContext.PayrollTotals.FindAsync(id);
            if (totals == null)
            {
                return BadRequest("PayrollTotals does not exist");
            }

            var distributions = await _payrollContext.payrollTotalDistributions.Where(x => x.payDistId == id).ToListAsync();
            var benefitDistributions = await _payrollContext.payrollTotalBenefitDistributions.Where(x => x.payDistId == id).ToListAsync();

            _payrollContext.payrollTotalBenefitDistributions.RemoveRange(benefitDistributions);
            _payrollContext.payrollTotalDistributions.RemoveRange(distributions);
            _payrollContext.PayrollTotals.Remove(totals);
            
            await _payrollContext.SaveChangesAsync();
            return totals;
        }

        [Route("PREmployeeList")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Employee>>> GetPREmployeeList(DateTime datePaid, bool desc=false, string sortKey = "lastName", string? groupNumber = "", string? employeeNumber = "", string? employeeName = "", string? total = "", string? createdDateFilter = "", string? createdByFilter = "", string? modifyDateFilter = "", string? modifyByFilter = "", string? search = "", int skip = 0, int take = 10)
        {

            var isValidTotal = int.TryParse(total, out var totalVal);
            List<Employee> employees = new List<Employee>();
            try
            {
                var payrollTodatls = await _payrollContext.PayrollTotals.Where(x => x.OrgAccountId == OrgAccountId && x.prDatePaid.Value.Date == datePaid.Date).ToListAsync();
                if (payrollTodatls != null && payrollTodatls.Count > 0)
                {
                    if (!string.IsNullOrEmpty(createdDateFilter))
                    {
                        DateTime formatDate;
                        if (DateTime.TryParse(createdDateFilter, out formatDate))
                        {
                            payrollTodatls = payrollTodatls.Where(x => x.createdDate.HasValue && x.createdDate.Value.Date == formatDate).ToList();
                        }
                    }
                    if (!string.IsNullOrEmpty(createdByFilter))
                    {
                        createdByFilter = createdByFilter.Trim().ToLower();
                        payrollTodatls = payrollTodatls.Where(x => !string.IsNullOrEmpty(x.createdBy) && x.createdBy.ToLower() == createdByFilter).ToList();
                    }
                    if (!string.IsNullOrEmpty(modifyDateFilter))
                    {
                        DateTime formatDate;
                        if (DateTime.TryParse(modifyDateFilter, out formatDate))
                        {
                            payrollTodatls = payrollTodatls.Where(x => x.modifiedDate.HasValue && x.modifiedDate.Value.Date == formatDate).ToList();
                        }
                    }
                    if (!string.IsNullOrEmpty(modifyByFilter))
                    {
                        modifyByFilter = modifyByFilter.Trim().ToLower();
                        payrollTodatls = payrollTodatls.Where(x => !string.IsNullOrEmpty(x.modifiedBy) && x.modifiedBy.ToLower() == modifyByFilter).ToList();
                    }
                }

                var payrollTodatlsEmpIds = payrollTodatls.Select(x => x.empId).Distinct().ToList();
                if (payrollTodatlsEmpIds.Any())
                {
                    employees = await _payrollContext.Employees.Where(x => payrollTodatlsEmpIds.Contains(x.id)).ToListAsync();

                    foreach (var employee in employees)
                    {
                        var payrollSetup = await _payrollContext.EmployeePayrollSetups.Where(x => x.empId == employee.id).FirstOrDefaultAsync();
                        var jobInfos = await _payrollContext.PayrollDistributions.Where(x => x.empID == employee.id).ToListAsync();
                        var primaryJob = await _payrollContext.Salaries.FirstOrDefaultAsync(x => x.empId == employee.id && !x.endDate.HasValue && x.jobDescId.HasValue);
                        foreach (var jobInfo in jobInfos)
                        {
                            if (employee.payrollTotalDistributions == null || !employee.payrollTotalDistributions.Any(x => x.jobDescriptionId == jobInfo.jobDescriptionID))
                            {
                                var payrollJobInfos = await _payrollContext.PayrollTotals.Where(x => x.OrgAccountId == OrgAccountId && x.prDatePaid.Value.Date == datePaid.Date && x.empId == employee.id && x.jobDescriptionId == jobInfo.jobDescriptionID).FirstOrDefaultAsync();
                                if (payrollJobInfos != null)
                                {
                                    var distributions = await _payrollContext.payrollTotalDistributions.Where(x => x.payId == payrollJobInfos.Id).ToListAsync();
                                    foreach (var dist in distributions)
                                    {
                                        //var job = await _payrollEmployeeContext.EmployeeJobInfos.Where(x => x.Id == dist.jobInfoId).FirstOrDefaultAsync();
                                        if (dist.jobDescriptionId.HasValue)
                                        {
                                            dist.jobName = await _payrollContext.PayrollJobDescriptions.Where(j => j.Id == dist.jobDescriptionId).Select(j => j.empJobDescription).FirstOrDefaultAsync();
                                            dist.accountingCode = await _payrollContext.AccountingCodes.Where(x => x.Id == dist.cac).Select(x => x.countyExpenseCode).FirstOrDefaultAsync();
                                            if (primaryJob != null)
                                                dist.primaryJob = (dist.jobDescriptionId == primaryJob.jobDescId);
                                            if (payrollSetup != null)
                                                dist.empPayType = payrollSetup.empPayType; //TBD --need to check empPayType value
                                        }
                                    }
                                    if (employee.payrollTotalDistributions == null)
                                        employee.payrollTotalDistributions = new List<PayrollTotalDistribution>();
                                    employee.payrollTotalDistributions.AddRange(distributions);

                                    employee.total = employee.payrollTotalDistributions.Sum(x => x.gross);
                                }
                            }
                        }

                        if (employee.payrollTotalDistributions != null)
                            employee.payrollTotalDistributions = employee.payrollTotalDistributions.OrderByDescending(x => x.primaryJob).ThenBy(x => x.jobName).ToList();
                    }
                }

                if (!string.IsNullOrEmpty(search))
                {
                    search = search.Trim().ToLower();
                    employees = employees.Where(x => x.groupNumber.Contains(search)
                    || x.employeeNumber != null && x.employeeNumber.Contains(search)
                    || (x.lastName +", " +x.firstName).ToLower().Contains(search)
                    ).ToList();
                }
                if (!string.IsNullOrEmpty(groupNumber))
                    employees = employees.Where(x => x.groupNumber.Contains(groupNumber)).ToList();
                if (!string.IsNullOrEmpty(employeeNumber))
                    employees = employees.Where(x => x.employeeNumber.Contains(employeeNumber)).ToList();
                if (isValidTotal)
                    employees = employees.Where(x => x.total.HasValue && x.total.ToString().StartsWith(total.ToString())).ToList();
                if (!string.IsNullOrEmpty(employeeName))
                {
                    employeeName = employeeName.ToLower().Trim();
                    employees = employees.Where(x => (x.lastName+", "+x.firstName).ToLower().Contains(employeeName)).ToList();
                }


                employees = employees.AsQueryable().OrderByCustom(sortKey, desc).ToList();

                var totalCount = employees.Count();
                if (take != 0)
                {
                    employees = employees.Skip(skip).Take(take).ToList();
                }

                return Ok(new { data = employees, Total = totalCount });

            }
            catch (Exception ex)
            {
                throw;
            }
            //return employees;
        }
        [Route("PayrollTotalDeatial")]
        [HttpGet]
        public async Task<ActionResult<PayrollTotals>> GetPayrollDetails(int empId, int jobId, DateTime datePaid)
        {
            var payrollTotals = await _payrollContext.PayrollTotals.Where(x => x.OrgAccountId == OrgAccountId && x.empId == empId && x.jobDescriptionId == jobId && x.prDatePaid.Value.Date == datePaid.Date).OrderByDescending(x => x.Id).FirstOrDefaultAsync();
            if (payrollTotals == null)
            {
                return BadRequest("Payroll Details does not exist");
            }
            return payrollTotals;
        }

        [Route("PayrollTotalDetail")]
        [HttpPost]
        public async Task UpdatePayrollDetails(PayrollTotals payrollTotals)
        {
            try
            {
                if (payrollTotals.Id > 0)
                    _payrollContext.PayrollTotals.Update(payrollTotals);
                else
                    await _payrollContext.PayrollTotals.AddAsync(payrollTotals);

                await _payrollContext.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                throw;
            }
        }
        [Route("RefreshPayrollTotalDetail")]
        [HttpPost]
        public async Task RefreshPayrollTotalDetail(PayrollTotals payrollTotals)
        {
            try
            {
                //if (payrollTotals.Id > 0)
                //    _payrollContext.PayrollTotals.Update(payrollTotals);
                //else
                //    await _payrollContext.PayrollTotals.AddAsync(payrollTotals);

                await _payrollContext.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        [Route("PREmployeeDistributions")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PayrollDistribution>>> GetPREmployeeDistributions(int empid, DateTime datepaid)
        {
            //var payrollTotals = await _payrollContext.PayrollTotals.Where(x => x.ORG_ID == OrgAccountId && x.empId == empid && x.prDatePaid.Value.Date == datepaid.Date).Select(x => new { x.empId,x.jobDescriptionId }).ToListAsync();
            var distributions = await _payrollContext.PayrollDistributions.Where(x => x.empID == empid).ToListAsync();
            foreach (var distribution in distributions)
            {
                distribution.PayrollTotals = await _payrollContext.PayrollTotals.Where(x => x.jobDescriptionId == distribution.jobDescriptionID).FirstOrDefaultAsync();
                //var jobInfo = await _payrollEmployeeContext.EmployeeJobInfos.Where(x => x.Id == distribution.jobId).FirstOrDefaultAsync();
                if (distribution.jobDescriptionID.HasValue)
                {
                    distribution.jobName = await _payrollContext.PayrollJobDescriptions.Where(j => j.Id == distribution.jobDescriptionID.Value).Select(j => j.empJobDescription).FirstOrDefaultAsync();
                    distribution.AccountingCode = await _payrollContext.AccountingCodes.Where(x => x.Id == distribution.cac).Select(x => x.countyExpenseCode).FirstOrDefaultAsync();
                }
            }
            return distributions;
        }
        [Route("BenefitAdjustment")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PayrollTotalBenefitDistribution>>> getPayrollTotalBenefitDistribution(DateTime datePaid, int? benefitId, int skip = 0, int take = 0, bool desc = false, string sortKey = "lastName")
        {
            try
            {
                var totalBenefits = await _payrollContext.payrollTotalBenefitDistributions.
                    Where(x => x.datePaid.Value.Date == datePaid.Date && x.OrgAccountId == OrgAccountId &&
                    (benefitId == null || x.benefitId == benefitId)).ToListAsync();

                DateTime? postDate = null;
                if(benefitId.HasValue)
                    postDate = totalBenefits.Where(x => x.postDate.HasValue).Select(x => x.postDate).FirstOrDefault();

                var empIds = totalBenefits.Select(x => x.empId).ToList().Distinct().ToList();
                ///var modifiedByIds = totalBenefits.Select(x => x.modifiedBy).ToList().Distinct().ToList();
                var cacIds = totalBenefits.Select(x => x.prtbdCAC).ToList().Distinct().ToList();
                var benefitIds = totalBenefits.Select(x => x.benefitId).ToList().Distinct().ToList();

                var benefits = await _payrollContext.Benefits.Where(x => benefitIds.Contains(x.Id)).Select(x => new { x.Id, x.benefitsName } ).ToListAsync();
                var accountingCodes = await _payrollContext.AccountingCodes.Where(x => cacIds.Contains(x.Id)).Select(x => new { x.Id, x.countyExpenseCode }).ToListAsync();
                var employeesFirstName = await _payrollContext.Employees.Where(x => empIds.Contains(x.id)).Select(x => new { x.id, name = x.firstName }).ToListAsync();
                var employeesLastName = await _payrollContext.Employees.Where(x => empIds.Contains(x.id)).Select(x => new { x.id, name = x.lastName }).ToListAsync();
                foreach (var item in totalBenefits)
                {
                    item.benefitName = benefits.Where(x => x.Id == item.benefitId).Select(x => x.benefitsName).FirstOrDefault();
                    item.accountingCode = accountingCodes.Where(x => x.Id == item.prtbdCAC).Select(x => x.countyExpenseCode).FirstOrDefault();
                    item.firstName = employeesFirstName.Where(x => x.id == item.empId).Select(x => x.name).FirstOrDefault();
                    item.lastName = employeesLastName.Where(x => x.id == item.empId).Select(x => x.name).FirstOrDefault();

                }
                totalBenefits = totalBenefits.AsQueryable().OrderByCustom(sortKey, desc).ToList();
                if (take == 0)
                {
                    return Ok(new { data = totalBenefits, total = totalBenefits.Count(), totalAmount = totalBenefits.Sum(x => x.prtbdAmount), postDate= postDate });
                }
                else
                {
                    return Ok(new { data = totalBenefits.Skip(skip).Take(take).ToList(), total = totalBenefits.Count(), totalAmount = totalBenefits.Sum(x => x.prtbdAmount), postDate = postDate });
                }
            }
            catch (Exception ex)
            {
                throw;
            }
        }
        [Route("EmployeePaidHistory")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PayrollTotals>>> GetEmployeePaidHistory(int empId)
        {
            var history = await _payrollContext.PayrollTotals.Where(x => OrgAccountId == OrgAccountId && x.empId == empId).OrderByDescending(x => x.prDatePaid).ToListAsync();
            var primaryJob = await _payrollContext.Salaries.FirstOrDefaultAsync(x => x.endDate.HasValue && x.empId == empId);
            foreach (var item in history)
            {
                //var jobInfo = await _payrollEmployeeContext.EmployeeJobInfos.Where(x => x.Id == item.jobId).FirstOrDefaultAsync();
                if (item.jobDescriptionId.HasValue)
                {
                    item.jobName = await _payrollContext.PayrollJobDescriptions.Where(j => j.Id == item.jobDescriptionId.Value).Select(j => j.empJobDescription).FirstOrDefaultAsync();
                }
                item.employee = await _payrollContext.Employees.Where(x => x.id == item.empId && x.OrgAccountId == OrgAccountId).FirstOrDefaultAsync();
                item.payrollTotalDistributions = await _payrollContext.payrollTotalDistributions.Where(x => x.payId == item.Id).ToListAsync();

                foreach (var distribution in item.payrollTotalDistributions.Where(x => x.jobDescriptionId.HasValue))
                {
                    if (primaryJob != null)
                        distribution.primaryJob = distribution.jobDescriptionId == primaryJob.jobDescId;
                }
            }
            return Ok(history);
        }
        [Route("EmployeePaidDistributions")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PayrollTotalDistribution>>> GetEmployeePaidDistributions(int payId)
        {
            var distributions = await _payrollContext.payrollTotalDistributions.Where(x => x.payId == payId && x.OrgAccountId == OrgAccountId).ToListAsync();
            if (distributions.Count == 0)
                return distributions;

            var primaryJob = await _payrollContext.Salaries.FirstOrDefaultAsync(x => !x.endDate.HasValue && x.empId == distributions.FirstOrDefault()!.empId);

            foreach (var item in distributions)
            {
                //var jobInfo = await _payrollEmployeeContext.EmployeeJobInfos.Where(x => x.Id == item.jobInfoId).FirstOrDefaultAsync();
                if (item.jobDescriptionId.HasValue)
                {
                    if (primaryJob != null)
                        item.primaryJob = item.jobDescriptionId == primaryJob.jobDescId;
                    item.jobName = await _payrollContext.PayrollJobDescriptions.Where(j => j.Id == item.jobDescriptionId.Value).Select(j => j.empJobDescription).FirstOrDefaultAsync();
                    item.accountingCode = await _payrollContext.AccountingCodes.Where(x => x.Id == item.cac).Select(x => x.countyExpenseCode).FirstOrDefaultAsync();
                }
            }
            return Ok(distributions);
        }
        [Route("EmployeeHistoryBenefits")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PayrollTotalBenefitDistribution>>> GetEmployeeHistoryBenefits(int payDistId, DateTime datePaid)
        {
            var benefits = await _payrollContext.payrollTotalBenefitDistributions.Where(x => x.OrgAccountId == OrgAccountId && x.payDistId == payDistId && x.datePaid.Value.Date == datePaid.Date).ToListAsync();
            foreach (var item in benefits)
            {
                item.benefitName = await _payrollContext.Benefits.Where(x => x.Id == item.benefitId && x.OrgAccountId == OrgAccountId).Select(x => x.benefitsName).FirstOrDefaultAsync();
                item.accountingCode = await _payrollContext.AccountingCodes.Where(x => x.Id == item.prtbdCAC).Select(x => x.countyExpenseCode).FirstOrDefaultAsync();

            }
            return Ok(benefits);
        }
        [Route("PayrollToatals")]
        [HttpGet]
        public async Task<ActionResult<PayrollToatalAmounts>> GetPayrollTotals(DateTime datePaid, int? empId, int? cacId)
        {
            PayrollToatalAmounts toatalAmounts = new PayrollToatalAmounts();
            toatalAmounts.payrollTotal = await _payrollContext.payrollTotalDistributions.Where(x => x.datePaid.Value.Date == datePaid.Date && x.OrgAccountId == OrgAccountId).SumAsync(x => x.gross);
            if (empId != null)
            {
                toatalAmounts.empTotal = await _payrollContext.payrollTotalDistributions.Where(x => x.empId == empId && x.datePaid.Value.Date == datePaid.Date && x.OrgAccountId == OrgAccountId).SumAsync(x => x.gross);
            }
            if (cacId != null)
            {
                toatalAmounts.cacTotal = await _payrollContext.payrollTotalDistributions.Where(x => x.cac == cacId && x.datePaid.Value.Date == datePaid.Date && x.OrgAccountId == OrgAccountId).SumAsync(x => x.gross);
            }
            return toatalAmounts;
        }


        [Route("PayrollTotalDistribution")]
        [HttpPost]
        public async Task<ActionResult<PayrollTotalBenefitDistribution>> AddPayrollTotalDistribution(PayrollTotalDistribution payrollTotalDistribution)
        {
            if (payrollTotalDistribution == null)
            {
                return BadRequest("Request object con't be null");
            }
            _payrollContext.payrollTotalDistributions.Add(payrollTotalDistribution);
            await _payrollContext.SaveChangesAsync();
            return Ok(payrollTotalDistribution);
        }
        [Route("PayrollTotalDistribution")]
        [HttpPut]
        public async Task<ActionResult<PayrollTotalBenefitDistribution>> UpdatePayrollTotalDistribution(int id, PayrollTotalDistribution payrollTotalDistribution)
        {
            try
            {
                if (payrollTotalDistribution == null || id != payrollTotalDistribution.ID)
                {
                    return BadRequest("Request Object is incorrecct");
                }
                var benefitRef = await _payrollContext.payrollTotalDistributions.Where(x => x.ID == id && x.OrgAccountId == OrgAccountId).FirstOrDefaultAsync();
                if (benefitRef == null)
                {
                    return BadRequest("PayrollTotalDistribution does not exist");
                }
                _payrollContext.payrollTotalDistributions.Entry(benefitRef).State = EntityState.Detached;
                _payrollContext.payrollTotalDistributions.Update(payrollTotalDistribution);
                await _payrollContext.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                throw;
            }
            return Ok(payrollTotalDistribution);
        }
        [Route("PayrollTotalDistribution")]
        [HttpDelete]
        public async Task<ActionResult<bool>> DeletePayrollTotalDistribution(int id)
        {
            var benefitRef = await _payrollContext.payrollTotalDistributions.Where(x => x.ID == id && x.OrgAccountId == OrgAccountId).FirstOrDefaultAsync();
            if (benefitRef == null)
            {
                return BadRequest("PayrollTotalDistribution does not exist");
            }
            _payrollContext.payrollTotalDistributions.Remove(benefitRef);
            await _payrollContext.SaveChangesAsync();
            return Ok(true);
        }

        [Route("PayrollTotalBenefitDistribution")]
        [HttpPost]
        public async Task<ActionResult<PayrollTotalBenefitDistribution>> AddPayrollTotalBenefitDistribution(PayrollTotalBenefitDistribution payrollTotalBenefitDistribution)
        {
            if (payrollTotalBenefitDistribution == null)
            {
                return BadRequest("Request object con't be null");
            }
            _payrollContext.payrollTotalBenefitDistributions.Add(payrollTotalBenefitDistribution);
            await _payrollContext.SaveChangesAsync();
            return Ok(payrollTotalBenefitDistribution);
        }
        [Route("PayrollTotalBenefitDistribution")]
        [HttpPut]
        public async Task<ActionResult<PayrollTotalBenefitDistribution>> UpdatePayrollTotalBenefitDistribution(int id, PayrollTotalBenefitDistribution payrollTotalBenefitDistribution)
        {
            if (payrollTotalBenefitDistribution == null || id != payrollTotalBenefitDistribution.Id)
            {
                return BadRequest("Request Object is incorrecct");
            }
            var benefitRef = await _payrollContext.payrollTotalBenefitDistributions.Where(x => x.Id == id && x.OrgAccountId == OrgAccountId).FirstOrDefaultAsync();
            if (benefitRef == null)
            {
                return BadRequest("PayrollTotalBenefitDistribution does not exist");
            }
            _payrollContext.payrollTotalBenefitDistributions.Entry(benefitRef).State = EntityState.Detached;
            payrollTotalBenefitDistribution.createdDate = benefitRef.createdDate;
            payrollTotalBenefitDistribution.createdBy = benefitRef.createdBy;
            _payrollContext.payrollTotalBenefitDistributions.Update(payrollTotalBenefitDistribution);
            await _payrollContext.SaveChangesAsync();
            return Ok(payrollTotalBenefitDistribution);
        }
        [Route("PayrollTotalBenefitDistribution")]
        [HttpDelete]
        public async Task<ActionResult<bool>> DeletePayrollTotalBenefitDistribution(int id)
        {
            var benefitRef = await _payrollContext.payrollTotalBenefitDistributions.Where(x => x.Id == id && x.OrgAccountId == OrgAccountId).FirstOrDefaultAsync();
            if (benefitRef == null)
            {
                return BadRequest("PayrollTotalBenefitDistribution does not exist");
            }
            _payrollContext.payrollTotalBenefitDistributions.Remove(benefitRef);
            await _payrollContext.SaveChangesAsync();
            return Ok(true);
        }

        [Route("GetPayRaiseSalaryData")]
        [HttpPost]
        public async Task<PayRaiseListResponse> GetPayRaiseSalaryData(AddPayRaiseDTO addPayRaiseDTO)
        {
            var isPercentRaise = (addPayRaiseDTO.PercentRaise.HasValue && addPayRaiseDTO.PercentRaise.Value > 0);

            if (!isPercentRaise && !addPayRaiseDTO.FlatRaise.HasValue)
                addPayRaiseDTO.FlatRaise = 0;

            var salariesToUpdateQuery = _payrollContext.Salaries
                .Include(x => x.JobDescription)
                .Where(x => !x.endDate.HasValue);

            if (addPayRaiseDTO.PrimaryJobDescriptionId.HasValue)
                salariesToUpdateQuery = salariesToUpdateQuery.Where(x => x.jobDescId == addPayRaiseDTO.PrimaryJobDescriptionId);

            if (!string.IsNullOrEmpty(addPayRaiseDTO.GroupNo))
            {
                var empIdsByGroup = _payrollContext.Employees.Where(x => x.groupNumber == addPayRaiseDTO.GroupNo).Select(x => x.id).ToList();
                salariesToUpdateQuery = salariesToUpdateQuery.Where(x => empIdsByGroup.Contains(x.empId!.Value));
            }
            if (addPayRaiseDTO.HiredOnOrBeforeDate.HasValue)
            {
                var empIdsByHireDate = _payrollContext.EmployeePayrollSetups.Where(x => x.empDateHired <= addPayRaiseDTO.HiredOnOrBeforeDate.Value).Select(x => x.empId).ToList();
                salariesToUpdateQuery = salariesToUpdateQuery.Where(x => empIdsByHireDate.Contains(x.empId!.Value));
            }

            DateTime takesEffectOn = addPayRaiseDTO.TakesEffectOn ?? DateTime.Today;

            var salaryEndDate = takesEffectOn;
            var salariesToUpdate = await salariesToUpdateQuery.Where(x => x.startDate < salaryEndDate).ToListAsync();

            var salariedEmpIds = salariesToUpdate.Select(x => x.empId);
            var empSetupList = await _payrollContext.EmployeePayrollSetups.Include(x=>x.Employee).Where(x => salariedEmpIds.Contains(x.empId)).ToListAsync();
            var payTypes = await _payrollContext.CodeValues.Where(x => x.CodeTypes.description == "Pay Type").ToListAsync();

            List<AddPayRaiseListDTO> addPayRaiseListDTOs = new List<AddPayRaiseListDTO>();
            foreach (var salary in salariesToUpdate)
            {
                try
                {
                    decimal? newSalary_salary = salary.salary;
                    decimal? newSalary_payDaySalary = salary.payDaySalary;
                    decimal? newSalary_hourlyRate = salary.hourlyRate;

                    var empPaySetup = empSetupList.FirstOrDefault(x => x.empId == salary.empId);

                    bool isSkip = empPaySetup==null || empPaySetup!.empPayType==null;
                    if (!isSkip)
                    {
                        try
                        {
                            var isSalaried = payTypes.FirstOrDefault(x => x.Id == empPaySetup!.empPayType)!.value.ToLower() == "salary";
                            if (isSalaried)
                            {
                                salary.salary = salary.hourlyRate!.Value * salary.hoursPerYear;
                                if (isPercentRaise)
                                {
                                    var percentVal = addPayRaiseDTO.PercentRaise!.Value;
                                    var percent = percentVal / 100;
                                    newSalary_salary = salary.salary + (salary.salary * percent);
                                    newSalary_payDaySalary = newSalary_salary / 26;
                                    newSalary_hourlyRate = newSalary_payDaySalary / salary.hoursPaid;
                                }
                                else
                                {
                                    newSalary_salary = ((salary.salary / salary.hoursPerYear) + addPayRaiseDTO.FlatRaise!.Value) * salary.hoursPerYear;
                                    newSalary_payDaySalary = newSalary_salary / 26;
                                    newSalary_hourlyRate = newSalary_salary / salary.hoursPerYear;
                                }
                            }
                            else
                            {
                                if (!isSkip)
                                {
                                    salary.salary = salary.hourlyRate!.Value * salary.hoursPerYear!.Value;
                                    if (isPercentRaise)
                                    {
                                        var percentVal = addPayRaiseDTO.PercentRaise!.Value;
                                        var percent = percentVal / 100;

                                        newSalary_salary = Math.Round((salary.hourlyRate!.Value + (salary.hourlyRate!.Value * percent)) * salary.hoursPerYear!.Value, 2);
                                        newSalary_payDaySalary = 0;
                                        newSalary_hourlyRate = newSalary_salary / salary.hoursPerYear!.Value;
                                    }
                                    else
                                    {
                                        newSalary_salary = Math.Round((salary.hourlyRate!.Value + addPayRaiseDTO.FlatRaise!.Value) * salary.hoursPerYear!.Value, 2);// addPayRaiseDTO.PercentRaise!.Value;
                                        newSalary_payDaySalary = 0;
                                        newSalary_hourlyRate = newSalary_salary / salary.hoursPerYear!.Value;
                                    }
                                }
                            }
                        }
                        catch (Exception ex)
                        {
                            isSkip = true;
                        }
                        finally
                        {
                            isSkip = newSalary_salary == 0;
                        }
                    }

                    if (!isSkip && salary.salary!=0)
                    {
                        var emp = empPaySetup.Employee;

                        AddPayRaiseListDTO addPayRaiseListDTO = new AddPayRaiseListDTO
                        {
                            SalaryID = salary.Id,
                            CurrentHourly = salary.hourlyRate,
                            CurrentSalary = salary.salary,
                            EmployeeID = salary.empId!.Value,
                            EmployeeName = emp.lastName+", "+emp.firstName,
                            GroupNo = emp!.groupNumber!,
                            PayType = empPaySetup!.empPayType!.Value,
                            PayTypeValue = payTypes.FirstOrDefault(x => x.Id == empPaySetup!.empPayType)!.value??"",
                            PercentIncrease = ((newSalary_salary - salary.salary) / salary.salary) * 100,
                            PrimaryJob = salary.JobDescription!.empJobDescription!,
                            PrimaryJobID = salary.jobDescId!.Value,
                            ProposedHourly = newSalary_hourlyRate,
                            ProposedPayDaySalary = newSalary_payDaySalary,
                            ProposedSalary = newSalary_salary,
                            DateHired = empPaySetup.empDateHired,
                        };
                        addPayRaiseListDTOs.Add(addPayRaiseListDTO);
                    }
                }
                catch (Exception ex)
                {
                    throw;
                }
            }
            addPayRaiseListDTOs = addPayRaiseListDTOs.OrderBy(x => x.EmployeeName).ToList();
            return new PayRaiseListResponse { TakesEffectOn = takesEffectOn, Data = addPayRaiseListDTOs };
        }

        [Route("ApplyPayRaise")]
        [HttpPost]
        public async Task<ActionResult<bool>> ApplyPayRaise(ApplyPayRaiseDTO addPayRaiseDTO)
        {
            var salaryIds = addPayRaiseDTO.SalaryData.Select(x => x.Id).ToList();
            var salariesToUpdateQuery = _payrollContext.Salaries.Where(x => salaryIds.Contains(x.Id) && !x.endDate.HasValue);

            var salaryEndDate = addPayRaiseDTO.TakesEffectOn.AddDays(-1);
            var salariesToUpdate = await salariesToUpdateQuery.Where(x => x.startDate <= salaryEndDate).ToListAsync();

            var salariedEmpIds = salariesToUpdate.Select(x => x.empId);
            var payrollDistPrimaryJob = _payrollContext.PayrollDistributions.Where(x => salariedEmpIds.Contains(x.empID) && !x.endDate.HasValue && x.lineRate.HasValue && x.lineRate.Value > 0);

            List<Salaries> newSalaries = new List<Salaries>();
            foreach (var salary in salariesToUpdate)
            {
                try
                {
                    salary.endDate = addPayRaiseDTO.TakesEffectOn.AddDays(-1);
                    var newSalary = salary.DeepCopy();
                    newSalary.Id = 0;
                    /*
                    salaryDR("StartDate") = ApplyOn.Text
                    salaryDR("Memo") = "Raise applied using Pay Raise Tool"
                    salaryDR("Salary") = empRow("Proposed Salary")
                    salaryDR("PaydaySalary") = CDec(empRow("Proposed Salary")) / 26.0
                    salaryDR("HourlyRate") = empRow("Proposed Hourly")
                    */

                    newSalary.startDate = addPayRaiseDTO.TakesEffectOn;
                    newSalary.endDate = null;
                    newSalary.memo = "Raise applied using Pay Raise Tool";

                    var proposedSalaryData = addPayRaiseDTO.SalaryData.FirstOrDefault(x => x.Id == salary.Id);

                    newSalary.salary = proposedSalaryData!.ProposedSalary;
                    if(proposedSalaryData.PayType == "salary")
                    newSalary.payDaySalary = proposedSalaryData!.ProposedSalary / 26;
                    newSalary.hourlyRate = proposedSalaryData!.ProposedHourlyRate;

                    newSalaries.Add(newSalary);
                    //Dictionary<int,int> dicOldNew = 
                    //check if primary job exists and has line rate
                    var payDisWithLineRate = payrollDistPrimaryJob.Where(x => x.empID == newSalary.empId && x.jobDescriptionID == newSalary.jobDescId).ToList();
                    foreach (var payDist in payDisWithLineRate)
                    {
                        payDist.endDate = addPayRaiseDTO.TakesEffectOn.AddDays(-1);
                        var newDistribution = payDist.DeepCopy();
                        newDistribution.Id = 0;
                        newDistribution.lineRate = newSalary.hourlyRate.Value;
                        newDistribution.startDate = addPayRaiseDTO.TakesEffectOn;
                        newDistribution.endDate = null;
                        await _payrollContext.PayrollDistributions.AddAsync(newDistribution);
                        await _payrollContext.SaveChangesAsync();
                        var distIHacBenefits = await _payrollContext.benefitIHACDistributions.Where(x => x.payDistId == payDist.Id).ToListAsync();

                        List<BenefitIHACDistribution> benIhacDists = new List<BenefitIHACDistribution>();
                        foreach (var distIHacBenefit in distIHacBenefits)
                        {
                            var empIHacBenefit = await _payrollContext.EmployeePayrollBenefits.Include(x => x.benefitIHACDistribution).Where(x => x.Id == distIHacBenefit.benId).FirstOrDefaultAsync();
                            empIHacBenefit.benefitIHACDistribution = null;
                            var newEmpPayBenefit = empIHacBenefit.DeepCopy();
                            newEmpPayBenefit.Id = 0;
                            await _payrollContext.EmployeePayrollBenefits.AddAsync(newEmpPayBenefit);
                            await _payrollContext.SaveChangesAsync();

                            var newDistIHacBenefit = distIHacBenefit.DeepCopy();
                            newDistIHacBenefit.ID = 0;
                            newDistIHacBenefit.payDistId = newDistribution.Id;
                            newDistIHacBenefit.benId = newEmpPayBenefit.Id;

                            await _payrollContext.benefitIHACDistributions.AddAsync(newDistIHacBenefit);
                            await _payrollContext.SaveChangesAsync();
                        }
                    }
                }
                catch (Exception ex)
                {
                    throw;
                }
            }
            //old app methods
            // ApplyRaiseToSalary(dt.Rows(i))
            //ApplyRaiseToPayDist(dt.Rows(i))

            /*
             * sb.Append("               WHEN Payroll_Employee_Setup.Emp_Pay_Type = 1 THEN ")
                Select Case Opt4
                    Case "Percent"
                        sb.AppendFormat("             ROUND(Salaries.Salary * {0}, 2) ", PercentRaise)
                    Case "Flat"
                        sb.AppendFormat("             ROUND(((Salaries.Salary / 26 / Salaries.HoursPaid) + {0}) * Salaries.HoursPaid * 26, 2) ", FlatRaise)
                End Select
                sb.Append("               WHEN Payroll_Employee_Setup.Emp_Pay_Type = 2 THEN ")
                sb.Append("                   CASE ")
                sb.Append("                       WHEN Salaries.Salary < 0.00000001 THEN ")
                sb.Append("                           0 ")
                sb.Append("                       ELSE ")
                Select Case Opt4
                    Case "Percent"
                        sb.AppendFormat("                     ROUND(Salaries.HourlyRate * {0} * Salaries.HoursPerYear, 2) ", PercentRaise)
                    Case "Flat"
                        sb.AppendFormat("                     ROUND((Salaries.HourlyRate + {0}) * Salaries.HoursPerYear, 2) ", FlatRaise)
                End Select
             */
            _payrollContext.Salaries.UpdateRange(salariesToUpdate);
            await _payrollContext.Salaries.AddRangeAsync(newSalaries);

            _payrollContext.SaveChanges();

            return Ok(true);
        }
    }

}
