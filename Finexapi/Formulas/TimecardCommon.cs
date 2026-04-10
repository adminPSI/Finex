using AutoMapper.Execution;
using FinexAPI.Data;
using FinexAPI.Dtos;
using FinexAPI.Helper;
using FinexAPI.Models;
using FinexAPI.Models.Payroll;
using FinexAPI.Models.PayrollDefaults;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;
using System.Globalization;
using System.Net.NetworkInformation;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Xml.Linq;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;


namespace FinexAPI.Formulas
{
    public class TimecardCommon
    {
        public static List<int> GetSupervisorsEmployeeIds(DateTime? startdateTime, int loggedInUserId, FinexAppContext _timecardContext)
        {
            //direct 
            var timcardEmployee = _timecardContext.TimecardEmployeeDetails.Where(x => x.empId == loggedInUserId).FirstOrDefault();

            var setting = _timecardContext.SettingsValue.Where(x => x.settingsId == 94).Select(x => x.settingValue).FirstOrDefault();

            var empList = _timecardContext.TimecardEmployeeDetails.Include(x => x.Employee)
                    .Where(x => ((setting == null || setting.Equals("0") || timcardEmployee.IsPayrollSpecialist ||
                    (x.groupNumber == timcardEmployee.groupNumber || x.supervisorGroupNumber == timcardEmployee.groupNumber)))
                    && x.Employee.activeInd == "Y")
                    .Select(x => x.empId)
                    .ToList();

            if (!timcardEmployee.IsPayrollSpecialist && timcardEmployee.isSupervisor)
            {
                //indirect substitue supervisor
                var subsSup = _timecardContext.SupervisorSubSchedules.Where(x => x.supSubId == loggedInUserId
                && ((x.startDate <= startdateTime && x.endDate >= startdateTime) )).ToList();

                foreach (var sub in subsSup)
                {
                    var timcardEmployeeSub = _timecardContext.TimecardEmployeeDetails.Where(x => x.empId == sub.supId).FirstOrDefault();

                    var empListSub = _timecardContext.TimecardEmployeeDetails.Include(x => x.Employee)
                            .Where(x => ((setting == null || setting.Equals("0") ||
                            (x.groupNumber == timcardEmployeeSub.groupNumber || x.supervisorGroupNumber == timcardEmployeeSub.groupNumber)))
                            && x.Employee.activeInd == "Y")
                            .Select(x => x.empId)
                            .ToList();

                    empList.Add(loggedInUserId);
                    empList.AddRange(empListSub);
                }
            }else if (!timcardEmployee.IsPayrollSpecialist && !timcardEmployee.isSupervisor) {
                empList=new List<int> { loggedInUserId };
            }

            return empList.Distinct().ToList();
        }

        public static bool HasTimecardDataAccess(FinexAppContext _timecardContext,int loggedInUserId, int empId)
        {
            var accessibleEmployees = GetSupervisorsEmployeeIds(DateTime.Now,loggedInUserId,_timecardContext);

            return accessibleEmployees.Any(x=>x == empId);
        }
    }
}
