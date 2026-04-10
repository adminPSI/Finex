using FinexAPI.Common;
using FinexAPI.Data;
using FinexAPI.Dtos;
using FinexAPI.Helper;
using FinexAPI.Models;
using FinexAPI.Models.PayrollDefaults;
using FinexAPI.Models.PayrollEmployee;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Net;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace FinexAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PayrollEmployeeController : BaseController
    {
        private readonly FinexAppContext _context;

        public PayrollEmployeeController(FinexAppContext context, IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor)
        {
            _context = context;
        }


        /*EMPLOYEE JOB INFO*/

        //Get All  Employee Job Info 
        [Route("EmployeeJobInfo")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EmployeeJobInfo>>> GetAllEmpJobInfo()
        {
            //return await _context.EmployeeJobInfos.Include(e => e.JobDescription).ToListAsync();
            var salaries = await _context.Salaries.Include(e => e.JobDescription).ToListAsync();

            var data = salaries.Select(x => new EmployeeJobInfo
            {
                empId = x.empId!.Value,
                endDate = x.endDate,
                Id = x.Id,
                jobDescripId = x.jobDescId,
                JobDescription = x.JobDescription,
                primaryJob = !x.endDate.HasValue,
                startDate = x.startDate,
            }).ToList();

            return data;
        }

        //Get  Employee Job Info by empid
        [Route("EmployeeJobInfosByEmpId/{EmpId}")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EmployeeJobInfo>>> GetEmpJobInfobyEmpId(int EmpId, bool active, DateTime? startDate, DateTime? endDate, bool desc, string sortKey = "startDate", string? jobDescription = "", string? search = "", int skip = 0, int take = 10)
        {
            var query = _context.Salaries.Include(e => e.JobDescription).Where(x => x.empId == EmpId && x.jobDescId.HasValue);

            if (active)
                query = query.Where(x => !x.endDate.HasValue);
            else
                query = query.Where(x => x.endDate.HasValue);

            if (startDate.HasValue)
                query = query.Where(x => x.startDate == startDate);
            if (endDate.HasValue)
                query = query.Where(x => x.endDate == endDate);
            if (!string.IsNullOrEmpty(jobDescription))
            {
                jobDescription = jobDescription.Trim().ToLower();
                query = query.Where(x => x.JobDescription.empJobDescription.ToLower().Contains(jobDescription));
            }
            if (!string.IsNullOrEmpty(search))
            {
                search = search.Trim().ToLower();
                query = query.Where(x => x.startDate.ToString().Contains(search) || x.endDate.ToString().Contains(search) || x.JobDescription.empJobDescription.ToString().Contains(search));
            }

            var list = query.Select(x => new EmployeeJobInfo
            {
                empId = x.empId!.Value,
                endDate = x.endDate,
                Id = x.Id,
                jobDescripId = x.jobDescId,
                JobDescription = x.JobDescription,
                primaryJob = !x.endDate.HasValue,
                startDate = x.startDate,
            });

            var pagedResult = await list.OrderByCustom(sortKey, desc).ToListAsync();

            var totalCount = pagedResult.Count();

            if (take != 0)
            {
                pagedResult = pagedResult.Skip(skip).Take(take).ToList();
            }

            return Ok(new { data = pagedResult, Total = totalCount });
        }

        [Route("GetEmployeeJobsByEmpId/{EmpId}")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EmployeeJobInfo>>> GetEmployeeJobs(int empId, bool active)
        {
            List<PayrollDistribution> distributions = new List<PayrollDistribution>();

            //var empJobInfos = await _context.EmployeeJobInfos.Where(x => x.empId == empId).Select(x => x.Id).ToListAsync();
            distributions = await _context.PayrollDistributions.Where(d => d.OrgAccountId == OrgAccountId && d.empID == empId && d.jobDescriptionID.HasValue).ToListAsync();

            var data = distributions.Select(x => new EmployeeJobInfo
            {
                empId = x.empID!.Value,
                endDate = x.endDate,
                Id = x.Id,
                jobDescripId = x.jobDescriptionID,
                //JobDescription = x.jobName,
                primaryJob = false,
                startDate = x.startDate,
            }).ToList();

            var primaryJob = await _context.Salaries.Where(x => x.empId == empId && x.endDate == null).FirstOrDefaultAsync();

            if (data.Count > 0)
            {
                foreach (var dataItem in data)
                {
                    if (primaryJob != null && primaryJob.jobDescId == dataItem.jobDescripId)
                        dataItem.primaryJob = true;

                    if (dataItem.jobDescripId.HasValue)
                    {
                        dataItem.JobDescription = await _context.PayrollJobDescriptions.FirstOrDefaultAsync(j => j.Id == dataItem.jobDescripId.Value);
                    }
                }
            }
            if (active)
            {
                data = data.Where(x => x.endDate == null).ToList();
            }
            else
            {
                data = data.Where(x => x.endDate != null).ToList();
            }

            var distinctJobs = data.Select(x => new EmployeeJobInfo
            {
                empId = x.empId,
                endDate = DateTime.MinValue,
                Id = x.jobDescripId.Value,
                jobDescripId = x.jobDescripId,
                JobDescription = x.JobDescription,
                primaryJob = x.primaryJob,
                startDate = DateTime.MinValue,
            }).DistinctBy(x => x.jobDescripId).ToList();

            return distinctJobs;
        }

        //Get Employee Job Info by Id
        [Route("EmployeeJobInfo/{id}")]
        [HttpGet]
        public async Task<ActionResult<EmployeeJobInfo>> GetJobInfoByID(int id)
        {
            var salary = await _context.Salaries.Include(e => e.JobDescription).Where(x => x.Id == id).ToListAsync();

            if (salary == null)
            {
                return BadRequest("EmployeeJobInfo does not exist");
            }

            var data = salary.Select(x => new EmployeeJobInfo
            {
                empId = x.empId!.Value,
                endDate = x.endDate,
                Id = x.Id,
                jobDescripId = x.jobDescId,
                JobDescription = x.JobDescription,
                primaryJob = !x.endDate.HasValue,
                startDate = x.startDate,
            }).FirstOrDefault();

            return Ok(data);

            //var jobinfo = await _context.EmployeeJobInfos.FindAsync(id);
            //if (jobinfo == null)
            //{
            //    return BadRequest("EmployeeJobInfo does not exist");
            //}
            //return Ok(jobinfo);
        }
        //Add new  Employee Job Info
        //[Route("EmployeeJobInfo")]
        //[HttpPost]
        //public async Task<ActionResult<EmployeeJobInfo>> AddEmployeeJobInfo(EmployeeJobInfo jobInfo)
        //{
        //    if (jobInfo == null)
        //    {
        //        return BadRequest("EmployeeJobInfo does not exist");
        //    }
        //    await _context.EmployeeJobInfos.AddAsync(jobInfo);
        //    await _context.SaveChangesAsync();
        //    //return Ok();
        //    return CreatedAtAction("GetJobInfoByID", new { id = jobInfo.Id }, jobInfo);
        //}
        //Update Employee Job Info
        [Route("EmployeeJobInfo/{id}")]
        [HttpPut]
        public async Task<IActionResult> UpdateEmployeeJobInfo(int id, Salaries jobinfo)
        {
            if (id != jobinfo.Id)
            {
                return BadRequest("EmployeeJobInfo does not match with id");
            }
            var jobRef = await _context.Salaries.FindAsync(id);
            if (jobRef == null)
            {
                return BadRequest("EmployeeJobIinfo does not exist");
            }
            //jobinfo.createdBy = jobRef.createdBy;
            //jobinfo.createdDate = jobRef.createdDate;
            jobRef.jobDescId = jobinfo.jobDescId;
            jobRef.startDate = jobinfo.startDate;
            jobRef.endDate = jobinfo.endDate;
            //_context.Salaries.Entry(jobRef).State = EntityState.Detached;
            _context.Salaries.Update(jobRef);

            if (jobRef.endDate == null)
            {
                var empData = await _context.EmployeePayrollSetups.FirstOrDefaultAsync(x => x.empId == jobRef.empId);
                empData.jobID = jobRef.jobDescId;
            }


            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)

            {
                if (!JobinfoExists(id))
                {
                    return BadRequest("EmployeeJobInfo does not exist");
                }

                else
                {
                    throw;
                }
            }
            //  return Ok();
            return CreatedAtAction("GetJobInfoByID", new { id = jobinfo.Id }, jobinfo);

        }
        private bool JobinfoExists(int id)
        {
            return _context.Salaries.Any(e => e.Id == id);
        }
        //Delete EmployeeJobInfo
        //[Route("EmployeeJobInfo/{id}")]
        //[HttpDelete]
        //public async Task<ActionResult<EmployeeJobInfo>> DeleteEmployeeJobInfo(int id)
        //{
        //    var jobinfo = await _context.EmployeeJobInfos.FindAsync(id);
        //    if (jobinfo == null)
        //    {
        //        return BadRequest("EmployeeJobInfo does not exist");
        //    }
        //    _context.EmployeeJobInfos.Remove(jobinfo);
        //    await _context.SaveChangesAsync();

        //    return jobinfo;
        //}
        /*EMPLOYEE DEPARTMENTS*/
        //Get all Employee Departments
        [Route("EmployeeDepartment")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EmployeeDepartment>>> GetallEmployeeDepartments()
        {
            return await _context.EmployeeDepartments.ToListAsync();
        }
        //Get Employee Departments by ID
        [Route("EmployeeDepartment/{id}")]
        [HttpGet]
        public async Task<ActionResult<EmployeeDepartment>> GetEmployeeDepartmentByID(int id)
        {
            var dept = await _context.EmployeeDepartments.FindAsync(id);
            if (dept == null)
            {
                return BadRequest("EmployeeDepartment does not exist");
            }
            return Ok(dept);
        }
        //Add new  Employee Department
        [Route("EmployeeDepartment")]
        [HttpPost]
        public async Task<ActionResult<EmployeeDepartment>> AddEmployeeDepartment(EmployeeDepartment dept)
        {
            if (dept == null)
            {
                return BadRequest("EmployeeDepartment does not exist");
            }
            await _context.EmployeeDepartments.AddAsync(dept);
            await _context.SaveChangesAsync();
            //return Ok();
            return CreatedAtAction("GetEmployeeDepartmentByID", new { id = dept.Id }, dept);
        }
        //Update Employee Department
        [Route("EmployeeDepartment/{id}")]
        [HttpPut]
        public async Task<IActionResult> UpdateEmployeeDepartment(int id, EmployeeDepartment dept)
        {
            if (id != dept.Id)
            {
                return BadRequest("EmployeeDepartment does not match with id");
            }
            var departmentRef = await _context.EmployeeDepartments.FindAsync(id);
            if (departmentRef == null)
            {
                return BadRequest("EmployeeDepartment doesnot exist");
            }
            dept.createdBy = departmentRef.createdBy;
            dept.createdDate = departmentRef.createdDate;
            _context.EmployeeDepartments.Entry(departmentRef).State = EntityState.Detached;
            _context.EmployeeDepartments.Update(dept);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)

            {
                if (!EmpDeptExists(id))
                {
                    return BadRequest("EmployeeDepartment does not exist");
                }

                else
                {
                    throw;
                }
            }
            //  return Ok();
            return CreatedAtAction("GetEmployeeDepartmentByID", new { id = dept.Id }, dept);

        }
        private bool EmpDeptExists(int id)
        {
            return _context.EmployeeDepartments.Any(e => e.Id == id);
        }
        //Delete EmployeeDepartment
        [Route("EmployeeDepartment/{id}")]
        [HttpDelete]
        public async Task<ActionResult<EmployeeDepartment>> DeleteEmployeeDepartment(int id)
        {
            var dept = await _context.EmployeeDepartments.FindAsync(id);
            if (dept == null)
            {
                return BadRequest("EmployeeJobInfo does not exist");
            }
            _context.EmployeeDepartments.Remove(dept);
            await _context.SaveChangesAsync();

            return dept;
        }



        /*EMPLOYEE PAYROLL BENEFITS*/
        //Get all Employee Payroll Benefits
        [Route("EmployeePayrollBenefits")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EmployeePayrollBenefit>>> GetEmpPayBenefits(bool active, bool desc, int empId = 0, int jobId = 0, string? startDateFilter = "", string? benefitFilter = "", string? endDateFilter = "", string? benefitRateFilter = "", string? benefitAmountFilter = "", string? accountingCodeFilter = "", string? search = "", int skip = 0, int take = 10, string sortKey = "startDate")
        {
            List<EmployeePayrollBenefit> employeePayrollBenefits = new List<EmployeePayrollBenefit>();
            try
            {
                if (empId > 0 && jobId > 0)
                {
                    employeePayrollBenefits = await _context.EmployeePayrollBenefits.Include(x => x.benefitIHACDistribution).Where(b => b.empID == empId && b.jobDescriptionID == jobId).ToListAsync();
                }
                else if (empId > 0)
                {
                    employeePayrollBenefits = await _context.EmployeePayrollBenefits.Include(x => x.benefitIHACDistribution).Where(x => x.empID == empId).ToListAsync();
                }
                if (active)
                {
                    employeePayrollBenefits = employeePayrollBenefits.Where(x => x.endDAte == null).ToList();
                }
                else
                {
                    employeePayrollBenefits = employeePayrollBenefits.Where(x => x.endDAte != null).ToList();
                }

                foreach (var benefit in employeePayrollBenefits)
                {
                    benefit.accountingCode = await _context.AccountingCodes.Where(x => x.Id == benefit.Cac).Select(x => x.countyExpenseCode).FirstOrDefaultAsync();
                }

                if (!string.IsNullOrEmpty(startDateFilter))
                {
                    DateTime startDate;
                    if (DateTime.TryParse(startDateFilter, out startDate))
                    {
                        employeePayrollBenefits = employeePayrollBenefits.Where(x => x.startDate.HasValue && x.startDate.Value == startDate).ToList();
                    }
                }

                if (!string.IsNullOrEmpty(endDateFilter))
                {
                    DateTime endDate;
                    if (DateTime.TryParse(endDateFilter, out endDate))
                    {
                        employeePayrollBenefits = employeePayrollBenefits.Where(x => x.endDAte.HasValue && x.endDAte.Value == endDate).ToList();
                    }
                }

                //if (!string.IsNullOrEmpty(benefitFilter))
                //{
                //    employeePayrollBenefits = employeePayrollBenefits.Where(x => x.ben).ToList();
                //}
                if (!string.IsNullOrEmpty(benefitRateFilter))
                {
                    decimal benefitRate;
                    if (decimal.TryParse(benefitRateFilter, out benefitRate))
                    {
                        employeePayrollBenefits = employeePayrollBenefits.Where(x => x.benefitRate.HasValue && x.benefitRate.Value == benefitRate).ToList();
                    }
                }
                if (!string.IsNullOrEmpty(accountingCodeFilter))
                {
                    employeePayrollBenefits = employeePayrollBenefits.Where(x => !string.IsNullOrEmpty(x.accountingCode) && x.accountingCode.Contains(accountingCodeFilter)).ToList();
                }
                if (!string.IsNullOrEmpty(benefitAmountFilter))
                {
                    decimal benefitAmount;
                    if (decimal.TryParse(benefitRateFilter, out benefitAmount))
                    {
                        employeePayrollBenefits = employeePayrollBenefits.Where(x => x.benefitAmount.HasValue && x.benefitAmount.Value == benefitAmount).ToList();
                    }
                }


                if (!string.IsNullOrEmpty(search))
                {
                    search = search.Trim().ToLower();
                    employeePayrollBenefits = employeePayrollBenefits.Where(x =>
                    x.startDate.ToString().Contains(search)
                    || x.endDAte.ToString().Contains(search)
                    || x.benefitRate.ToString().Contains(search)
                    || x.benefitAmount.ToString().Contains(search)
                    || x.accountingCode.ToString().Contains(search)
                    ).ToList();
                }

                employeePayrollBenefits = employeePayrollBenefits.AsQueryable().OrderByCustom(sortKey, desc).ToList();

                var totalCount = employeePayrollBenefits.Count();
                if (take != 0)
                {
                    employeePayrollBenefits = employeePayrollBenefits.Skip(skip).Take(take).ToList();
                }

                return Ok(new { data = employeePayrollBenefits, Total = totalCount });
            }
            catch (Exception ex)
            {
                throw;
            }
            return employeePayrollBenefits;
        }
        //Get Employee Payroll benefits By PayDistID
        //[Route("EmployeePayrollBenefitsByPayDistId/{PayDistId}")]
        //[HttpGet]
        //public async Task<ActionResult<IEnumerable<EmployeePayrollBenefit>>> GetEmpPayBenefitsByPayDistID(int PayDistId)
        //{
        //    var benefits = await _context.EmployeePayrollBenefits.Include(x => x.benefitIHACDistribution).Where(b => b.payDistId == PayDistId).ToListAsync();
        //    foreach (var benefit in benefits)
        //    {
        //        benefit.accountingCode = await _fundContext.AccountingCodes.Where(x => x.Id == benefit.Cac).Select(x => x.countyExpenseCode).FirstOrDefaultAsync();
        //    }
        //    return Ok(benefits);
        //}

        //Get Employee Payroll Benefits by id
        [Route("EmployeePayrollBenefits/{id}")]
        [HttpGet]
        public async Task<ActionResult<EmployeePayrollBenefit>> GetEmpPayBenefitByID(int id)
        {
            var empbenifit = await _context.EmployeePayrollBenefits.Include(x => x.benefitIHACDistribution).Where(x => x.Id == id).FirstOrDefaultAsync();
            if (empbenifit == null)
            {
                return BadRequest("EmployeePayrollBenefit does not exist");
            }
            return Ok(empbenifit);
        }
        //Add  Employee Payroll Benefits
        [Route("EmployeePayrollBenefits")]
        [HttpPost]
        public async Task<ActionResult<EmployeePayrollBenefit>> AddEmpPayBenefit(EmployeePayrollBenefit empbenefit)
        {
            try
            {
                if (empbenefit == null || empbenefit.benefitIHACDistribution == null)
                {
                    return BadRequest("EmployeePayrollBenefit does not exist");
                }
                if (empbenefit.benefitId != 0 && empbenefit.benefitPachakeId != 0)
                {
                    return BadRequest("Benefit Id and BenefitPackage Id does not exists ");
                }
                if (empbenefit.Cac == null)
                {
                    empbenefit.Cac = 0;
                }
                if (empbenefit.benefitIHACDistribution != null)
                {
                    if (empbenefit.benefitIHACDistribution.cacId == null)
                    {
                        empbenefit.benefitIHACDistribution.cacId = 0;
                    }
                    else
                    {
                        //empbenefit.Cac = empbenefit.benefitIHACDistribution.cacId;
                    }
                }

                if (empbenefit.benefitId != 0)
                {
                    if (await _context.EmployeePayrollBenefits.AnyAsync(x => x.benefitIHACDistribution.payDistId == empbenefit.benefitIHACDistribution.payDistId && x.benefitId == empbenefit.benefitId && x.Cac == empbenefit.Cac))
                    {
                        return BadRequest("Benefit with same Cac already exists for the distribution.");
                    }

                    empbenefit.OrgAccountId = OrgAccountId;
                    empbenefit.benefitIHACDistribution.OrgAccountId = OrgAccountId;
                    var payDist = await _context.PayrollDistributions.FirstOrDefaultAsync(x => x.Id == empbenefit.benefitIHACDistribution.payDistId);

                    if (payDist.jobDescriptionID.HasValue)
                        empbenefit.jobDescriptionID = payDist.jobDescriptionID.Value;

                    _context.EmployeePayrollBenefits.Add(empbenefit);
                }
                else if (empbenefit.benefitPachakeId != 0)
                {
                    var payDist = await _context.PayrollDistributions.FirstOrDefaultAsync(x => x.Id == empbenefit.benefitIHACDistribution.payDistId);

                    if (payDist.jobDescriptionID.HasValue)
                        empbenefit.jobDescriptionID = payDist.jobDescriptionID.Value;

                    List<EmployeePayrollBenefit> benefits = new List<EmployeePayrollBenefit>();
                    List<BenefitPackageBenefitLink> benefitLinks = await _context.BenefitPackageBenefitLinks.Where(x => x.macroNameId == empbenefit.benefitPachakeId && x.OrgAccountId == OrgAccountId).ToListAsync();

                    var benefitIds = benefitLinks.Select(x => x.bennyId).ToList();
                    var activeBenefits = await _context.Benefits.Where(x => benefitIds.Contains(x.Id) && !x.inactive).ToListAsync();

                    foreach (var benefitLink in benefitLinks)
                    {
                        var activeBenefit = activeBenefits.FirstOrDefault(x => x.Id == benefitLink.bennyId);
                        if (activeBenefit != null)
                        {
                            EmployeePayrollBenefit employeePayrollBenefit = new EmployeePayrollBenefit();
                            employeePayrollBenefit.empID = empbenefit.empID;
                            employeePayrollBenefit.startDate = empbenefit.startDate;
                            employeePayrollBenefit.benefitId = benefitLink.bennyId;
                            employeePayrollBenefit.jobDescriptionID = empbenefit.jobDescriptionID;
                            employeePayrollBenefit.OrgAccountId = OrgAccountId;
                            employeePayrollBenefit.Cac = benefitLink.cacId;
                            employeePayrollBenefit.benefitAmount = activeBenefit.amount;
                            employeePayrollBenefit.benefitRate = activeBenefit.benefitsPercent;

                            BenefitIHACDistribution benefitIHACDistribution = new BenefitIHACDistribution();

                            benefitIHACDistribution.benefitNo = empbenefit.benefitNo;
                            benefitIHACDistribution.payDistId = payDist.Id;
                            benefitIHACDistribution.cacId = benefitLink.cacId;
                            benefitIHACDistribution.OrgAccountId = OrgAccountId;
                            employeePayrollBenefit.benefitIHACDistribution = benefitIHACDistribution;
                            benefitIHACDistribution.benId = employeePayrollBenefit.Id;
                            benefits.Add(employeePayrollBenefit);
                        }
                    }
                    _context.EmployeePayrollBenefits.AddRange(benefits);
                }
                else
                {
                    return BadRequest("Request object in not correct");
                }
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                throw;
            }
            //return Ok();
            return empbenefit;
        }
        //UpdateEmployee Payroll Benefits
        [Route("EmployeePayrollBenefits/{id}")]
        [HttpPut]
        public async Task<IActionResult> UpdateEmpPayBenefit(int id, EmployeePayrollBenefit empbenefit)
        {
            if (id != empbenefit.Id)
            {
                return BadRequest("EmployeePayrollBenefit does not match with id");
            }
            var empBenefitRef = await _context.EmployeePayrollBenefits.Include(x => x.benefitIHACDistribution).FirstOrDefaultAsync(x => x.Id == id);
            if (empBenefitRef == null)
            {
                return BadRequest("EmployeePayrollBenefit does not exist");
            }

            if (await _context.EmployeePayrollBenefits.AnyAsync(x => x.Id != id && x.benefitIHACDistribution.payDistId == empbenefit.benefitIHACDistribution.payDistId && x.benefitId == empbenefit.benefitId && x.Cac == empbenefit.Cac))
            {
                return BadRequest("Benefit with same Cac already exists for the distribution.");
            }

            //if (empbenefit.benefitIHACDistribution != null)
            //    empbenefit.benefitIHACDistribution.OrgAccountId = OrgAccountId;
            empbenefit.createdDate = empBenefitRef.createdDate;
            empbenefit.createdBy = empBenefitRef.createdBy;
            //empbenefit.OrgAccountId = OrgAccountId;
            empbenefit.jobDescriptionID = empBenefitRef.jobDescriptionID;
            if (empBenefitRef.benefitIHACDistribution == null)
                empBenefitRef.benefitIHACDistribution = new BenefitIHACDistribution();
            empBenefitRef.benefitIHACDistribution.benefitNo = empbenefit.benefitNo;
            empBenefitRef.benefitIHACDistribution.IHAC = empbenefit.benefitIHACDistribution?.IHAC ?? "";
            empBenefitRef.benefitIHACDistribution.cacId = empbenefit.Cac;
            empbenefit.benefitIHACDistribution = empBenefitRef.benefitIHACDistribution;
            _context.EmployeePayrollBenefits.Entry(empBenefitRef).State = EntityState.Detached;
            _context.EmployeePayrollBenefits.Update(empbenefit);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!EmpPayBenefitExists(id))
                {
                    return BadRequest("EmployeePayrollBenefit does not exist");
                }

                else
                {
                    throw;
                }
            }
            catch (Exception ex)
            {
                throw;
            }
            //  return Ok();
            return CreatedAtAction("GetEmpPayBenefitByID", new { id = empbenefit.Id }, empbenefit);


        }

        [Route("EmployeePayrollBenefits/UpdateStaus/{id}/{inactive}")]
        [HttpPut]
        public async Task<IActionResult> UpdateEmpPayBenefitStatus(int id, bool inactive)
        {
            var empBenefitRef = await _context.EmployeePayrollBenefits.FirstOrDefaultAsync(x => x.Id == id);
            if (empBenefitRef == null)
            {
                return BadRequest("EmployeePayrollBenefit does not exist");
            }
            if (inactive)
            {
                empBenefitRef.endDAte = DateTime.Now;
            }
            else
            {
                empBenefitRef.endDAte = null;
            }
            _context.EmployeePayrollBenefits.Update(empBenefitRef);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!EmpPayBenefitExists(id))
                {
                    return BadRequest("EmployeePayrollBenefit does not exist");
                }

                else
                {
                    throw;
                }
            }
            catch (Exception ex)
            {
                throw;
            }
            //  return Ok();
            return CreatedAtAction("GetEmpPayBenefitByID", new { id = empBenefitRef.Id }, empBenefitRef);

        }
        private bool EmpPayBenefitExists(int id)
        {
            return _context.EmployeePayrollBenefits.Any(e => e.Id == id);
        }
        //Delete Employee Payroll Benefits
        [Route("EmployeePayrollBenefits/{id}")]
        [HttpDelete]
        public async Task<ActionResult<EmployeePayrollBenefit>> DeleteEmpPAyBenefit(int id)
        {
            var empbenefit = _context.EmployeePayrollBenefits.FirstOrDefault();
            if (empbenefit == null)
            {
                return BadRequest("EmployeePayrollBenefit does not exist");
            }
            _context.EmployeePayrollBenefits.Remove(empbenefit);
            await _context.SaveChangesAsync();
            return empbenefit;
        }



        /* Pay Distributions*/
        // Get All Pay distributions
        [Route("PayrollDistribution")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PayrollDistribution>>> GetPayDistribution(bool active, bool desc, DateTime? startDate = null, DateTime? endDate = null, string? jobName = "", string? cac = "", string? ihac = "", string? sac = "", string? flatRateNoHours = "", string? percentage = "", string sortKey = "jobName", int empId = 0, int jobId = 0, string? search = "", int skip = 0, int take = 10)
        {
            List<PayrollDistribution> distributions = new List<PayrollDistribution>();
            if (empId > 0 && jobId > 0)
            {
                distributions = await _context.PayrollDistributions.Where(d => d.OrgAccountId == OrgAccountId && d.empID == empId && d.jobDescriptionID == jobId).ToListAsync();

            }
            else if (empId > 0)
            {
                //var empJobInfos = await _context.EmployeeJobInfos.Where(x => x.empId == empId).Select(x => x.Id).ToListAsync();
                distributions = await _context.PayrollDistributions.Where(d => d.OrgAccountId == OrgAccountId && d.empID == empId && d.jobDescriptionID.HasValue).ToListAsync();
            }

            var primaryJob = await _context.Salaries.Where(x => x.empId == empId && x.endDate == null).FirstOrDefaultAsync();


            if (distributions.Count > 0)
            {
                foreach (var distribution in distributions)
                {
                    if (primaryJob != null && primaryJob.jobDescId == distribution.jobDescriptionID)
                        distribution.primaryJob = true;

                    //var jobInfo = await _context.Salaries.Where(x => x.empId == distribution.jobDescriptionID).FirstOrDefaultAsync();
                    if (distribution.jobDescriptionID.HasValue)
                    {
                        distribution.jobName = await _context.PayrollJobDescriptions.Where(j => j.Id == distribution.jobDescriptionID.Value).Select(j => j.empJobDescription).FirstOrDefaultAsync();
                    }
                }
            }
            if (active)
                distributions = distributions.Where(x => x.endDate == null).ToList();
            else
                distributions = distributions.Where(x => x.endDate != null).ToList();

            if (!string.IsNullOrEmpty(search))
            {
                search = search.Trim().ToLower();
                distributions = distributions.Where(x => x.jobName.ToLower().Contains(search)
                || x.startDate.ToString().Contains(search)
                || x.endDate.ToString().Contains(search)
                || x.cac.ToString().Contains(search)
                || x.ihac.ToString().Contains(search)
                || x.sac.ToString().Contains(search)
                || x.flatRateNoHours.ToString().Contains(search)
                || x.percentage.ToString().Contains(search)
                ).ToList();
            }
            if (startDate.HasValue)
                distributions = distributions.Where(x => x.startDate == startDate).ToList();
            if (endDate.HasValue)
                distributions = distributions.Where(x => x.endDate == endDate).ToList();
            if (!string.IsNullOrEmpty(jobName))
            {
                jobName = jobName.Trim().ToLower();
                distributions = distributions.Where(x => x.jobName.Contains(jobName)).ToList();
            }
            if (!string.IsNullOrEmpty(cac))
                distributions = distributions.Where(x => x.cac.ToString().Contains(cac)).ToList();
            if (!string.IsNullOrEmpty(ihac))
                distributions = distributions.Where(x => x.ihac.ToString().Contains(ihac)).ToList();
            if (!string.IsNullOrEmpty(sac))
                distributions = distributions.Where(x => x.sac.ToString().Contains(sac)).ToList();
            if (!string.IsNullOrEmpty(percentage))
                distributions = distributions.Where(x => x.percentage.ToString().Contains(percentage)).ToList();
            if (!string.IsNullOrEmpty(flatRateNoHours))
                distributions = distributions.Where(x => x.flatRateNoHours.ToString().Contains(flatRateNoHours)).ToList();

            distributions = distributions.AsQueryable().OrderByCustom(sortKey, desc).ToList();

            var totalCount = distributions.Count();
            if (take != 0)
            {
                distributions = distributions.Skip(skip).Take(take).ToList();
            }

            if (distributions.Any())
            {
                var cacIds = distributions.Where(x => x.cac.HasValue).Select(x => x.cac).ToList();

                var cacCodes = await _context.AccountingCodes
                    .Where(x => cacIds.Contains(x.Id))
                    .Select(x => new { Id = x.Id, cac = x.countyExpenseCode })
                    .ToListAsync();

                foreach (var distribution in distributions)
                {
                    distribution.AccountingCode = cacCodes.Where(x => x.Id == distribution.cac).Select(x => x.cac).FirstOrDefault();
                }
            }

            //var pagedResult =  distributions.ToListAsync();
            return Ok(new { data = distributions, Total = totalCount });
        }
        // Get  Pay distributions by JobId
        [Route("PayrollDistributionByJobId/{JobId}")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PayrollDistribution>>> GetPayDistributionByJobId(int JobId)
        {
            List<PayrollDistribution> distributions = await _context.PayrollDistributions.Where(d => d.OrgAccountId == OrgAccountId && d.empID == JobId).ToListAsync();
            if (distributions.Count < 0)
            {
                BadRequest("PayrollDistribution does not exist");
            }
            foreach (var distribution in distributions)
            {
                //var jobInfo = await _context.EmployeeJobInfos.Where(x => x.Id == distribution.jobId).FirstOrDefaultAsync();
                if (distribution.jobDescriptionID.HasValue)
                {
                    distribution.jobName = await _context.PayrollJobDescriptions.Where(j => j.Id == distribution.jobDescriptionID.Value).Select(j => j.empJobDescription).FirstOrDefaultAsync();
                    distribution.AccountingCode = await _context.AccountingCodes.Where(x => x.Id == distribution.cac).Select(x => x.countyExpenseCode).FirstOrDefaultAsync();
                }
            }
            return distributions;
        }

        //Get Pay Distribution By ID
        [Route("PayrollDistribution/{id}")]
        [HttpGet]
        public async Task<ActionResult<PayrollDistribution>> GetPayrollDistributionByID(int id)
        {
            var distribution = await _context.PayrollDistributions.FirstOrDefaultAsync(d => d.OrgAccountId == OrgAccountId && d.Id == id);
            if (distribution == null)
            {
                return BadRequest("PayrollDistribution does not exist");
            }
            //var jobInfo = await _context.EmployeeJobInfos.Where(x => x.Id == distribution.jobId).FirstOrDefaultAsync();
            if (distribution.jobDescriptionID.HasValue)
            {
                distribution.jobName = await _context.PayrollJobDescriptions.Where(j => j.Id == distribution.jobDescriptionID.Value).Select(j => j.empJobDescription).FirstOrDefaultAsync();
            }
            return Ok(distribution);
        }
        //Get PayDistribution By EMPID
        /* [Route("PayDistribution/{EmpId}")]
         [HttpGet]
         public async Task<ActionResult<IEnumerable<PayrollDistribution>>> GetPayDistributionByEmpID(int EmpId)
         {
             List<PayrollDistribution> distributions = await _context.PayrollDistributions.Where(d => d.OrgAccountId == OrgAccountId && d.employeeId == EmpId).ToListAsync();
             if (distributions.Count == 0)
             {
                 return BadRequest("PayrollDistribution does not exist");
             }
             foreach (var distribution in distributions)
             {
                 distribution.jobName = await _defaultsContext.PayrollJobDescriptions.Where(j => j.Id == distribution.jobId).Select(j => j.empJobDescription).FirstOrDefaultAsync();
             }
             return Ok(distributions);
         }*/

        //Add new Pay distributions
        [Route("PayrollDistribution")]
        [HttpPost]
        public async Task<ActionResult<PayrollDistribution>> AddPayrollDistribution(PayrollDistribution distribution)
        {
            try
            {
                distribution.OrgAccountId = OrgAccountId;

                if (distribution == null)
                {
                    return BadRequest("PayrollDistribution can't be null");
                }

                if (distribution.percentage.HasValue)
                {
                    var currentPercentData = _context.PayrollDistributions.Where(x => x.empID == distribution.empID && x.jobDescriptionID == distribution.jobDescriptionID && x.percentage.HasValue && x.activeJob).Select(x => x.percentage).ToList();
                    decimal? totalPercent = 0;
                    if (currentPercentData.Any())
                        totalPercent = currentPercentData.Sum(x => x);

                    totalPercent += distribution.percentage;
                    if (totalPercent > 100)
                        return BadRequest("Percent by job description cannot go above 100");

                    //if (totalPercent < 100)
                    //{
                    //    PayrollDistribution payrollDistributionBalance = distribution.DeepCopy();
                    //    payrollDistributionBalance.percentage = 100 - totalPercent;
                    //    _context.PayrollDistributions.Add(payrollDistributionBalance);
                    //}
                }
                distribution.deleted = false;
                _context.PayrollDistributions.Add(distribution);
                await _context.SaveChangesAsync();
                // return Ok();
                return CreatedAtAction("GetPayrollDistributionByID", new { id = distribution.Id }, distribution);
            }
            catch (Exception ex)
            {
                throw;
            }
        }
        //Update PayDistributions
        [Route("PayrollDistribution/{id}")]
        [HttpPut]
        public async Task<IActionResult> UpdatePayrollDistribution(int id, PayrollDistribution distribution)
        {
            if (id != distribution.Id)
            {
                return BadRequest("PayrollDistribution does not match with id");
            }
            var distRef = await _context.PayrollDistributions.FindAsync(id);
            if (distRef == null)
            {
                return BadRequest("PayrollDistribution does not exist");
            }
            if (distribution.percentage.HasValue)
            {
                var currentPercentData = _context.PayrollDistributions.Where(x => x.Id != distribution.Id && x.empID == distribution.empID && x.jobDescriptionID == distribution.jobDescriptionID && x.percentage.HasValue && x.activeJob).Select(x => x.percentage).ToList();
                decimal? totalPercent = 0;
                if (currentPercentData.Any())
                    totalPercent = currentPercentData.Sum(x => x);

                totalPercent += distribution.percentage;
                if (totalPercent > 100)
                    return BadRequest("Percent by job description cannot go above 100");

                //if (totalPercent < 100) {
                //    PayrollDistribution payrollDistributionBalance = distRef.DeepCopy();
                //    payrollDistributionBalance.percentage = 100 - totalPercent;
                //    _context.PayrollDistributions.Add(payrollDistributionBalance);
                //}
            }
            distRef.lineRate = distribution.lineRate;
            distRef.percentage = distribution.percentage;
            distRef.cac = distribution.cac;
            distRef.ihac = distribution.ihac;
            distRef.sac = distribution.sac;
            distRef.defaultJob = distribution.defaultJob;
            distRef.activeJob = distribution.activeJob;
            distRef.benSac = distribution.benSac;
            distRef.benIhac = distribution.benIhac;
            distRef.jobClass = distribution.jobClass;
            distRef.vaca = distribution.vaca;
            distRef.noBenefits = distribution.noBenefits;
            distRef.transcacId = distribution.transcacId;
            distRef.deleted = distribution.deleted;
            distRef.notUsedInRegHours = distribution.notUsedInRegHours;
            distRef.vacaPayout = distribution.vacaPayout;
            distRef.sickPayout = distribution.sickPayout;
            distRef.sick = distribution.sick;
            distRef.touchScreenClock = distribution.touchScreenClock;
            distRef.flatRateNoHours = distribution.flatRateNoHours;
            distRef.showOnPayReport = distribution.showOnPayReport;
            distRef.startDate = distribution.startDate;
            distRef.endDate = distribution.endDate;
            distRef.distributionName = distribution.distributionName;
            distRef.vacaStartDate = distribution.vacaStartDate;

            _context.PayrollDistributions.Update(distRef);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)

            {
                if (!PayrollDistributionExists(id))
                {
                    return BadRequest("PayrollDistribution does not exist");
                }

                else
                {
                    throw;
                }
            }
            //  return Ok();
            return CreatedAtAction("GetPayrollDistributionByID", new { id = distribution.Id }, distribution);

        }
        private bool PayrollDistributionExists(int id)
        {
            return _context.PayrollDistributions.Any(e => e.Id == id && e.OrgAccountId == OrgAccountId);
        }

        //Delete PayrollDistribution
        [Route("PayrollDistribution/{id}")]
        [HttpDelete]
        public async Task<ActionResult<PayrollDistribution>> DeletePayrollDistribution(int id)
        {
            var distribution = await _context.PayrollDistributions.FirstOrDefaultAsync(d => d.OrgAccountId == OrgAccountId && d.Id == id);

            if (distribution == null)
            {
                return BadRequest("PayrollDistribution does not exist");
            }

            _context.PayrollDistributions.Remove(distribution);
            await _context.SaveChangesAsync();

            return distribution;
        }



        /*EMPLOYEE PAYROLL SETUP*/
        //Get all Employee Payroll Setup 
        [Route("EmployeePayrollSetup")]
        [HttpGet]
        public async Task<ActionResult> GetEmpPaySetup(bool desc= false, string sortKey = "Employee.firstName", int? empId = null, string? firstNameFilter = "", string? lastNameFilter
 = "", string? employeeNumberFilter = "", string? activeIND = "", string? dateOfBirthFilter = "", string? emailAddressFilter = "", string? search = "", string? createdDateFilter = "", string? createdByFilter = "", string? modifyDateFilter = "", string? modifyByFilter = "", string? fullNameFilter = "", int skip = 0, int take = 10)
      {
            try
            {
                var list = _context.EmployeePayrollSetups
                    .Include(x => x.Employee)
                    .Where(p => p.OrgAccountId == OrgAccountId);

                if (!string.IsNullOrEmpty(activeIND))
                    list = list.Where(x => x.Employee.activeInd == activeIND);

                if (!string.IsNullOrEmpty(search))
                {
                    search = search.ToLower();
                    list = list.Where(p => (string.IsNullOrEmpty(search) ||
                                      p.Employee.firstName.ToLower().ToLower().Contains(search) ||
                                      p.Employee.lastName.ToLower().Contains(search) ||
                                      (!string.IsNullOrEmpty(p.Employee.employeeNumber) && p.Employee.employeeNumber.ToLower().Contains(search)) ||
                                      (p.Employee.dateOfBirth.HasValue && p.Employee.dateOfBirth.Value.ToString().Contains(search)) ||
                                      p.Employee.emailAddress.ToLower().Contains(search)
                                  ));
                }
                if (empId != null)
                {
                    list = list.Where(p => p.empId == empId.Value);
                }

                if (!string.IsNullOrEmpty(fullNameFilter))
                {
                    fullNameFilter = fullNameFilter.ToLower();
                    list = list.Where(p => (p.Employee.lastName + ", " + p.Employee.firstName).ToLower().Contains(fullNameFilter));
                }

                if (!string.IsNullOrEmpty(lastNameFilter))
                {
                    lastNameFilter = lastNameFilter.ToLower();
                    list = list.Where(p => p.Employee.lastName.ToLower().Contains(lastNameFilter));
                }

                if (!string.IsNullOrEmpty(firstNameFilter))
                {
                    firstNameFilter = firstNameFilter.ToLower();
                    list = list.Where(p => p.Employee.firstName.ToLower().Contains(firstNameFilter));
                }
                if (!string.IsNullOrEmpty(employeeNumberFilter))
                {
                    employeeNumberFilter = employeeNumberFilter.ToLower();
                    list = list.Where(p => p.Employee.employeeNumber != null && p.Employee.employeeNumber.ToLower().Contains(employeeNumberFilter));
                }
                if (!string.IsNullOrEmpty(emailAddressFilter))
                {
                    emailAddressFilter = emailAddressFilter.ToLower();
                    list = list.Where(p => p.Employee.emailAddress.ToLower().Contains(emailAddressFilter));
                }
                if (!string.IsNullOrEmpty(dateOfBirthFilter))
                {
                    DateTime formatDate;
                    if (DateTime.TryParse(dateOfBirthFilter, out formatDate))
                    {
                        list = list.Where(x => x.Employee != null && x.Employee.dateOfBirth.HasValue && x.Employee.dateOfBirth.Value.Date == formatDate);
                    }
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
        //Get Employee Payroll setup by Id
        [Route("EmployeePayrollSetup/{id}")]
        [HttpGet]
        public async Task<ActionResult<EmployeePayrollSetup>> GetEmpPaySetupByID(int id)
        {
            var paysetup = await _context.EmployeePayrollSetups.FindAsync(id);
            if (paysetup == null)
            {
                return BadRequest("EmployeePayrollSetup does not exist");
            }
            return Ok(paysetup);
        }
        //Add new  Employee Payroll Setup
        [Route("EmployeePayrollSetup")]
        [HttpPost]
        public async Task<ActionResult<EmployeePayrollSetup>> AddEmpPaySetup(EmployeePayrollSetup payrollSetup)
        {
            try
            {
                if (payrollSetup == null)
                {
                    return BadRequest("EmployeePayrollSetup can't be null");
                }
                var checkempPayroll = await _context.EmployeePayrollSetups.FirstOrDefaultAsync(x => x.empId == payrollSetup.empId);
                if (checkempPayroll != null)
                {
                    return BadRequest("Selected employee's payroll already exist");
                }

                payrollSetup.OrgAccountId = OrgAccountId;
                await _context.EmployeePayrollSetups.AddAsync(payrollSetup);
                await _context.SaveChangesAsync();
                return CreatedAtAction("GetEmpPaySetupByID", new { id = payrollSetup.Id }, payrollSetup);
            }
            catch (Exception ex)
            {
                return BadRequest("Failed to save employee payroll");
            }
        }
        //Update Employee Payroll Setup
        [Route("EmployeePayrollSetup/{id}")]
        [HttpPut]
        public async Task<IActionResult> UpdateEmpPaySetup(int id, EmployeePayrollSetup paysetup)
        {
            if (id != paysetup.Id)
            {
                return BadRequest("PayrollDistribution does not match with id");
            }
            var empSetupRef = await _context.EmployeePayrollSetups.FindAsync(id);
            if (empSetupRef == null)
            {
                return BadRequest("EmployeePayrollSetup does not exist");
            }
            paysetup.createdBy = empSetupRef.createdBy;
            paysetup.createdDate = empSetupRef.createdDate;
            _context.EmployeePayrollSetups.Entry(empSetupRef).State = EntityState.Detached;
            _context.EmployeePayrollSetups.Update(paysetup);

            var activeSalary = await _context.Salaries.FirstOrDefaultAsync(x => x.empId == paysetup.empId && !x.endDate.HasValue);
            var payType = await _context.CodeValues.FirstOrDefaultAsync(x => x.Id == paysetup.empPayType);

            if (activeSalary != null && payType.value.ToLower() == "hourly")
            {
                activeSalary.payDaySalary = 0;
                _context.Salaries.Update(activeSalary);
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)

            {
                if (!PaysetupExists(id))
                {
                    return BadRequest("EmployeePayrollSetup does not exist");
                }

                else
                {
                    throw;
                }
            }
            //  return Ok();
            return CreatedAtAction("GetEmpPaySetupByID", new { id = paysetup.Id }, paysetup);

        }
        private bool PaysetupExists(int id)
        {
            return _context.EmployeePayrollSetups.Any(e => e.Id == id);
        }
        //Delete Employee Payroll setup
        [Route("EmployeePayrollSetup/{id}")]
        [HttpDelete]
        public async Task<ActionResult<EmployeePayrollSetup>> DeleteEmpPaySetup(int id)
        {
            var paysetup = await _context.EmployeePayrollSetups.FindAsync(id);
            if (paysetup == null)
            {
                return BadRequest("EmployeePayrollSetup does not exist");
            }
            _context.EmployeePayrollSetups.Remove(paysetup);
            await _context.SaveChangesAsync();

            return paysetup;
        }
        /*Pre Year Starting Balance*/
        //Get all Pre Year Starting Balances
        [Route("PreYearStartingBalance")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PreYearStartingBalance>>> GetAllStartingBalances()
        {
            return await _context.PreYearStartingBalances.Where(p => p.OrgAccountId == OrgAccountId).ToListAsync();
        }
        //Get Pre Year Starting Years By Id
        [Route("PreYearStartingBalance/{id}")]
        [HttpGet]
        public async Task<ActionResult<PreYearStartingBalance>> GetStartingYearsById(int id)
        {
            var startyear = await _context.PreYearStartingBalances.FirstOrDefaultAsync(s => s.OrgAccountId == OrgAccountId && s.Id == id);
            if (startyear == null)
            {
                return BadRequest("PreYearStartingBalance does not exist");
            }
            return Ok(startyear);
        }
        [Route("PreYearStartingBalanceByEmpId/{empId}")]
        [HttpGet]
        public async Task<ActionResult<List<PreYearStartingBalance>>> PreYearStartingBalanceByEmpId(int empId, bool active, bool desc, string sortKey = "date", string? startDateFilter = "", string? endDateFilter = "", string? vacationBalanceFilter = "", string? sickBalanceFilter = "", string? personalBalanceFilter = "", string? compBalanceFilter = "", string? search = "", int skip = 0, int take = 10)
        {
            var startyear = _context.PreYearStartingBalances
                .Where(s => s.OrgAccountId == OrgAccountId && s.empId == empId);
            if (active)
                startyear = startyear.Where(x => !x.endDate.HasValue);

            if (!string.IsNullOrEmpty(startDateFilter))
            {
                DateTime startDate;
                if (DateTime.TryParse(startDateFilter, out startDate))
                {
                    startyear = startyear.Where(x => x.date.HasValue && x.date.Value == startDate);
                }
            }
            if (!string.IsNullOrEmpty(endDateFilter))
            {
                DateTime endDate;
                if (DateTime.TryParse(endDateFilter, out endDate))
                {
                    startyear = startyear.Where(x => x.endDate.HasValue && x.endDate.Value == endDate);
                }
            }
            if (!string.IsNullOrEmpty(vacationBalanceFilter))
            {
                decimal formatValue;
                if (decimal.TryParse(vacationBalanceFilter, out formatValue))
                {
                    startyear = startyear.Where(x => x.vacBal == formatValue);
                }
            }
            if (!string.IsNullOrEmpty(sickBalanceFilter))
            {
                decimal formatValue;
                if (decimal.TryParse(sickBalanceFilter, out formatValue))
                {
                    startyear = startyear.Where(x => x.sickBal == formatValue);
                }
            }
            if (!string.IsNullOrEmpty(personalBalanceFilter))
            {
                decimal formatValue;
                if (decimal.TryParse(personalBalanceFilter, out formatValue))
                {
                    startyear = startyear.Where(x => x.personalBalance == formatValue);
                }
            }
            if (!string.IsNullOrEmpty(compBalanceFilter))
            {
                decimal formatValue;
                if (decimal.TryParse(compBalanceFilter, out formatValue))
                {
                    startyear = startyear.Where(x => x.compBal == formatValue);
                }
            }
            if (!string.IsNullOrEmpty(search))
            {
                search = search.Trim().ToLower();
                if (!string.IsNullOrEmpty(search))
                {
                    search = search.Trim().ToLower();
                    startyear = startyear.Where(x =>
                    x.date.ToString().Contains(search)
                    || x.endDate.ToString().Contains(search)
                    || x.vacBal.ToString().Contains(search)
                    || x.compBal.ToString().Contains(search)
                    || x.sickBal.ToString().Contains(search)
                    || x.personalBalance.ToString().Contains(search)
                    );
                }
            }

            startyear = startyear.AsQueryable().OrderByCustom(sortKey, desc);

            var pagedResult = await startyear.ToListAsync();

            var totalCount = pagedResult.Count();
            if (take != 0)
            {
                pagedResult = pagedResult.Skip(skip).Take(take).ToList();
            }

            return Ok(new { data = pagedResult, Total = totalCount });
        }

        //Add New Pre year Starting Balance
        [Route("PreYearStartingBalance")]
        [HttpPost]
        public async Task<ActionResult<PreYearStartingBalance>> AddPreYearStartBalance(PreYearStartingBalance startyear)
        {
            startyear.OrgAccountId = OrgAccountId;
            if (startyear == null)
            {
                return BadRequest("PreYearStartingBalance can't be null");
            }
            await _context.PreYearStartingBalances.AddAsync(startyear);
            await _context.SaveChangesAsync();
            // return Ok();
            return CreatedAtAction("GetStartingYearsById", new { id = startyear.Id }, startyear);
        }
        //Update Pre Year Starting Balance
        [Route("PreYearStartingBalance/{id}")]
        [HttpPut]
        public async Task<IActionResult> UpdateStartingBalance(int id, PreYearStartingBalance startingBalance)
        {
            if (id != startingBalance.Id)
            {
                return BadRequest("PreYearStartingBalance does not match with id");
            }
            var balanceRef = await _context.PreYearStartingBalances.FindAsync(id);
            if (balanceRef == null)
            {
                return BadRequest("Startingbalance does not exist");
            }
            startingBalance.createdDate = balanceRef.createdDate;
            startingBalance.createdBy = balanceRef.createdBy;
            _context.PreYearStartingBalances.Entry(balanceRef).State = EntityState.Detached;
            startingBalance.OrgAccountId = OrgAccountId;
            _context.PreYearStartingBalances.Update(startingBalance);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)

            {
                if (!PreStartBalExists(id))
                {
                    return BadRequest("PreYearStartingBalance does not exist");
                }

                else
                {
                    throw;
                }
            }
            //  return Ok();
            return CreatedAtAction("GetStartingYearsById", new { id = startingBalance.Id }, startingBalance);


        }
        private bool PreStartBalExists(int id)
        {
            return _context.PreYearStartingBalances.Any(e => e.Id == id);
        }
        //Delete PreYear Starting Balance
        [Route("PreYearStartingBalance/{id}")]
        [HttpDelete]
        public async Task<ActionResult<PreYearStartingBalance>> DeleteStartingBalance(int id)
        {
            var startbal = await _context.PreYearStartingBalances.FirstOrDefaultAsync(s => s.OrgAccountId == OrgAccountId && s.Id == id);
            if (startbal == null)
            {
                return BadRequest("PreYearStartingBalance does not exist");
            }
            _context.PreYearStartingBalances.Remove(startbal);
            await _context.SaveChangesAsync();
            return Ok(startbal);
        }
        /*SALARIES*/
        //Get all salaries
        [Route("Salary")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Salaries>>> GetallSalaries()
        {
            return await _context.Salaries.Where(x => x.OrgAccountId == OrgAccountId).ToListAsync();
        }
        //Get salaries by id
        [Route("SalaryByDist/{payDistId}")]
        [HttpGet]
        public async Task<ActionResult<Salaries>> GetsalariesByDistribution(int payDistId)
        {
            //var distribution = await _context.PayrollDistributions.Where(x => x.jobId == payDistId).Select(x => x.Id).ToListAsync();
            var salary = await _context.Salaries.Where(x => x.Id == payDistId).FirstOrDefaultAsync();
            if (salary == null)
            {
                return BadRequest("Salaries does not exist");
            }
            return Ok(salary);
        }
        [Route("Salary/{id}")]
        [HttpGet]
        public async Task<ActionResult<Salaries>> GetsalariesByID(int id)
        {
            var salary = await _context.Salaries.FindAsync(id);
            if (salary == null)
            {
                return BadRequest("Salaries does not exist");
            }
            return Ok(salary);
        }
        //Add new  Salary
        [Route("EmployeeJobInfo")]
        [HttpPost]
        public async Task<ActionResult<Salaries>> AddSalaries(Salaries salary)
        {
            if (salary == null)
            {
                return BadRequest("Salaries can't be null");
            }

            if (!salary.jobDescId.HasValue || salary.jobDescId == 0)
            {
                return BadRequest("Job Id required");
            }

            if (!salary.startDate.HasValue)
            {
                return BadRequest("Start date is required");
            }

            if (salary.endDate.HasValue && salary.endDate <= salary.startDate)
            {
                return BadRequest("End date must be greater than start data");
            }

            //if (salary.endDate.HasValue) 
            //{
            var prePrimaryJobs = _context.Salaries.Where(x => x.empId == salary.empId && x.endDate == null);

            foreach (var primaryJob in prePrimaryJobs)
            {
                primaryJob!.endDate = DateTime.Now;
                _context.Salaries.Update(primaryJob);
            }
            //}

            salary.OrgAccountId = OrgAccountId;

            var userSalary = _context.Salaries.Add(salary);
            await _context.SaveChangesAsync();
            if (salary.endDate == null)
            {
                var empData = await _context.EmployeePayrollSetups.FirstOrDefaultAsync(x => x.empId == salary.empId);
                empData.jobID = salary.jobDescId;
            }
            await _context.SaveChangesAsync();
            return CreatedAtAction("GetsalariesByID", new { id = salary.Id }, salary);
        }
        //Update Salary
        [Route("Salary/{id}")]
        [HttpPut]
        public async Task<IActionResult> UpdateSalary(int id, Salaries salary)
        {
            if (id != salary.Id)
            {
                return BadRequest("Salaries does not match with id");
            }
            var salaryRef = await _context.Salaries.FindAsync(id);
            if (salaryRef == null)
            {
                return BadRequest("Salary does not exist");
            }
            salary.createdBy = salaryRef.createdBy;
            salary.createdDate = salaryRef.createdDate;
            _context.Salaries.Entry(salaryRef).State = EntityState.Detached;
            salary.OrgAccountId = OrgAccountId;
            _context.Salaries.Update(salary);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)

            {
                if (!SalaryExists(id))
                {
                    return BadRequest("Salaries does not exist");
                }

                else
                {
                    throw;
                }
            }
            //  return Ok();
            return CreatedAtAction("GetsalariesByID", new { id = salary.Id }, salary);

        }
        [Route("UpdateSalary/{id}")]
        [HttpPut]
        public async Task<IActionResult> UpdateSalarySection(int id, Salaries salary)
        {
            if (id != salary.Id)
            {
                return BadRequest("Salaries does not match with id");
            }
            var salaryRef = await _context.Salaries.FindAsync(id);
            if (salaryRef == null)
            {
                return BadRequest("Salary does not exist");
            }
            //salary.createdBy = salaryRef.createdBy;
            //salary.createdDate = salaryRef.createdDate;
            //_context.Salaries.Entry(salaryRef).State = EntityState.Detached;

            salary.payDaySalary = salary.payDaySalary ?? 0;
            salary.overTimeRate = salary.overTimeRate ?? 0;
            salary.holidayRate = salary.holidayRate ?? 0;
            salary.hoursPerDay = salary.hoursPerDay ?? 0;
            salary.hoursPerYear = salary.hoursPerYear ?? 0;
            salary.hoursWorked = salary.hoursWorked ?? 0;
            salary.maxVacation = salary.maxVacation ?? 0;
            salary.overTimeRate = salary.overTimeRate ?? 0;
            salary.personalRate = salary.personalRate ?? 0;
            salary.personalLimit = salary.personalLimit ?? 0;
            salary.salary = salary.salary ?? 0;
            salary.sickRate = salary.sickRate ?? 0;
            salary.vacationRate = salary.vacationRate ?? 0;

            salaryRef.startDate = salary.startDate;
            salaryRef.endDate = salary.endDate;
            salaryRef.currentPosStartDate = salary.currentPosStartDate;
            salaryRef.longevity = salary.longevity;
            salaryRef.step = salary.step;
            salaryRef.contractDays = salary.contractDays;
            salaryRef.paidHolidays = salary.paidHolidays;
            salaryRef.hoursPerYear = salary.hoursPerYear;
            salaryRef.personalYearStartDate = salary.personalYearStartDate;
            salaryRef.personalYearEndDate = salary.personalYearEndDate;
            salaryRef.payDaySalary = salary.payDaySalary;
            salaryRef.hourlyRate = salary.hourlyRate;
            salaryRef.salary = salary.salary;

            var empSetup = await _context.EmployeePayrollSetups.FirstOrDefaultAsync(x => x.empId == salaryRef.empId);
            var payTypes = await _context.CodeValues.Where(x => x.CodeTypes.description == "Pay Type").ToListAsync();
            var isSalaried = payTypes.FirstOrDefault(x => x.Id == empSetup!.empPayType)!.value.ToLower() == "salary";

            if (isSalaried)
            {
                salaryRef.salary = salary.payDaySalary * 26;
            }
            else
            {
                salaryRef.salary = salary.hourlyRate * (salaryRef.hoursPerYear ?? 0);
                salaryRef.payDaySalary = salary.hourlyRate * (salaryRef.hoursWorked ?? 0);
            }

            _context.Salaries.Update(salaryRef);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)

            {
                if (!SalaryExists(id))
                {
                    return BadRequest("Salaries does not exist");
                }

                else
                {
                    throw;
                }
            }
            //  return Ok();
            return CreatedAtAction("GetsalariesByID", new { id = salary.Id }, salary);

        }

        [Route("AddSalaryToJob/{id}")]
        [HttpPut]
        public async Task<IActionResult> AddSalaryToJob(int id, AddSalaryToJob salary)
        {
            if (id != salary.Id)
            {
                return BadRequest("Salaries does not match with id");
            }
            var salaryRef = await _context.Salaries.FindAsync(id);
            if (salaryRef == null)
            {
                return BadRequest("Salary does not exist");
            }
            try
            {
                salaryRef.endDate = salary.startDate.Value.AddDays(-1);
                _context.Salaries.Update(salaryRef);
                await _context.SaveChangesAsync();

                _context.Salaries.Entry(salaryRef).State = EntityState.Detached;
                //salaryRef.Id
                salaryRef.Id = 0;
                salaryRef.startDate = salary.startDate;
                salaryRef.endDate = null;

                var empSetup = await _context.EmployeePayrollSetups.FirstOrDefaultAsync(x => x.empId == salaryRef.empId);
                var payTypes = await _context.CodeValues.Where(x => x.CodeTypes.description == "Pay Type").ToListAsync();
                var isSalaried = payTypes.FirstOrDefault(x => x.Id == empSetup!.empPayType)!.value.ToLower() == "salary";

                if (isSalaried)
                {
                    salaryRef.salary = salary.payDaySalary * 26;
                }
                else
                {
                    salaryRef.salary = salary.hourlyRate * (salaryRef.hoursPerYear ?? 0);
                    salaryRef.payDaySalary = salary.hourlyRate * (salaryRef.hoursWorked ?? 0);
                }

                salaryRef.hourlyRate = salary.hourlyRate;

                _context.Salaries.Add(salaryRef);

                await _context.SaveChangesAsync();

                var payDisWithLineRate = _context.PayrollDistributions.Where(x => x.empID == salaryRef.empId && x.jobDescriptionID == salaryRef.jobDescId && x.lineRate.HasValue && x.lineRate.Value>0 && !x.endDate.HasValue).ToList();
                foreach (var payDist in payDisWithLineRate)
                {
                    payDist.endDate = salary.startDate.Value.AddDays(-1);
                    var newDistribution = payDist.DeepCopy();
                    newDistribution.Id = 0;
                    newDistribution.lineRate = salaryRef.hourlyRate ?? 0;
                    newDistribution.startDate = salary.startDate;
                    newDistribution.endDate = null;
                    await _context.PayrollDistributions.AddAsync(newDistribution);
                    await _context.SaveChangesAsync();
                    var distIHacBenefits = await _context.benefitIHACDistributions.Where(x => x.payDistId == payDist.Id).ToListAsync();

                    List<BenefitIHACDistribution> benIhacDists = new List<BenefitIHACDistribution>();
                    foreach (var distIHacBenefit in distIHacBenefits)
                    {
                        var empIHacBenefit = await _context.EmployeePayrollBenefits.Include(x => x.benefitIHACDistribution).Where(x => x.Id == distIHacBenefit.benId).FirstOrDefaultAsync();
                        empIHacBenefit.benefitIHACDistribution = null;
                        var newEmpPayBenefit = empIHacBenefit.DeepCopy();
                        newEmpPayBenefit.Id = 0;
                        await _context.EmployeePayrollBenefits.AddAsync(newEmpPayBenefit);
                        await _context.SaveChangesAsync();

                        var newDistIHacBenefit = distIHacBenefit.DeepCopy();
                        newDistIHacBenefit.ID = 0;
                        newDistIHacBenefit.payDistId = newDistribution.Id;
                        newDistIHacBenefit.benId = newEmpPayBenefit.Id;
                        newDistIHacBenefit.benefitNo = newEmpPayBenefit.benefitNo;

                        await _context.benefitIHACDistributions.AddAsync(newDistIHacBenefit);
                        await _context.SaveChangesAsync();
                    }
                }
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SalaryExists(id))
                {
                    return BadRequest("Salaries does not exist");
                }

                else
                {
                    throw;
                }
            }
            catch (Exception ex)
            {
                throw;
            }
            //  return Ok();
            return CreatedAtAction("GetsalariesByID", new { id = salary.Id }, salary);

        }
        private bool SalaryExists(int id)
        {
            return _context.Salaries.Any(e => e.Id == id);
        }
        //Delete Salary
        [Route("Salary/{id}")]
        [HttpDelete]
        public async Task<ActionResult<Salaries>> DeleteSalaries(int id)
        {
            var salary = await _context.Salaries.FindAsync(id);
            if (salary == null)
            {
                return BadRequest("Salaries does not exist");
            }
            _context.Salaries.Remove(salary);
            await _context.SaveChangesAsync();

            return salary;
        }

        /*EEO Job Description*/
        //Get all  EEO Job Description
        [Route("EEOJobDescription")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EEOJobDescription>>> GetAllEEOJobDescrip()
        {
            return await _context.EEOJobDescriptions.Where(j => j.OrgAccountId == OrgAccountId).ToListAsync();
        }
        //Get EEO Job Description By Id
        [Route("EEOJobDescription/{id}")]
        [HttpGet]
        public async Task<ActionResult<EEOJobDescription>> GetEEOJobDescripById(int id)
        {
            var jobdescrip = await _context.EEOJobDescriptions.FirstOrDefaultAsync(j => j.OrgAccountId == OrgAccountId && j.Id == id);
            if (jobdescrip == null)
            {
                return BadRequest("EEOJobDescription does not exist");
            }
            return Ok(jobdescrip);
        }
        //Add New EEO Job Description
        [Route("EEOJobDescription")]
        [HttpPost]
        public async Task<ActionResult<EEOJobDescription>> AddEEOJobDescrip(EEOJobDescription jobdescrip)
        {
            jobdescrip.OrgAccountId = OrgAccountId;
            if (jobdescrip == null)
            {
                return BadRequest("EEOJobDescription can't be null");
            }
            await _context.EEOJobDescriptions.AddAsync(jobdescrip);
            await _context.SaveChangesAsync();
            // return Ok();
            return CreatedAtAction("GetEEOJobDescripById", new { id = jobdescrip.Id }, jobdescrip);
        }
        //Update EEO Job Description
        [Route("EEOJobDescription/{id}")]
        [HttpPut]
        public async Task<IActionResult> UpdateEEOJobDescrip(int id, EEOJobDescription jobdescrip)
        {
            if (id != jobdescrip.Id)
            {
                return BadRequest("EEOJobDescription does not match with id");
            }
            var eeoJobref = await _context.EEOJobDescriptions.FindAsync(id);
            if (eeoJobref == null)
            {
                return BadRequest("EEOJobDescription does not exist");
            }
            jobdescrip.createdDate = eeoJobref.createdDate;
            jobdescrip.createdBy = eeoJobref.createdBy;
            _context.EEOJobDescriptions.Entry(eeoJobref).State = EntityState.Detached;
            jobdescrip.OrgAccountId = OrgAccountId;
            _context.EEOJobDescriptions.Update(jobdescrip);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)

            {
                if (!EEOJobDescripExists(id))
                {
                    return BadRequest("EEOJobDescription does not exist");
                }

                else
                {
                    throw;
                }
            }
            //  return Ok();
            return CreatedAtAction("GetEEOJobDescripById", new { id = jobdescrip.Id }, jobdescrip);


        }
        private bool EEOJobDescripExists(int id)
        {
            return _context.EEOJobDescriptions.Any(e => e.Id == id);
        }
        //Delete EEO Job Description
        [Route("EEOJobDescription/{id}")]
        [HttpDelete]
        public async Task<ActionResult<EEOJobDescription>> DeleteEEOJobDescrip(int id)
        {
            var jobdecsrip = await _context.EEOJobDescriptions.FirstOrDefaultAsync(j => j.OrgAccountId == OrgAccountId && j.Id == id);
            if (jobdecsrip == null)
            {
                return BadRequest("EEOJobDescription does not exist");
            }
            _context.EEOJobDescriptions.Remove(jobdecsrip);
            await _context.SaveChangesAsync();
            return Ok(jobdecsrip);
        }

        /*UNION*/
        //Get all Union
        [Route("Union")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Union>>> GetAllUnions()
        {
            return await _context.Unions.Where(u => u.OrgAccountId == OrgAccountId).ToListAsync();
        }
        //Get Union By Id
        [Route("Union/{id}")]
        [HttpGet]
        public async Task<ActionResult<Union>> GetUnionById(int id)
        {
            var union = await _context.Unions.FirstOrDefaultAsync(u => u.OrgAccountId == OrgAccountId && u.Id == id);
            if (union == null)
            {
                return BadRequest("Union does not exist");
            }
            return Ok(union);
        }
        //Add New Union
        [Route("Union")]
        [HttpPost]
        public async Task<ActionResult<Union>> AddUnion(Union union)
        {
            union.OrgAccountId = OrgAccountId;
            if (union == null)
            {
                return BadRequest("Union can't be null");
            }
            await _context.Unions.AddAsync(union);
            await _context.SaveChangesAsync();
            // return Ok();
            return CreatedAtAction("GetUnionById", new { id = union.Id }, union);
        }
        //Update Union
        [Route("Union/{id}")]
        [HttpPut]
        public async Task<IActionResult> UpdateUnion(int id, Union union)
        {
            if (id != union.Id)
            {
                return BadRequest("Union does not match with id");
            }
            var unionref = await _context.Unions.FindAsync(id);
            if (unionref == null)
            {
                return BadRequest("Union does not exist");
            }
            union.createdDate = unionref.createdDate;
            union.createdBy = unionref.createdBy;
            _context.Unions.Entry(unionref).State = EntityState.Detached;
            union.OrgAccountId = OrgAccountId;
            _context.Unions.Update(union);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)

            {
                if (!UnionExists(id))
                {
                    return BadRequest("Union does not exist");
                }

                else
                {
                    throw;
                }
            }
            //  return Ok();
            return CreatedAtAction("GetUnionById", new { id = union.Id }, union);


        }
        private bool UnionExists(int id)
        {
            return _context.Unions.Any(e => e.Id == id);
        }
        //Delete Union
        [Route("Union/{id}")]
        [HttpDelete]
        public async Task<ActionResult<Union>> DeleteUnion(int id)
        {
            var union = await _context.Unions.FirstOrDefaultAsync(u => u.OrgAccountId == OrgAccountId && u.Id == id);
            if (union == null)
            {
                return BadRequest("Union does not exist");
            }
            _context.Unions.Remove(union);
            await _context.SaveChangesAsync();
            return Ok(union);
        }
        [Route("SignificantRates/{payDistId}")]
        [HttpGet]
        public async Task<ActionResult<SignificantRates>> GetSignificantRates(int payDistId)
        {
            //var distributions = await _context.PayrollDistributions.Where(x => x.OrgAccountId == OrgAccountId && x.Id == payDistId).Select(x => x.Id).ToListAsync();
            var significantRates = await _context.Salaries.Where(x => x.Id == payDistId).FirstOrDefaultAsync();
            if (significantRates == null)
            {
                return BadRequest("SignificantRates does not exist");
            }
            return Ok(significantRates);
        }
        //[Route("SignificantRates")]
        //[HttpPost]
        //public async Task<ActionResult<SignificantRates>> CreateSignificantRates(SignificantRates significantRates)
        //{
        //    if (significantRates == null)
        //    {
        //        return BadRequest("SignificantRates can't be null");
        //    }
        //    if (significantRates.jobId != 0)
        //    {
        //        int payDistId;
        //        var dist = await _context.PayrollDistributions.Where(x => x.jobId == significantRates.jobId && x.OrgAccountId == OrgAccountId).FirstOrDefaultAsync();
        //        if (dist == null)
        //        {
        //            PayrollDistribution distribution = new PayrollDistribution();
        //            distribution.jobId = (int)significantRates.jobId;
        //            distribution.OrgAccountId = OrgAccountId;
        //            distribution.percentage = 0;
        //            distribution.lineRate = 0;
        //            /* distribution.defaultJob = false;
        //             distribution.activeJob = true;
        //             distribution.vaca = false;
        //             distribution.sick=false;
        //             distribution.noBenefits = false;
        //             distribution.deleted = false;
        //             distribution.*/
        //            _context.PayrollDistributions.Add(distribution);
        //            await _context.SaveChangesAsync();
        //            payDistId = distribution.Id;
        //        }
        //        else
        //        {
        //            payDistId = dist.Id;
        //        }
        //        significantRates.payDistId = payDistId;
        //        significantRates.orgAccountId = OrgAccountId;
        //        _context.SignificantRates.Add(significantRates);
        //        await _context.SaveChangesAsync();
        //        return Ok(significantRates);
        //    }
        //    else
        //    {
        //        return BadRequest("JobId is required");
        //    }
        //}

        [Route("SignificantRates/{id}")]
        [HttpPut]
        public async Task<ActionResult<SignificantRates>> UpdateSignificantRates(int id, SignificantRates significantRates)
        {
            if (id != significantRates.Id) { return BadRequest("SignificantRates does not match with id"); }
            var salary = await _context.Salaries.FindAsync(id);
            if (salary == null) { return BadRequest("SignificantRates does not exist"); }
            //significantRates.createdBy = ratesRef.createdBy;
            //significantRates.createdDate = ratesRef.createdDate;
            //_context.Salaries.Entry(ratesRef).State = EntityState.Detached;

            salary.personalLimit = significantRates.personalLimit;
            salary.sickLimit = significantRates.sickLimit;
            salary.vacationLimit = significantRates.vacationLimit;
            salary.overTimeRate = significantRates.overTimeRate;
            salary.sickRate = significantRates.sickRate;
            salary.holidayRate = significantRates.holidayRate;
            salary.hoursPaid = significantRates.hoursPaid;
            salary.hoursPerDay = significantRates.hoursPerDay;
            salary.hoursWorked = significantRates.hoursWorked;
            salary.lowRate = significantRates.lowRate;
            salary.maxVacation = significantRates.maxVacation;
            salary.overTimeRate = significantRates.overTimeRate;
            salary.personalRate = significantRates.personalRate;
            salary.vacationRate = significantRates.vacationRate;
            salary.vacationYears = significantRates.vacationYears;

            _context.Salaries.Update(salary);
            await _context.SaveChangesAsync();
            return Ok(significantRates);
        }
        [Route("SignificantRates/{id}")]
        [HttpDelete]
        public async Task<ActionResult<string>> DeleteSignificantRates(int id)
        {
            var significantRates = await _context.SignificantRates.FindAsync(id);
            if (significantRates == null)
            {
                return BadRequest("SignificantRates does not exist");
            }
            _context.SignificantRates.Remove(significantRates);
            return Ok("Deleted");
        }
        [Route("SignificantDates/{payDistId}")]
        [HttpGet]
        public async Task<ActionResult<SignificantDates>> GetSignificantDates(int payDistId)
        {
            var salary = await _context.Salaries.AsNoTracking().FirstOrDefaultAsync(x => x.Id == payDistId);
            var empId = salary?.empId;
            var empPayrollSetup = await _context.EmployeePayrollSetups.AsNoTracking().Where(x => x.OrgAccountId == OrgAccountId && x.empId == empId).FirstOrDefaultAsync();
            if (empPayrollSetup == null)
            {
                return BadRequest("SignificantDates does not exist");
            }

            SignificantDates significantDates = new SignificantDates
            {
                anniversaryDateDD = empPayrollSetup.aniversaryDateDD,
                countyDate = empPayrollSetup.empDateCounty,
                createdBy = empPayrollSetup.createdBy,
                createdDate = empPayrollSetup.createdDate,
                days = empPayrollSetup.days,
                daysDD = empPayrollSetup.daysDD,
                empDateCurrentPos = empPayrollSetup.empDateCurrentPos,
                empStepDate = empPayrollSetup.empStepDate,
                evalCompletionDate = empPayrollSetup.evalCompletionDate,
                evalDate = empPayrollSetup.evalDate,
                evalNoticeSentDate = empPayrollSetup.evalNoticeSentDate,
                fullTimeHire = empPayrollSetup.fullTimeHire,
                hiredDate = empPayrollSetup.empDateHired.HasValue ? empPayrollSetup.empDateHired : salary?.startDate,
                Id = empPayrollSetup.Id,
                //jobId = empPayrollSetup.jo,
                lastDate = empPayrollSetup.empDateLast,
                rehireDate = empPayrollSetup.rehireDate,
                years = empPayrollSetup.years,
                yearsDD = empPayrollSetup.yearsDD,
                fullTime = empPayrollSetup.fullTime
            };

            return Ok(significantDates);
        }
        [Route("SignificantDates")]
        [HttpPost]
        public async Task<ActionResult<SignificantDates>> CreateSignificantDates(SignificantDates SignificantDates)
        {
            if (SignificantDates == null)
            {
                return BadRequest("SignificantDates can't be null");
            }
            if (SignificantDates.jobId != 0)
            {
                int payDistId;
                var dist = await _context.PayrollDistributions.Where(x => x.Id == SignificantDates.jobId && x.OrgAccountId == OrgAccountId).FirstOrDefaultAsync();
                if (dist == null)
                {
                    PayrollDistribution distribution = new PayrollDistribution();
                    //distribution.jobId = (int)SignificantDates.jobId;
                    distribution.OrgAccountId = OrgAccountId;
                    distribution.percentage = 0;
                    distribution.lineRate = 0;
                    /* distribution.defaultJob = false;
                     distribution.activeJob = true;
                     distribution.vaca = false;
                     distribution.sick=false;
                     distribution.noBenefits = false;
                     distribution.deleted = false;
                     distribution.*/
                    _context.PayrollDistributions.Add(distribution);
                    await _context.SaveChangesAsync();
                    payDistId = distribution.Id;
                }
                else
                {
                    payDistId = dist.Id;
                }
                SignificantDates.payDistId = payDistId;
                SignificantDates.OrgAccountId = OrgAccountId;
                _context.SignificantDates.Add(SignificantDates);
                await _context.SaveChangesAsync();
                return Ok(SignificantDates);
            }
            else
            {
                return BadRequest("JobId is required");
            }

        }
        [Route("SignificantDates/{id}")]
        [HttpPut]
        public async Task<ActionResult<SignificantDates>> UpdateSignificantDates(int id, SignificantDates SignificantDates)
        {
            if (id != SignificantDates.Id) { return BadRequest("SignificantDates does not match with id"); }
            var empPayrollSetup = await _context.EmployeePayrollSetups.FindAsync(id);
            if (empPayrollSetup == null) { return BadRequest("SignificantDates does not exist"); }

            empPayrollSetup.aniversaryDateDD = SignificantDates.anniversaryDateDD;
            empPayrollSetup.empDateCounty = SignificantDates.countyDate;
            empPayrollSetup.createdBy = SignificantDates.createdBy;
            empPayrollSetup.createdDate = SignificantDates.createdDate;
            empPayrollSetup.days = SignificantDates.days;
            empPayrollSetup.daysDD = SignificantDates.daysDD;
            empPayrollSetup.empDateCurrentPos = SignificantDates.empDateCurrentPos;
            empPayrollSetup.empStepDate = SignificantDates.empStepDate;
            empPayrollSetup.evalCompletionDate = SignificantDates.evalCompletionDate;
            empPayrollSetup.evalDate = SignificantDates.evalDate;
            empPayrollSetup.evalNoticeSentDate = SignificantDates.evalNoticeSentDate;
            empPayrollSetup.fullTimeHire = SignificantDates.fullTimeHire;
            empPayrollSetup.empDateHired = SignificantDates.hiredDate;
            empPayrollSetup.empDateLast = SignificantDates.lastDate;
            empPayrollSetup.rehireDate = SignificantDates.rehireDate;
            empPayrollSetup.years = SignificantDates.years;
            empPayrollSetup.yearsDD = SignificantDates.yearsDD;

            _context.EmployeePayrollSetups.Update(empPayrollSetup);
            await _context.SaveChangesAsync();
            return Ok(SignificantDates);
        }
        [Route("SignificantDates/{id}")]
        [HttpDelete]
        public async Task<ActionResult<string>> DeleteSignificantDates(int id)
        {
            var SignificantDates = await _context.SignificantDates.FindAsync(id);
            if (SignificantDates == null)
            {
                return BadRequest("SignificantDates does not exist");
            }
            _context.SignificantDates.Remove(SignificantDates);
            return Ok("Deleted");
        }
    }
}
