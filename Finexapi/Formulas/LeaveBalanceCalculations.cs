using FinexAPI.Data;
using FinexAPI.Dtos;
using FinexAPI.Helper;
using FinexAPI.Models;
using FinexAPI.Models.Payroll;
using FinexAPI.Models.PayrollDefaults;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualBasic;
using System.Data;
using System.Globalization;
using System.Linq;
using System.Net.NetworkInformation;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Xml.Linq;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

namespace FinexAPI.Formulas
{
    public class VSPDto
    {
        public decimal? VacaBalanceBox { get; set; }
        public decimal? SickBalanceBox { get; set; }
        public decimal? PersBalanceBox { get; set; }
        public decimal? CompBalanceBox { get; set; }
        public decimal? FedPaidSickBalanceBox { get; set; }
        public decimal? EmergencyFMLABalanceBox { get; set; }
        public string FMLAStartBox { get; set; }
        public decimal? FMLAUsedBox { get; set; }
        public decimal? FMLAAvaliableBox { get; set; }
        public decimal? FMLABalance { get; set; }
    }

    public class LeaveBalanceCalculations
    {


        public static void DeleteAttendanceTable(DateTime? startdateTime, DateTime? enddateTime, int EmpId, FinexAppContext _payrollContext)
        {
            var attendanceRecord = _payrollContext.Attendances.Where(x => x.date >= startdateTime.Value.Date && x.date <= enddateTime.Value.Date && x.employeeId == EmpId).ToList();
            _payrollContext.Attendances.RemoveRange(attendanceRecord);
            _payrollContext.SaveChanges();
        }
        public static void GetTimeCardVacaSick(int headerId, int orgId, int empId, DateTime? PayPeroidStart, DateTime? PayPeriodEnd, bool BereavementToSick, FinexAppContext _timecardContext)
        {
            var attendance = _timecardContext.TimeCards
                 .Join(
                _timecardContext.LeaveTypes,
                 tc => tc.leaveTypeID,
                 lr => lr.id,
                 (tc, lr) => new
                 {
                     tc.ID,
                     tc.leaveTypeID,
                     lr.OrgAccountId,
                     tc.timeCardHeaderID,
                     lr.allowEmployeeSelect,
                     tc.startDateTime,
                     tc.endDateTime,
                     tc.hours,
                     lr.description,
                     tc.empID,
                     tc.hourTypeID,
                     tc.FMLAID,
                     tc.memo,
                     tc.leaveCodeID
                 })
                 .Where(tc =>
                 (tc.allowEmployeeSelect || tc.hourTypeID > 2) &&
                 tc.timeCardHeaderID == headerId && tc.leaveTypeID != 9 && tc.OrgAccountId == orgId && tc.empID == empId &&
                ((tc.startDateTime >= PayPeroidStart && tc.startDateTime <= PayPeriodEnd) ||
                (tc.endDateTime >= PayPeroidStart && tc.endDateTime <= PayPeriodEnd))).ToList();

            DeleteAttendanceTable(PayPeroidStart, PayPeriodEnd, empId, _timecardContext);
            // Attendance a = new Attendance();
            foreach (var item in attendance)
            {
                string LeaveType = "";
                string LHoursField = "";
                bool attendanceRequire = false;
                switch (item.description.ToLower())
                {
                    case "vacation"://1
                        LeaveType = "vacation";
                        LHoursField = "vacationHours";
                        attendanceRequire = true;
                        break;
                    case "sick"://Sick 2
                        LeaveType = "sickLeave";
                        LHoursField = "sickLeaveHours";
                        attendanceRequire = true;
                        break;
                    case "personal"://Personal 3
                        LeaveType = "personalTime";
                        LHoursField = "personalTimeHours";
                        attendanceRequire = true;
                        break;
                    case "lwop": //4
                        LeaveType = "leaveWOPay";
                        LHoursField = "leaveWOPayHours";
                        attendanceRequire = true;
                        break;
                    case "comp time used":// comp time used 5
                        LeaveType = "unexcused";
                        LHoursField = "unexcusedHours";
                        attendanceRequire = true;
                        break;
                    case "holiday": //6
                        LeaveType = "holiday";
                        LHoursField = "holidayHours";
                        attendanceRequire = true;
                        break;
                    case "administrative leave"://Administrative 7
                        LeaveType = "Other";
                        LHoursField = "OtherHours";
                        attendanceRequire = true;
                        break;
                    case "fmla": //8
                    case "lunch": //9
                        break;
                    case "bereavement"://Bereavement 10
                        var bereavementToSick = _timecardContext.SettingsValue.Where(x => x.settingsId == 86).Select(x => x.settingValue).FirstOrDefault();
                        if (bereavementToSick != null && bereavementToSick == "1")
                        {
                            //need to implement BereavementToSick method()
                            switch (LeaveBalanceCalculations.BereavementToSick(_timecardContext, item.hours, empId, item.startDateTime))
                            {
                                case 1:
                                    LeaveType = "Sick Leave";
                                    LHoursField = "Sick leave Hours";
                                    break;
                                case 2:
                                    LeaveType = "Vacation";
                                    LHoursField = "Vacation Hours";
                                    break;
                                case 3:
                                    LeaveType = "Leave W/O Pay";
                                    LHoursField = "Leave W/O pay hours";
                                    break;
                            }

                            //item.memo = item.memo + "Bereavement  Leave";
                        }
                        else
                        {
                            LeaveType = "Other";
                            LHoursField = "OtherHours";
                            attendanceRequire = true;
                        }
                        break;
                    case "professional"://Professional 11
                        LeaveType = "proDay";
                        LHoursField = "proDayHours";
                        attendanceRequire = true;
                        break;
                    case "jury duty"://Jury Duty 12
                        LeaveType = "other";
                        LHoursField = "otherHours";
                        attendanceRequire = true;
                        break;
                    case "military leave"://Military Leave 13
                        LeaveType = "Other";
                        LHoursField = "OtherHours";
                        attendanceRequire = true;
                        break;
                    case "educational leave"://Educational Leave 14
                        LeaveType = "Other";
                        LHoursField = "OtherHours";
                        attendanceRequire = true;
                        break;
                    case "wage continuation"://Wage Continuation 15
                        LeaveType = "wageContIn";
                        LHoursField = "wageContInHours";
                        attendanceRequire = true;
                        break;
                    case "bonus personal used": // Bonus Personal Leave 16
                        LeaveType = "bonusPer";
                        LHoursField = "bonusPerUsed";
                        attendanceRequire = true;
                        break;
                    case "workers comp"://Workers Commp 17
                        LeaveType = "workersComp";
                        LHoursField = "workersCompHours";
                        attendanceRequire = true;
                        break;
                    case "calamity"://Calamity 18
                        LeaveType = "snow";
                        LHoursField = "snowHours";
                        attendanceRequire = true;
                        break;
                    case "comp earned (1.0)"://Comp Earned  19
                        LeaveType = "compEarned";
                        LHoursField = "compEarnedHours";
                        attendanceRequire = true;
                        break;
                    case "comp earned (1.5)"://Comp Earned 20
                        LeaveType = "compEarned";
                        LHoursField = "compEarnedHours";
                        attendanceRequire = true;
                        break;
                    case "break"://Break 21
                        LeaveType = "Break";
                        LHoursField = "breakHours";
                        attendanceRequire = true;
                        break;
                    case "fed paid sick"://Fed Paid Sick 22
                        LeaveType = "fedPaidSick";
                        LHoursField = "fedPaidSickHours";
                        attendanceRequire = true;
                        break;
                    case "emergency fmla"://Emergency FMLA 23
                        LeaveType = "emergencyFMLA";
                        LHoursField = "emergencyFMLAHours";
                        attendanceRequire = true;
                        break;
                    default:
                        break;
                }

                if (attendanceRequire == true)
                {
                    int attendanceId = AddAttendace(empId, orgId, item.startDateTime.Date, _timecardContext);
                    double iHours = item.hours;
                    if (item.leaveTypeID == 20)
                    {
                        iHours = Math.Round(item.hours * 1.5, 4);
                    }
                    UpdateAttendance(attendanceId, LeaveType, LHoursField, iHours, item.memo, item.leaveTypeID, item.FMLAID, item.startDateTime.Date, _timecardContext);
                }
            }
        }

        public static decimal GetLeaveBalanceByType(FinexAppContext _payrollContext, int empId, string leaveType)
        {
            var WhatYear = DateTime.Now.Year;

            var rounding = _payrollContext.PayrollDefaultValues.Select(x => x.vacaRounding).FirstOrDefault() ?? 0;
            var FirstPay = LeaveBalanceCalculations.GetFirstPayDateOfYear(_payrollContext, WhatYear);
            var DaysTillPayDay = LeaveBalanceCalculations.GetDaysTillPayDay(_payrollContext);
            var LatestPay = LeaveBalanceCalculations.GetLatestDatePaid(_payrollContext, WhatYear);
            var FirstPayPeriodStartDate = FirstPay.AddDays(-DaysTillPayDay); //DateAdd(DateInterval.Day, -DaysTillPayDay, CDate(FirstPay))
            var PayPeriodEndDate = LatestPay.AddDays(-DaysTillPayDay + 13); //DateAdd(DateInterval.Day, -DaysTillPayDay + 13, CDate(LatestPay))

            if (leaveType.Contains("vacation"))
            {
                var StartBalVaca = LeaveBalanceCalculations.GetVacationStartingBalance(_payrollContext, WhatYear, empId);
                var EarnedVaca = LeaveBalanceCalculations.GetVacationEarnedYTD(_payrollContext, null, empId, LatestPay);
                var UsedVaca = LeaveBalanceCalculations.GetVacationUsedYTD(_payrollContext, empId, "", FirstPayPeriodStartDate, PayPeriodEndDate);
                var FutureVaca = LeaveBalanceCalculations.GetVacationFuture(_payrollContext, empId, "", LatestPay);

                return Math.Round(StartBalVaca + EarnedVaca - UsedVaca - FutureVaca, rounding);
            }

            if (leaveType.Contains("sick"))
            {
                var StartBalSick = LeaveBalanceCalculations.GetSickStartingBalance(_payrollContext, WhatYear, empId);
                var EarnedSick = LeaveBalanceCalculations.GetSickEarnedYTD(_payrollContext, null, empId, LatestPay);
                var UsedSick = LeaveBalanceCalculations.GetSickUsedYTD(_payrollContext, empId, "", FirstPayPeriodStartDate, PayPeriodEndDate);
                var FutureSick = LeaveBalanceCalculations.GetSickFuture(_payrollContext, empId, "", LatestPay);

                return Math.Round(StartBalSick + EarnedSick - UsedSick - FutureSick, rounding);
            }

            if (leaveType.Contains("personal"))
            {
                var personalYrStartEnd = LeaveBalanceCalculations.GetPersonalYearStartEnd(_payrollContext, empId, PayPeriodEndDate);
                DateTime personalYrStart = personalYrStartEnd[0];
                DateTime personalYrEnd = personalYrStartEnd[1];

                var StartBalPers = LeaveBalanceCalculations.GetPersonalStartingBalance(_payrollContext, personalYrStart, personalYrEnd, empId, PayPeriodEndDate);
                var EarnedPers = LeaveBalanceCalculations.GetPersonalEarnedYTD(_payrollContext, personalYrStart, empId, personalYrEnd);
                var UsedPers = LeaveBalanceCalculations.GetPersonalUsedYTD(_payrollContext, empId, "", personalYrStart, personalYrEnd);
                var FuturePers = LeaveBalanceCalculations.GetPersonalFuture(_payrollContext, empId, "", personalYrEnd);

                return Math.Round(StartBalPers + EarnedPers - UsedPers - FuturePers, rounding);
            }

            if (leaveType.Contains("comp time used"))
            {
                var usePersonalYearForCompTime = _payrollContext.SettingsValue.Where(x => x.settingsId == 78).Select(x => x.settingValue).FirstOrDefault(); //Use Personal Year for Comp Time Calculations

                var StartBalComp = LeaveBalanceCalculations.GetCompStartingBalance(_payrollContext, WhatYear, empId);
                decimal EarnedComp = 0M;
                decimal UsedComp = 0M;
                if (!string.IsNullOrEmpty(usePersonalYearForCompTime) && usePersonalYearForCompTime == "1")
                {
                    var personalYrStartEnd = LeaveBalanceCalculations.GetPersonalYearStartEnd(_payrollContext, empId, PayPeriodEndDate);
                    DateTime personalYrStart = personalYrStartEnd[0];
                    DateTime personalYrEnd = personalYrStartEnd[1];

                    EarnedComp = Math.Round(LeaveBalanceCalculations.GetCompEarnedYTD(_payrollContext, personalYrStart, empId, personalYrEnd), 4);
                    UsedComp = LeaveBalanceCalculations.GetCompUsedYTD(_payrollContext, empId, "", personalYrStart, personalYrEnd);
                }
                else
                {
                    EarnedComp = Math.Round(LeaveBalanceCalculations.GetCompEarnedYTD(_payrollContext, FirstPayPeriodStartDate, empId, PayPeriodEndDate), 4);
                    UsedComp = LeaveBalanceCalculations.GetCompUsedYTD(_payrollContext, empId, "", FirstPayPeriodStartDate, PayPeriodEndDate);
                }

                var FutureComp = LeaveBalanceCalculations.GetCompFuture(_payrollContext, empId, "", LatestPay);

                return Math.Round(StartBalComp + EarnedComp - UsedComp - FutureComp, rounding);
            }

            if (leaveType.Contains("fed"))
            {
                var StartBalFedPaidSick = LeaveBalanceCalculations.GetFedPaidSickStartingBalance(_payrollContext, WhatYear, empId);
                var UsedFedPaidSick = LeaveBalanceCalculations.GetFedPaidSickUsedYTD(_payrollContext, empId, "", FirstPayPeriodStartDate, PayPeriodEndDate);
                var FutureFedPaidSick = LeaveBalanceCalculations.GetFedPaidSickFuture(_payrollContext, empId, "", LatestPay);

                return Math.Round(StartBalFedPaidSick - UsedFedPaidSick - FutureFedPaidSick, rounding);
            }

            if (leaveType.Contains("fmla"))
            {
                var StartBalEmergencyFMLA = LeaveBalanceCalculations.GetEmergencyFMLAStartingBalance(_payrollContext, WhatYear, empId);
                var UsedEmergencyFMLA = LeaveBalanceCalculations.GetEmergencyFMLAUsedYTD(_payrollContext, empId, "", FirstPayPeriodStartDate, PayPeriodEndDate);
                var FutureEmergencyFMLA = LeaveBalanceCalculations.GetEmergencyFMLAFuture(_payrollContext, empId, "", LatestPay);

                return Math.Round(StartBalEmergencyFMLA - UsedEmergencyFMLA - FutureEmergencyFMLA, rounding);
            }

            if (leaveType.Contains("bonus"))
            {
                var personalYrStartEnd = LeaveBalanceCalculations.GetPersonalYearStartEnd(_payrollContext, empId, PayPeriodEndDate);
                DateTime personalYrStart = personalYrStartEnd[0];
                DateTime personalYrEnd = personalYrStartEnd[1];

                decimal StartBalPersonalBonus = LeaveBalanceCalculations.GetPersonalBonusStartingBalance(_payrollContext, personalYrStart, personalYrEnd, empId);
                decimal UsedPersonalBonus = LeaveBalanceCalculations.GetPersonalBonusUsedYTD(_payrollContext, empId, "", personalYrStart, personalYrEnd);
                decimal EarnedPersonalBonus = LeaveBalanceCalculations.GetPersonalBonusEarnedYTD(_payrollContext, personalYrStart, empId, personalYrEnd);
                decimal FuturePersonalBonus = LeaveBalanceCalculations.GetPersonalBonusFuture(_payrollContext, empId, "", personalYrEnd);

                return Math.Round(StartBalPersonalBonus + EarnedPersonalBonus - UsedPersonalBonus - FuturePersonalBonus, rounding);
            }

            return -1000;
        }

        public static VSPDto GetVSP(FinexAppContext _payrollContext, int empId)
        {
            var WhatYear = DateTime.Now.Year;

            var rounding = _payrollContext.PayrollDefaultValues.Select(x => x.vacaRounding).FirstOrDefault() ?? 0;
            var FirstPay = LeaveBalanceCalculations.GetFirstPayDateOfYear(_payrollContext, WhatYear);
            var DaysTillPayDay = LeaveBalanceCalculations.GetDaysTillPayDay(_payrollContext);
            var LatestPay = LeaveBalanceCalculations.GetLatestDatePaid(_payrollContext, WhatYear);
            var FirstPayPeriodStartDate = FirstPay.AddDays(-DaysTillPayDay); //DateAdd(DateInterval.Day, -DaysTillPayDay, CDate(FirstPay))
            var PayPeriodEndDate = LatestPay.AddDays(-DaysTillPayDay + 13); //DateAdd(DateInterval.Day, -DaysTillPayDay + 13, CDate(LatestPay))

            var StartBalVaca = LeaveBalanceCalculations.GetVacationStartingBalance(_payrollContext, WhatYear, empId);
            var EarnedVaca = LeaveBalanceCalculations.GetVacationEarnedYTD(_payrollContext, null, empId, LatestPay);
            var UsedVaca = LeaveBalanceCalculations.GetVacationUsedYTD(_payrollContext, empId, "", FirstPayPeriodStartDate, PayPeriodEndDate);
            var FutureVaca = LeaveBalanceCalculations.GetVacationFuture(_payrollContext, empId, "", LatestPay);

            var StartBalSick = LeaveBalanceCalculations.GetSickStartingBalance(_payrollContext, WhatYear, empId);
            var EarnedSick = Math.Round(LeaveBalanceCalculations.GetSickEarnedYTD(_payrollContext, null, empId, LatestPay), 4);
            var UsedSick = LeaveBalanceCalculations.GetSickUsedYTD(_payrollContext, empId, "", FirstPayPeriodStartDate, PayPeriodEndDate);
            var FutureSick = LeaveBalanceCalculations.GetSickFuture(_payrollContext, empId, "", LatestPay);

            var personalYrStartEnd = LeaveBalanceCalculations.GetPersonalYearStartEnd(_payrollContext, empId, PayPeriodEndDate);
            DateTime personalYrStart = personalYrStartEnd[0];
            DateTime personalYrEnd = personalYrStartEnd[1];

            var StartBalPers = LeaveBalanceCalculations.GetPersonalStartingBalance(_payrollContext, personalYrStart, personalYrEnd, empId, PayPeriodEndDate);
            var EarnedPers = LeaveBalanceCalculations.GetPersonalEarnedYTD(_payrollContext, personalYrStart, empId, personalYrEnd);
            var UsedPers = LeaveBalanceCalculations.GetPersonalUsedYTD(_payrollContext, empId, "", personalYrStart, personalYrEnd);
            var FuturePers = LeaveBalanceCalculations.GetPersonalFuture(_payrollContext, empId, "", personalYrEnd);

            var usePersonalYearForCompTime = _payrollContext.SettingsValue.Where(x => x.settingsId == 78).Select(x => x.settingValue).FirstOrDefault(); //Use Personal Year for Comp Time Calculations

            var StartBalComp = LeaveBalanceCalculations.GetCompStartingBalance(_payrollContext, WhatYear, empId);
            decimal EarnedComp = 0M;
            decimal UsedComp = 0M;
            if (!string.IsNullOrEmpty(usePersonalYearForCompTime) && usePersonalYearForCompTime == "1")
            {
                EarnedComp = LeaveBalanceCalculations.GetCompEarnedYTD(_payrollContext, personalYrStart, empId, personalYrEnd);
                UsedComp = LeaveBalanceCalculations.GetCompUsedYTD(_payrollContext, empId, "", personalYrStart, personalYrEnd);
            }
            else
            {
                EarnedComp = LeaveBalanceCalculations.GetCompEarnedYTD(_payrollContext, FirstPayPeriodStartDate, empId, PayPeriodEndDate);
                UsedComp = LeaveBalanceCalculations.GetCompUsedYTD(_payrollContext, empId, "", FirstPayPeriodStartDate, PayPeriodEndDate);
            }
            var FutureComp = LeaveBalanceCalculations.GetCompFuture(_payrollContext, empId, "", LatestPay);

            decimal StartBalPersonalBonus = LeaveBalanceCalculations.GetPersonalBonusStartingBalance(_payrollContext, personalYrStart, personalYrEnd, empId);
            decimal UsedPersonalBonus = LeaveBalanceCalculations.GetPersonalBonusEarnedYTD(_payrollContext, personalYrStart, empId, personalYrEnd);
            decimal EarnedPersonalBonus = LeaveBalanceCalculations.GetPersonalBonusUsedYTD(_payrollContext, empId, "", personalYrStart, personalYrEnd);
            decimal FuturePersonalBonus = LeaveBalanceCalculations.GetPersonalBonusFuture(_payrollContext, empId, "", personalYrEnd);

            var StartBalFedPaidSick = LeaveBalanceCalculations.GetFedPaidSickStartingBalance(_payrollContext, WhatYear, empId);
            var UsedFedPaidSick = LeaveBalanceCalculations.GetFedPaidSickUsedYTD(_payrollContext, empId, "", FirstPayPeriodStartDate, PayPeriodEndDate);
            var FutureFedPaidSick = LeaveBalanceCalculations.GetFedPaidSickFuture(_payrollContext, empId, "", LatestPay);

            var StartBalEmergencyFMLA = LeaveBalanceCalculations.GetEmergencyFMLAStartingBalance(_payrollContext, WhatYear, empId);
            var UsedEmergencyFMLA = LeaveBalanceCalculations.GetEmergencyFMLAUsedYTD(_payrollContext, empId, "", FirstPayPeriodStartDate, PayPeriodEndDate);
            var FutureEmergencyFMLA = LeaveBalanceCalculations.GetEmergencyFMLAFuture(_payrollContext, empId, "", LatestPay);

            VSPDto vspDto = new VSPDto();

            vspDto.SickBalanceBox = Math.Round(StartBalSick + EarnedSick - UsedSick - FutureSick, rounding);
            vspDto.VacaBalanceBox = Math.Round(StartBalVaca + EarnedVaca - UsedVaca - FutureVaca, rounding);
            vspDto.PersBalanceBox = Math.Round(StartBalPers + EarnedPers - UsedPers - FuturePers, rounding);
            vspDto.CompBalanceBox = Math.Round(StartBalComp + EarnedComp - UsedComp - FutureComp, rounding);
            vspDto.FedPaidSickBalanceBox = Math.Round(StartBalFedPaidSick - UsedFedPaidSick - FutureFedPaidSick, rounding);
            vspDto.EmergencyFMLABalanceBox = Math.Round(StartBalEmergencyFMLA - UsedEmergencyFMLA - FutureEmergencyFMLA, rounding);

            var fmlaStartDate = _payrollContext.EmployeePayrollSetups.FirstOrDefault(x => x.empId == empId).fmlaStartDate;
            var biweeklyHours = _payrollContext.Salaries.FirstOrDefault(x => !x.endDate.HasValue && x.empId == empId)?.hoursPaid;

            if (!fmlaStartDate.HasValue)
            {
                vspDto.FMLAStartBox = "";
            }
            else
            {
                vspDto.FMLAStartBox = fmlaStartDate.Value.ToString("MM/dd/yyyy");
                if ((fmlaStartDate.Value - DateTime.Now).TotalDays < 365)
                {
                    var fmlaEndDate = fmlaStartDate.Value.AddYears(1);

                    //[Vacation Hours] + [Sick Leave Hours] + [Personal Time Hours] + [Unexcused Hours] + " _
                    //" [Pro Day Hours] + [Snow Hours] + [BonusPerUsed] + [SickCompensationHours] + [Leave W/O pay hours] + " _
                    // " [OtherHours] + [WorkersCompHours] + [HolidayHours] + [Fed Paid Sick Hours] + [Emergency FMLA Hours]
                    vspDto.FMLAUsedBox = _payrollContext.Attendances.Where(x => x.employeeId == empId && x.familyLeaveAct && x.date >= fmlaStartDate && x.date <= fmlaEndDate)
                        .Sum(x => x.vacationHours + x.sickLeaveHours + x.personalTimeHours + x.unexcusedHours + x.proDayHours + x.snowHours + x.bonusPerUsed
                        + x.sickCompensationHours + x.leaveWOPayHours + x.otherHours + x.workersCompHours + x.holidayHours + x.fedPaidSickHours + x.emergencyFMLAHours);


                }
                vspDto.FMLAAvaliableBox = Math.Round(((biweeklyHours ?? 0) / 2) * 12, rounding);
                vspDto.FMLABalance = vspDto.FMLAAvaliableBox - vspDto.FMLAUsedBox;
            }

            return vspDto;
        }

        private static List<DateTime> GetPersonalYearStartEnd(FinexAppContext _payrollContext, int empId, DateTime PayPeriodEndDate)
        {
            List<DateTime> result = new List<DateTime>();

            var sal = _payrollContext.Salaries.FirstOrDefault(x => x.empId == empId && x.personalYearStartDate <= PayPeriodEndDate && PayPeriodEndDate <= x.personalYearEndDate);
            if (sal == null)
                sal = _payrollContext.Salaries.Where(x => x.empId == empId).OrderBy(x => x.personalYearStartDate).FirstOrDefault();

            if (sal == null)
            {
                result.Add(new DateTime(PayPeriodEndDate.Year, 1, 1));
                result.Add(new DateTime(PayPeriodEndDate.Year, 12, 31));
                return result;
            }

            try
            {
                result.Add(sal.personalYearStartDate!.Value.Date);
                result.Add(sal.personalYearEndDate!.Value.Date);
            }
            catch (Exception ex)
            {
                result.Add(new DateTime(PayPeriodEndDate.Year, 1, 1));
                result.Add(new DateTime(PayPeriodEndDate.Year, 12, 31));
            }

            return result;
            //    GetPersonalYear = ""

            //strSQL = "SELECT  RTRIM(CONVERT(nchar, PersonalYearStartDate, 101)) AS StartDate, RTRIM(CONVERT(nchar, PersonalYearEndDate, 101)) AS EndDate" _
            //    & " FROM Salaries" _
            //    & " WHERE '" & PayPeriodEndDate & "' BETWEEN PersonalYearStartDate AND PersonalYearEndDate" _
            //    & " AND EmpID = " & EmpID _
            //    & " AND ORG_ACCOUNT_ID = " & OrgAccountID
            //Dim dt As DataTable = rsData.SelectRowsDS(ConnString, strSQL).Tables(0)

            //If dt.Rows.Count > 0 Then
            //    Return dt.Rows(0)("StartDate").ToString & dt.Rows(0)("EndDate").ToString
            //Else
            //    strSQL = "SELECT  RTRIM(CONVERT(nchar, PersonalYearStartDate, 101)) AS StartDate, RTRIM(CONVERT(nchar, PersonalYearEndDate, 101)) AS EndDate" _
            //        & " FROM Salaries" _
            //        & " WHERE EmpID = " & EmpID _
            //         & " AND ORG_ACCOUNT_ID = " & OrgAccountID
            //    dt = rsData.SelectRowsDS(ConnString, strSQL).Tables(0)
            //    If dt.Rows.Count > 0 Then
            //        If IsDate(dt.Rows(0)("StartDate").ToString) And IsDate(dt.Rows(0)("EndDate").ToString) Then
            //            Return dt.Rows(0)("StartDate") & dt.Rows(0)("EndDate")
            //        Else
            //            Return "01/01/" & Right(CDate(PayPeriodEndDate).ToString("MM/dd/yyyy"), 4) & "12/31/" & Right(CDate(PayPeriodEndDate).ToString("MM/dd/yyyy"), 4)
            //        End If
            //    End If
            //End If
        }

        private static int BereavementToSick(FinexAppContext _payrollContext, double hrs, int empId, DateTime workDate)
        {
            var WhatYear = DateTime.Now.Year;

            var FirstPay = LeaveBalanceCalculations.GetFirstPayDateOfYear(_payrollContext, WhatYear);
            var DaysTillPayDay = LeaveBalanceCalculations.GetDaysTillPayDay(_payrollContext);
            var LatestPay = LeaveBalanceCalculations.GetLatestDatePaid(_payrollContext, WhatYear);
            var FirstPayPeriodStartDate = FirstPay.AddDays(-DaysTillPayDay); //DateAdd(DateInterval.Day, -DaysTillPayDay, CDate(FirstPay))
            var PayPeriodEndDate = LatestPay.AddDays(-DaysTillPayDay + 13); //DateAdd(DateInterval.Day, -DaysTillPayDay + 13, CDate(LatestPay))

            var StartBalSick = LeaveBalanceCalculations.GetSickStartingBalance(_payrollContext, WhatYear, empId);
            var EarnedSick = Math.Round(LeaveBalanceCalculations.GetSickEarnedYTD(_payrollContext, null, empId, LatestPay), 4);
            var UsedSick = LeaveBalanceCalculations.GetSickUsedYTD(_payrollContext, empId, "", FirstPayPeriodStartDate, PayPeriodEndDate);

            //Dim objVacation As New MAFormulas.Vacation
            var StartBalVaca = LeaveBalanceCalculations.GetVacationStartingBalance(_payrollContext, WhatYear, empId);
            var EarnedVaca = LeaveBalanceCalculations.GetVacationEarnedYTD(_payrollContext, null, empId, LatestPay);
            var UsedVaca = LeaveBalanceCalculations.GetVacationUsedYTD(_payrollContext, empId, "", FirstPayPeriodStartDate, PayPeriodEndDate);

            var SickBalance = StartBalSick + EarnedSick - UsedSick;
            var VacaBalance = StartBalVaca + EarnedVaca - UsedVaca;

            if (SickBalance >= (decimal)hrs)
                return 1;
            else if (VacaBalance >= (decimal)hrs)
                return 2;
            else
                return 3;
        }

        private static decimal GetVacationUsedYTD(FinexAppContext _payrollContext, int empId, string cso, DateTime FirstPayPeriodStartDate, DateTime PayPeriodEndDate)
        {
            return _payrollContext.Attendances
                .Where(x => x.date >= FirstPayPeriodStartDate && x.date.Value.Date <= PayPeriodEndDate && x.employeeId == empId)
                .Sum(x => x.vacationHours) ?? 0;

            //    strSQL = "SELECT Sum([Vacation Hours]) AS [VacaUsed]" _
            //        & " From Attendance" _
            //        & " WHERE [Date] Between '" & FirstPayPeriodStartDate & "'" _
            //        & " AND '" & PayPeriodEndDate & "'" _
            //        & " AND [Employee Id]=" & EmpID
            //Return rsData.QueryScalar(ConnString, strSQL)
        }
        private static decimal GetSickUsedYTD(FinexAppContext _payrollContext, int empId, string cso, DateTime FirstPayPeriodStartDate, DateTime PayPeriodEndDate)
        {
            return _payrollContext.Attendances
                .Where(x => x.date >= FirstPayPeriodStartDate && x.date.Value.Date <= PayPeriodEndDate && x.employeeId == empId)
                .Sum(x => x.sickLeaveHours) ?? 0;

            //    strSQL = "SELECT Sum([Sick Leave Hours]) AS [SickUsed]" _
            //   & " From Attendance" _
            //   & " WHERE [Date] Between '" & FirstPayPeriodStartDate & "'" _
            //   & " AND '" & PayPeriodEndDate & "'" _
            //   & " AND [Employee Id]=" & EmpID
            //Return rsData.QueryScalar(ConnString, strSQL)
        }
        private static decimal GetPersonalUsedYTD(FinexAppContext _payrollContext, int empId, string cso, DateTime FirstPayPeriodStartDate, DateTime PayPeriodEndDate)
        {
            return _payrollContext.Attendances
                .Where(x => x.date >= FirstPayPeriodStartDate && x.date.Value.Date <= PayPeriodEndDate && x.employeeId == empId)
                .Sum(x => x.personalTimeHours) ?? 0;

            //    strSQL = "SELECT Sum([Sick Leave Hours]) AS [SickUsed]" _
            //   & " From Attendance" _
            //   & " WHERE [Date] Between '" & FirstPayPeriodStartDate & "'" _
            //   & " AND '" & PayPeriodEndDate & "'" _
            //   & " AND [Employee Id]=" & EmpID
            //Return rsData.QueryScalar(ConnString, strSQL)
        }
        private static decimal GetCompUsedYTD(FinexAppContext _payrollContext, int empId, string cso, DateTime FirstPayPeriodStartDate, DateTime PayPeriodEndDate)
        {
            return _payrollContext.Attendances
                .Where(x => x.date >= FirstPayPeriodStartDate && x.date.Value.Date <= PayPeriodEndDate && x.employeeId == empId)
                .Sum(x => x.unexcusedHours) ?? 0;

            //    strSQL = "SELECT Sum([Sick Leave Hours]) AS [SickUsed]" _
            //   & " From Attendance" _
            //   & " WHERE [Date] Between '" & FirstPayPeriodStartDate & "'" _
            //   & " AND '" & PayPeriodEndDate & "'" _
            //   & " AND [Employee Id]=" & EmpID
            //Return rsData.QueryScalar(ConnString, strSQL)
        }
        private static decimal GetFedPaidSickUsedYTD(FinexAppContext _payrollContext, int empId, string cso, DateTime FirstPayPeriodStartDate, DateTime PayPeriodEndDate)
        {
            return _payrollContext.Attendances
                .Where(x => x.date >= FirstPayPeriodStartDate && x.date.Value.Date <= PayPeriodEndDate && x.employeeId == empId)
                .Sum(x => x.fedPaidSickHours) ?? 0;

            //    strSQL = "SELECT Sum([Sick Leave Hours]) AS [SickUsed]" _
            //   & " From Attendance" _
            //   & " WHERE [Date] Between '" & FirstPayPeriodStartDate & "'" _
            //   & " AND '" & PayPeriodEndDate & "'" _
            //   & " AND [Employee Id]=" & EmpID
            //Return rsData.QueryScalar(ConnString, strSQL)
        }
        private static decimal GetEmergencyFMLAUsedYTD(FinexAppContext _payrollContext, int empId, string cso, DateTime FirstPayPeriodStartDate, DateTime PayPeriodEndDate)
        {
            return _payrollContext.Attendances
                .Where(x => x.date >= FirstPayPeriodStartDate && x.date.Value.Date <= PayPeriodEndDate && x.employeeId == empId)
                .Sum(x => x.emergencyFMLAHours) ?? 0;

            //    strSQL = "SELECT Sum([Sick Leave Hours]) AS [SickUsed]" _
            //   & " From Attendance" _
            //   & " WHERE [Date] Between '" & FirstPayPeriodStartDate & "'" _
            //   & " AND '" & PayPeriodEndDate & "'" _
            //   & " AND [Employee Id]=" & EmpID
            //Return rsData.QueryScalar(ConnString, strSQL)
        }
        private static decimal GetPersonalBonusUsedYTD(FinexAppContext _payrollContext, int empId, string cso, DateTime FirstPayPeriodStartDate, DateTime PayPeriodEndDate)
        {
            return _payrollContext.Attendances
                .Where(x => x.date >= FirstPayPeriodStartDate && x.date.Value.Date <= PayPeriodEndDate && x.employeeId == empId)
                .Sum(x => x.bonusPerUsed) ?? 0;

            //    strSQL = "SELECT Sum([Sick Leave Hours]) AS [SickUsed]" _
            //   & " From Attendance" _
            //   & " WHERE [Date] Between '" & FirstPayPeriodStartDate & "'" _
            //   & " AND '" & PayPeriodEndDate & "'" _
            //   & " AND [Employee Id]=" & EmpID
            //Return rsData.QueryScalar(ConnString, strSQL)
        }

        private static decimal GetVacationEarnedYTD(FinexAppContext _payrollContext, DateTime? startDate, int empId, DateTime LatestPay)
        {
            if (startDate is null)
                startDate = new DateTime(LatestPay.Year, 1, 1);

            return _payrollContext.PayrollTotals.AsNoTracking().Where(x => x.prDatePaid >= startDate && x.prDatePaid <= LatestPay && x.empId == empId)
                .Sum(x => x.prVacaEarned + x.vacaAdd);

            //    If Not IsDate(StartDate) Then
            //   StartDate = " Between '01/01/" & CDate(EndDate).Year & "' AND '" & EndDate & "'"
            //Else
            //    StartDate = " Between '" & StartDate & "' AND '" & EndDate & "'"
            //End If

            //strSQL = "SELECT Sum(PR_Vaca_Earned) + Sum([VacaAdd]) AS VacaEarnedYear" _
            //    & " From Payroll_Totals" _
            //    & " WHERE [PR_Date_Paid] " & StartDate _
            //    & " AND [Emp_ID]=" & EmpID
            //Return rsData.QueryScalar(ConnString, strSQL)
        }
        private static decimal GetSickEarnedYTD(FinexAppContext _payrollContext, DateTime? startDate, int empId, DateTime LatestPay)
        {
            if (startDate is null)
                startDate = new DateTime(LatestPay.Year, 1, 1);

            return _payrollContext.PayrollTotals.AsNoTracking().Where(x => x.empId == empId && x.prDatePaid >= startDate && x.prDatePaid <= LatestPay)
                .Sum(x => x.prSickTimeEarned + x.sickAdd);

            /*
             If Not IsDate(StartDate) Then
            StartDate = " Between '01/01/" & CDate(EndDate).Year & "' AND '" & EndDate & "'"
        Else
            StartDate = " Between '" & StartDate & "' AND '" & EndDate & "'"
        End If

        strSQL = "SELECT Sum(PR_SickTime_Earned) + Sum([SickAdd]) AS SickEarnedYear" _
            & " From Payroll_Totals" _
            & " WHERE [PR_Date_Paid] " & StartDate _
            & " AND [Emp_ID]=" & EmpID
        Return rsData.QueryScalar(ConnString, strSQL)
            */
        }
        private static decimal GetPersonalEarnedYTD(FinexAppContext _payrollContext, DateTime? startDate, int empId, DateTime LatestPay)
        {
            if (startDate is null)
                startDate = new DateTime(LatestPay.Year, 1, 1);

            return _payrollContext.PayrollTotals.AsNoTracking().Where(x => x.empId == empId && x.prDatePaid >= startDate && x.prDatePaid <= LatestPay)
                .Sum(x => x.prPersonalEarned + x.personAdd);

            /*
             If Not IsDate(StartDate) Then
            StartDate = " Between '01/01/" & CDate(EndDate).Year & "' AND '" & EndDate & "'"
        Else
            StartDate = " Between '" & StartDate & "' AND '" & EndDate & "'"
        End If

        strSQL = "SELECT Sum(PR_SickTime_Earned) + Sum([SickAdd]) AS SickEarnedYear" _
            & " From Payroll_Totals" _
            & " WHERE [PR_Date_Paid] " & StartDate _
            & " AND [Emp_ID]=" & EmpID
        Return rsData.QueryScalar(ConnString, strSQL)
            */
        }
        private static decimal GetCompEarnedYTD(FinexAppContext _payrollContext, DateTime? startDate, int empId, DateTime LatestPay)
        {
            return _payrollContext.Attendances.AsNoTracking().Where(x => x.employeeId == empId && x.date >= startDate && x.date <= LatestPay)
                .Sum(x => x.compEarnedHours) ?? 0;

            /*
             If Not IsDate(StartDate) Then
            StartDate = " Between '01/01/" & CDate(EndDate).Year & "' AND '12/31/" & CDate(EndDate).Year & "'"
        Else
            StartDate = " Between '" & StartDate & "' AND '" & EndDate & "'"
        End If

        sb.Clear()
        sb.Append("SELECT Sum([Comp Earned Hours]) AS CompEarned ")
        sb.Append("FROM Attendance ")
        sb.AppendFormat("WHERE [Date] {0} ", StartDate)
        sb.AppendFormat("AND [Employee Id]={0}", EmpID.ToString)
        Return rsData.QueryScalar(ConnString, sb.ToString)
            */
        }
        private static decimal GetPersonalBonusEarnedYTD(FinexAppContext _payrollContext, DateTime? startDate, int empId, DateTime LatestPay)
        {
            return _payrollContext.Attendances.AsNoTracking().Where(x => x.employeeId == empId && x.date >= startDate && x.date <= LatestPay)
                .Sum(x => x.bonusPerEarned) ?? 0;

            /*
             If Not IsDate(StartDate) Then
            StartDate = " Between '01/01/" & CDate(EndDate).Year & "' AND '12/31/" & CDate(EndDate).Year & "'"
        Else
            StartDate = " Between '" & StartDate & "' AND '" & EndDate & "'"
        End If

        sb.Clear()
        sb.Append("SELECT Sum([Comp Earned Hours]) AS CompEarned ")
        sb.Append("FROM Attendance ")
        sb.AppendFormat("WHERE [Date] {0} ", StartDate)
        sb.AppendFormat("AND [Employee Id]={0}", EmpID.ToString)
        Return rsData.QueryScalar(ConnString, sb.ToString)
            */
        }

        private static decimal GetVacationStartingBalance(FinexAppContext _payrollContext, int WhatYear, int empId)
        {
            DateTime endDate = DateTime.Now.Date;

            if (WhatYear != DateTime.Now.Year)
                endDate = new DateTime(WhatYear, 12, 31);

            DateTime startDate = new DateTime(WhatYear, 1, 1);

            var vacaStartingBalRow = _payrollContext.PreYearStartingBalances.FirstOrDefault(x => x.empId == empId && x.date >= startDate && x.date <= endDate && !x.endDate.HasValue && x.vacBal > 0);
            if (vacaStartingBalRow == null)
                vacaStartingBalRow = _payrollContext.PreYearStartingBalances.FirstOrDefault(x => x.empId == empId && x.date >= startDate && x.date <= endDate && x.vacBal > 0);

            return vacaStartingBalRow?.vacBal ?? 0;

            //    If Now.Year = WhatYear Then
            //    WhatYear = Now.ToString("MM/dd/yyyy")
            //Else
            //    WhatYear = "12/31/" & WhatYear
            //End If

            //strSQL = "SELECT VacBal" _
            //    & " FROM PreYearsStartingBalance" _
            //    & " WHERE [Date] Between '01/01/" & CDate(WhatYear).Year & "' AND '" & WhatYear & "'" _
            //    & " AND [EmpID]=" & EmpID & " AND (VacBal <> 0)" _
            //    & " AND [EndDate] Is Null" _
            //    & " ORDER BY VacBal DESC"
            //Dim dt As DataTable = rsData.SelectRowsDS(ConnString, strSQL).Tables(0)

            //If dt.Rows.Count = 0 Then
            //    strSQL = "SELECT VacBal" _
            //        & " FROM PreYearsStartingBalance" _
            //        & " WHERE [Date] Between '01/01/" & CDate(WhatYear).Year & "' AND '" & WhatYear & "'" _
            //        & " AND [EmpID]=" & EmpID & " AND (VacBal <> 0)" _
            //        & " ORDER BY VacBal DESC"
            //    Return rsData.QueryScalar(ConnString, strSQL)
            //Else
            //    Return dt.Rows(0)("VacBal")
            //End If

        }
        private static decimal GetCompStartingBalance(FinexAppContext _payrollContext, int WhatYear, int empId)
        {
            DateTime endDate = new DateTime(WhatYear, 12, 31);
            DateTime startDate = new DateTime(WhatYear, 1, 1);

            var vacaStartingBalRow = _payrollContext.PreYearStartingBalances.FirstOrDefault(x => x.empId == empId && x.date >= startDate && x.date <= endDate && !x.endDate.HasValue && x.compBal > 0);

            return vacaStartingBalRow?.compBal ?? 0;

            //sb.Append("SELECT CompBal ")
            //sb.Append("FROM PreYearsStartingBalance ")
            //sb.AppendFormat("WHERE [Date] Between '01/01/{0}' AND '12/31/{0}' ", WhatYear)
            //sb.AppendFormat("AND [EmpID]={0} AND (CompBal <> 0) ", EmpID.ToString)
            //Return rsData.QueryScalar(ConnString, sb.ToString)

        }
        private static decimal GetFedPaidSickStartingBalance(FinexAppContext _payrollContext, int WhatYear, int empId)
        {
            DateTime endDate = new DateTime(WhatYear, 12, 31);
            DateTime startDate = new DateTime(WhatYear, 1, 1);

            var vacaStartingBalRow = _payrollContext.PreYearStartingBalances.FirstOrDefault(x => x.empId == empId && x.date >= startDate && x.date <= endDate && !x.endDate.HasValue && x.fedSickPaidBill > 0);

            return vacaStartingBalRow?.fedSickPaidBill ?? 0;

            //sb.Append("SELECT CompBal ")
            //sb.Append("FROM PreYearsStartingBalance ")
            //sb.AppendFormat("WHERE [Date] Between '01/01/{0}' AND '12/31/{0}' ", WhatYear)
            //sb.AppendFormat("AND [EmpID]={0} AND (CompBal <> 0) ", EmpID.ToString)
            //Return rsData.QueryScalar(ConnString, sb.ToString)

        }
        private static decimal GetEmergencyFMLAStartingBalance(FinexAppContext _payrollContext, int WhatYear, int empId)
        {
            DateTime endDate = new DateTime(WhatYear, 12, 31);
            DateTime startDate = new DateTime(WhatYear, 1, 1);

            var vacaStartingBalRow = _payrollContext.PreYearStartingBalances.FirstOrDefault(x => x.empId == empId && x.date >= startDate && x.date <= endDate && !x.endDate.HasValue && x.emergencyFmlaBal > 0);

            return vacaStartingBalRow?.emergencyFmlaBal ?? 0;

            //sb.Append("SELECT CompBal ")
            //sb.Append("FROM PreYearsStartingBalance ")
            //sb.AppendFormat("WHERE [Date] Between '01/01/{0}' AND '12/31/{0}' ", WhatYear)
            //sb.AppendFormat("AND [EmpID]={0} AND (CompBal <> 0) ", EmpID.ToString)
            //Return rsData.QueryScalar(ConnString, sb.ToString)

        }
        private static decimal GetSickStartingBalance(FinexAppContext _payrollContext, int WhatYear, int empId)
        {
            DateTime endDate = DateTime.Now.Date;

            if (WhatYear != DateTime.Now.Year)
                endDate = new DateTime(WhatYear, 12, 31);

            DateTime startDate = new DateTime(WhatYear, 1, 1);

            var startingBalRow = _payrollContext.PreYearStartingBalances.FirstOrDefault(x => x.empId == empId && x.date >= startDate && x.date <= endDate && !x.endDate.HasValue && x.sickBal > 0);
            if (startingBalRow == null)
                startingBalRow = _payrollContext.PreYearStartingBalances.FirstOrDefault(x => x.empId == empId && x.date >= startDate && x.date <= endDate && x.sickBal > 0);

            return startingBalRow?.sickBal ?? 0;

            //    If Now.Year = WhatYear Then
            //    WhatYear = Now.ToString("MM/dd/yyyy")
            //Else
            //    WhatYear = "12/31/" & WhatYear
            //End If

            //strSQL = "SELECT SickBal" _
            //    & " FROM PreYearsStartingBalance" _
            //    & " WHERE [Date] Between '01/01/" & CDate(WhatYear).Year & "' AND '" & WhatYear & "'" _
            //    & " AND [EmpID]=" & EmpID & " AND (SickBal <> 0)" _
            //    & " AND [EndDate] Is Null" _
            //    & " ORDER BY SickBal DESC"
            //Dim dt As DataTable = rsData.SelectRowsDS(ConnString, strSQL).Tables(0)

            //If dt.Rows.Count = 0 Then
            //    strSQL = "SELECT SickBal" _
            //        & " FROM PreYearsStartingBalance" _
            //        & " WHERE [Date] Between '01/01/" & CDate(WhatYear).Year & "' AND '" & WhatYear & "'" _
            //        & " AND [EmpID]=" & EmpID & " AND (SickBal <> 0)" _
            //        & " ORDER BY SickBal DESC"
            //    Return rsData.QueryScalar(ConnString, strSQL)
            //Else
            //    Return dt.Rows(0)("SickBal")
            //End If
        }
        private static decimal GetPersonalStartingBalance(FinexAppContext _payrollContext, DateTime PYearStart, DateTime PYearEnd, int empId, DateTime PayPeriodEndDate)
        {
            if (PayPeriodEndDate.Year != PYearStart.Year && PYearStart.Month == 1)
                PayPeriodEndDate = new DateTime(PYearStart.Year, 1, 1);

            if (PayPeriodEndDate >= PYearStart && PayPeriodEndDate <= PYearEnd)
            {
                var startingBalRow = _payrollContext.PreYearStartingBalances.FirstOrDefault(x => x.empId == empId && x.date >= PYearStart && x.date <= PYearEnd && x.personalBalance > 0);
                if (startingBalRow != null)
                    return startingBalRow.personalBalance;
            }
            PayPeriodEndDate = PayPeriodEndDate.AddDays(-13);
            if (PayPeriodEndDate >= PYearStart && PayPeriodEndDate <= PYearEnd)
            {
                var startingBalRow = _payrollContext.PreYearStartingBalances.FirstOrDefault(x => x.empId == empId && x.date >= PYearStart && x.date <= PYearEnd && x.personalBalance > 0);
                if (startingBalRow != null)
                    return startingBalRow.personalBalance;
            }
            return 0;

            //    If(CDate(PayPeriodEndDate).Year<> CDate(PYearStart).Year) And CDate(PYearStart).Month = 1 Then
            //    PayPeriodEndDate = "01/01/" & CDate(PYearStart).Year
            //End If

            //strSQL = "SELECT PersonalBal" _
            //    & " FROM PreYearsStartingBalance" _
            //    & " WHERE [Date] Between '" & PYearStart & "' AND '" & PYearEnd & "'" _
            //    & " AND CONVERT(DateTime, '" & PayPeriodEndDate & "') Between '" & PYearStart & "' AND '" & PYearEnd & "'" _
            //    & " AND [EmpID]=" & EmpID & " AND (PersonalBal <> 0)"
            //GetPersonalStartingBalance = rsData.QueryScalar(ConnString, strSQL)

            //If GetPersonalStartingBalance = 0 Then
            //    strSQL = "SELECT PersonalBal" _
            //        & " FROM PreYearsStartingBalance" _
            //        & " WHERE [Date] Between '" & PYearStart & "' AND '" & PYearEnd & "'" _
            //        & " AND CONVERT(DateTime, '" & DateAdd(DateInterval.Day, -13, CDate(PayPeriodEndDate)) & "') Between '" & PYearStart & "' AND '" & PYearEnd & "'" _
            //        & " AND [EmpID]=" & EmpID & " AND (PersonalBal <> 0)"
            //    GetPersonalStartingBalance = rsData.QueryScalar(ConnString, strSQL)
            //End If
        }
        private static decimal GetPersonalBonusStartingBalance(FinexAppContext _payrollContext, DateTime personalYrStart, DateTime personalYrEnd, int empId)
        {
            var startingBalRow = _payrollContext.PreYearStartingBalances.FirstOrDefault(x => x.empId == empId && x.date >= personalYrStart && x.date <= personalYrEnd && x.bonusPersonal > 0);
            return startingBalRow?.bonusPersonal ?? 0;
        }

        public static decimal GetVacationFuture(FinexAppContext finexAppContext, int empId, string cso, DateTime PayPeriodEnd)
        {
            return finexAppContext.Attendances.Where(x => x.date > PayPeriodEnd && x.employeeId == empId).Sum(x => x.vacationHours) ?? 0;
            //    strSQL = "SELECT Sum([Vacation Hours]) AS [VacaUsed]" _
            //        & " From Attendance" _
            //        & " WHERE [Date] > '" & PayPeriodEndDate & "'" _
            //        & " AND [Employee Id]=" & EmpID
            //Return rsData.QueryScalar(ConnString, strSQL)
        }
        public static decimal GetSickFuture(FinexAppContext finexAppContext, int empId, string cso, DateTime PayPeriodEnd)
        {
            return finexAppContext.Attendances.Where(x => x.date > PayPeriodEnd && x.employeeId == empId).Sum(x => x.sickLeaveHours) ?? 0;
            //    strSQL = "SELECT Sum([Sick Leave Hours]) AS [VacaUsed]" _
            //        & " From Attendance" _
            //        & " WHERE [Date] > '" & PayPeriodEndDate & "'" _
            //        & " AND [Employee Id]=" & EmpID
            //Return rsData.QueryScalar(ConnString, strSQL)
        }
        public static decimal GetPersonalFuture(FinexAppContext finexAppContext, int empId, string cso, DateTime PayPeriodEnd)
        {
            return finexAppContext.Attendances.Where(x => x.date > PayPeriodEnd && x.employeeId == empId).Sum(x => x.personalTimeHours) ?? 0;
            //    strSQL = "SELECT Sum([Personal Time Hours]) AS [VacaUsed]" _
            //        & " From Attendance" _
            //        & " WHERE [Date] > '" & PayPeriodEndDate & "'" _
            //        & " AND [Employee Id]=" & EmpID
            //Return rsData.QueryScalar(ConnString, strSQL)
        }
        public static decimal GetCompFuture(FinexAppContext finexAppContext, int empId, string cso, DateTime PayPeriodEnd)
        {
            return finexAppContext.Attendances.Where(x => x.date > PayPeriodEnd && x.employeeId == empId).Sum(x => x.unexcusedHours - x.compEarnedHours) ?? 0;
            //    strSQL = "SELECT Sum([Personal Time Hours]) AS [VacaUsed]" _
            //        & " From Attendance" _
            //        & " WHERE [Date] > '" & PayPeriodEndDate & "'" _
            //        & " AND [Employee Id]=" & EmpID
            //Return rsData.QueryScalar(ConnString, strSQL)
        }
        public static decimal GetFedPaidSickFuture(FinexAppContext finexAppContext, int empId, string cso, DateTime PayPeriodEnd)
        {
            return finexAppContext.Attendances.Where(x => x.date > PayPeriodEnd && x.employeeId == empId).Sum(x => x.fedPaidSickHours) ?? 0;
            //    strSQL = "SELECT Sum([Personal Time Hours]) AS [VacaUsed]" _
            //        & " From Attendance" _
            //        & " WHERE [Date] > '" & PayPeriodEndDate & "'" _
            //        & " AND [Employee Id]=" & EmpID
            //Return rsData.QueryScalar(ConnString, strSQL)
        }
        public static decimal GetEmergencyFMLAFuture(FinexAppContext finexAppContext, int empId, string cso, DateTime PayPeriodEnd)
        {
            return finexAppContext.Attendances.Where(x => x.date > PayPeriodEnd && x.employeeId == empId).Sum(x => x.emergencyFMLAHours) ?? 0;
            //    strSQL = "SELECT Sum([Personal Time Hours]) AS [VacaUsed]" _
            //        & " From Attendance" _
            //        & " WHERE [Date] > '" & PayPeriodEndDate & "'" _
            //        & " AND [Employee Id]=" & EmpID
            //Return rsData.QueryScalar(ConnString, strSQL)
        }
        public static decimal GetPersonalBonusFuture(FinexAppContext finexAppContext, int empId, string cso, DateTime PayPeriodEnd)
        {
            return finexAppContext.Attendances.Where(x => x.date > PayPeriodEnd && x.employeeId == empId).Sum(x => x.bonusPerUsed) ?? 0;
            //    strSQL = "SELECT Sum([Personal Time Hours]) AS [VacaUsed]" _
            //        & " From Attendance" _
            //        & " WHERE [Date] > '" & PayPeriodEndDate & "'" _
            //        & " AND [Employee Id]=" & EmpID
            //Return rsData.QueryScalar(ConnString, strSQL)
        }

        private static DateTime GetLatestDatePaid(FinexAppContext _payrollContext, int whatYear)
        {
            DateTime? firstPayDateOfYear = DateTime.Now.Date;

            var payrollRow = _payrollContext.PayrollTotals.Where(x => x.prDatePaid.Value.Year == whatYear).OrderByDescending(x => x.prDatePaid).FirstOrDefault();

            if (payrollRow != null)
                return payrollRow.prDatePaid!.Value;

            payrollRow = _payrollContext.PayrollTotals.Where(x => x.prDatePaid.Value.Year == (whatYear - 1)).OrderByDescending(x => x.prDatePaid).FirstOrDefault();

            if (payrollRow != null)
                return payrollRow.prDatePaid!.Value;

            return _payrollContext.PayrollDefaultValues.FirstOrDefault()!.firstPayDay!.Value;


            //    GetLatestDatePaid = Nothing

            //strSQL = "SELECT PR_Date_Paid AS LatestDate" _
            //    & " FROM Payroll_Totals" _
            //    & " GROUP BY PR_Date_Paid" _
            //    & " HAVING PR_Date_Paid BETWEEN '01/01/" & WhatYear & "' AND ' 12/31/" & WhatYear & "'" _
            //    & " ORDER BY PR_Date_Paid DESC"
            //Dim dt As DataTable = rsData.SelectRowsDS(ConnString, strSQL, "Temp").Tables(0)

            //If dt.Rows.Count > 0 Then
            //    GetLatestDatePaid = CDate(dt.Rows(0)("LatestDate")).ToString("MM/dd/yyyy")
            //Else
            //    strSQL = "SELECT PR_Date_Paid AS LatestDate" _
            //        & " FROM Payroll_Totals" _
            //        & " GROUP BY PR_Date_Paid" _
            //        & " HAVING PR_Date_Paid BETWEEN '01/01/" & WhatYear - 1 & "' AND ' 12/31/" & WhatYear - 1 & "'" _
            //        & " ORDER BY PR_Date_Paid DESC"
            //    GetLatestDatePaid = rsData.QueryScalarString(ConnString, strSQL)

            //    If IsDate(GetLatestDatePaid) Then
            //        GetLatestDatePaid = DateAdd(DateInterval.Day, 14, CDate(rsData.QueryScalarString(ConnString, strSQL)))
            //    Else
            //        strSQL = "SELECT [First Pay DAy]" _
            //            & " FROM Payroll_Default_Setup"
            //        GetLatestDatePaid = rsData.QueryScalarString(ConnString, strSQL)
            //    End If
            //End If

            //Return GetLatestDatePaid
        }
        private static int GetDaysTillPayDay(FinexAppContext _payrollContext)
        {
            return _payrollContext.PayrollDefaultValues.FirstOrDefault()?.dateDiffStartPay ?? 19;
            //    strSQL = "SELECT [Date Diff Start Pay]" _
            //    & " FROM Payroll_Default_Setup"
            //Return rsData.QueryScalar(ConnString, strSQL)
        }
        public static DateTime GetFirstPayDateOfYear(FinexAppContext _payrollContext, int whatYear)
        {
            DateTime? firstPayDateOfYear = DateTime.Now.Date;

            var payrollRow = _payrollContext.PayrollTotals.Where(x => x.prDatePaid.Value.Year == whatYear).OrderBy(x => x.prDatePaid).FirstOrDefault();

            if (payrollRow != null)
                return payrollRow.prDatePaid!.Value;

            payrollRow = _payrollContext.PayrollTotals.Where(x => x.prDatePaid.Value.Year == (whatYear - 1)).OrderByDescending(x => x.prDatePaid).FirstOrDefault();

            if (payrollRow != null)
                return payrollRow.prDatePaid!.Value;

            return _payrollContext.PayrollDefaultValues.FirstOrDefault()!.payrollStartDate!.Value;

            //strSQL = "SELECT PR_Date_Paid AS FirstDate" _
            //    & " FROM Payroll_Totals" _
            //    & " GROUP BY PR_Date_Paid" _
            //    & " HAVING PR_Date_Paid BETWEEN '01/01/" & WhatYear & "' AND '01/31/" & WhatYear & "'" _
            //    & " ORDER BY PR_Date_Paid"
            //Dim dt As DataTable = rsData.SelectRowsDS(ConnString, strSQL, "Temp").Tables(0)

            //If dt.Rows.Count > 0 Then
            //    GetFirstPayDateOfYear = CDate(dt.Rows(0)("FirstDate")).ToString("MM/dd/yyyy")
            //Else
            //    GetFirstPayDateOfYear = rsData.QueryScalarString(ConnString, strSQL)
            //    If IsDate(GetFirstPayDateOfYear) Then
            //        strSQL = "SELECT PR_Date_Paid AS LatestDate" _
            //            & " FROM Payroll_Totals" _
            //            & " GROUP BY PR_Date_Paid" _
            //            & " HAVING PR_Date_Paid BETWEEN '01/01/" & WhatYear - 1 & "' AND ' 12/31/" & WhatYear - 1 & "'" _
            //            & " ORDER BY PR_Date_Paid DESC"
            //        GetFirstPayDateOfYear = DateAdd(DateInterval.Day, 14, CDate(GetFirstPayDateOfYear))
            //    Else
            //        strSQL = "SELECT [Payroll Start Date]" _
            //            & " FROM Payroll_Default_Setup"
            //        GetFirstPayDateOfYear = rsData.QueryScalarString(ConnString, strSQL)
            //    End If

            //End If

            //Return GetFirstPayDateOfYear
        }

        public static int AddAttendace(int empId, int orgId, DateTime? workDate, FinexAppContext _payrollContext)
        {
            try
            {
                Attendance attendance = new Attendance();
                attendance.employeeId = empId;
                //attendance.OrgAccountId = orgId;
                attendance.date = workDate;
                _payrollContext.Attendances.Add(attendance);
                _payrollContext.SaveChanges();
                return attendance.Id;
            }
            catch (Exception ex)
            {

                Console.WriteLine(ex.Message);
                return 0;
            }
        }
        public static void UpdateAttendance(int attendanceId, string LType, string LHoursField, double iHours, string? Memo, int? LeaveCodeId, int? FamilyLeaveAct, DateTime Date, FinexAppContext _payrollContext)
        {

            var data = _payrollContext.Attendances.FirstOrDefault(x => x.Id == attendanceId);
            LeaveType? leaveType = null;
            if (LeaveCodeId.HasValue)
                leaveType = _payrollContext.LeaveTypes.FirstOrDefault(x => x.id == LeaveCodeId);

            //GetPropertyValue(employeePayrollSetup, "supressTimeCard")
            var lTypeField = typeof(Attendance).GetProperty(LType, BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance | BindingFlags.Static);
            var lhoursfiled = typeof(Attendance).GetProperty(LHoursField, BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance | BindingFlags.Static);
            var memoField = typeof(Attendance).GetProperty("notes", BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance | BindingFlags.Static);
            var leaveCodeIdField = typeof(Attendance).GetProperty("leaveCodeId", BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance | BindingFlags.Static);
            var familyLeaveActField = typeof(Attendance).GetProperty("familyLeaveAct", BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance | BindingFlags.Static);
            var dateField = typeof(Attendance).GetProperty("date", BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance | BindingFlags.Static);
            var typeField = typeof(Attendance).GetProperty("type", BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance | BindingFlags.Static);

            //var lhoursfiled = typeof(Attendance).GetProperty(LHoursField);

            if (lTypeField != null)
            {
                lTypeField.SetValue(data, true);
                lhoursfiled.SetValue(data, (decimal)iHours);
                memoField.SetValue(data, Memo);

                familyLeaveActField.SetValue(data, FamilyLeaveAct > 0 ? true : false);
                dateField.SetValue(data, Date);
                leaveCodeIdField.SetValue(data, LeaveCodeId);

                if (leaveType != null)
                {
                    typeField.SetValue(data, leaveType.description);
                }

                _payrollContext.SaveChanges();
            }
        }
        public static List<DateTime?> GetPayDatesForSpecificDateSpan(DateTime? startDate, DateTime? endDate, int empId, int orgId, FinexAppContext _payrollContext)
        {
            var postDate = _payrollContext.PayrollTotals.Where(p => p.OrgAccountId == orgId && p.empId == empId &&
            ((startDate >= p.prStartDate && startDate <= p.prEndDate)
            || (endDate >= p.prStartDate && endDate <= p.prEndDate)))
            .Select(p => p.prDatePaid).Distinct().ToList();
            return postDate;
        }
        public static bool GetPayrollPosted(DateTime payDate, FinexAppContext _payrollContext)
        {
            var date = _payrollContext.PayrollTotals.Any(p => p.prDatePaid == payDate && p.postDate != null);
            return date;
        }

        public static bool DoNotAllowLeaveRequestsForPostedPeriods(DateTime? startDate, DateTime? endDate, int empId, int orgId, FinexAppContext _payrollContext)
        {
            var overlappingPayDates = GetPayDatesForSpecificDateSpan(startDate.Value.Date, endDate.Value.Date, empId, orgId, _payrollContext);
            var result = false;
            foreach (var payDates in overlappingPayDates)
            {
                if (GetPayrollPosted(payDates.Value.Date, _payrollContext))
                {
                    result = true;
                    break;
                }
            }
            return result;

        }
        public static DateTime SevenMinuteRule(DateTime dt)
        {
           dt =  dt.AddMicroseconds(-dt.Millisecond);
            dt = dt.AddSeconds(-dt.Second);

            var whatTime = dt.TimeOfDay;
            int totalMinutes = whatTime.Minutes;
            int minutesToAdd = 0;

            int minutePart = totalMinutes % 15;

            if (minutePart <= 7)
                minutesToAdd = -minutePart;
            else
                minutesToAdd = 15 - minutePart;

            return dt.AddMinutes(minutesToAdd);
            //var startRange = new TimeSpan(7, 53, 0);
            //var endRange = new TimeSpan(8, 52, 0);
            //
            //if (whatTime < startRange || whatTime > endRange)
            //{
            //    return whatTime;
            //}
            //return (whatTime) switch
            //{
            //    var t when t <= new TimeSpan(7, 59, 0) => new TimeSpan(8, 0, 0),
            //    var t when t <= new TimeSpan(8, 7, 0) => new TimeSpan(8, 0, 0),
            //    var t when t <= new TimeSpan(8, 22, 0) => new TimeSpan(8, 15, 0),
            //    var t when t <= new TimeSpan(8, 37, 0) => new TimeSpan(7, 30, 0),
            //    _ when whatTime <= new TimeSpan(8, 52, 0) => new TimeSpan(8, 45, 0),
            //    _ => whatTime

            //};
        }
        public static DateTime ThreeMinuteRule(DateTime dt)
        {
            dt = dt.AddMicroseconds(-dt.Millisecond);
            dt = dt.AddSeconds(-dt.Second);

            var whatTime = dt.TimeOfDay;
            int totalMinutes = whatTime.Minutes;
            int minutesToAdd = 0;

            int minutePart = totalMinutes % 6;

            if (minutePart <= 3)
                minutesToAdd = -minutePart;
            else
                minutesToAdd = 6 - minutePart;

            return dt.AddMinutes(minutesToAdd);
            //var startRange = new TimeSpan(7, 57, 0);
            //var strtRange = new TimeSpan(8, 56, 0);
            //if (timeSpan < startRange || timeSpan > strtRange)
            //{
            //    return timeSpan;
            //}
            //var timeBrackets = new Dictionary<TimeSpan, TimeSpan>
            //{
            //    {new TimeSpan(8,2,0), new TimeSpan(8,0,0) },
            //    {new TimeSpan(8,8,0), new TimeSpan(8,6,0) },
            //    {new TimeSpan(8,14,0), new TimeSpan(8,12,0) },
            //    {new TimeSpan(8,20,0), new TimeSpan(8,18,0) },
            //    {new TimeSpan(8,26,0), new TimeSpan(8,24,0) },
            //    {new TimeSpan(8,32,0), new TimeSpan(8,30,0) },
            //    {new TimeSpan(8,38,0), new TimeSpan(8,36,0) },
            //    {new TimeSpan(8,44,0), new TimeSpan(8,42,0) },
            //    {new TimeSpan(8,50,0), new TimeSpan(8,48,0) },
            //    {new TimeSpan(8,56,0), new TimeSpan(8,54,0) },
            //};
            //if (timeSpan <= new TimeSpan(7, 59, 0))
            //{
            //    return new TimeSpan(8, 0, 0);
            //}
            //foreach (var bracket in timeBrackets)
            //{
            //    if (timeSpan <= bracket.Key)
            //    {
            //        return bracket.Value;
            //    }
            //}
            //return timeSpan;
        }

        //public static DateTime SevenMinuteRule(DateTime whatDate)
        //{
        //    return SevenMinuteRule(whatDate);
        //    return new DateTime(whatDate.Year, whatDate.Month, whatDate.Day, whatTime.Hours, whatTime.Minutes, 0);
        //}
        //public static DateTime ThreeMinuteRule(DateTime whatDate)
        //{
        //    TimeSpan whatTime = ThreeMinuteRule(whatDate.TimeOfDay);
        //    return new DateTime(whatDate.Year, whatDate.Month, whatDate.Day, whatTime.Hours, whatTime.Minutes, 0);
        //}
        public static DateTime UpdateFMLAStartDate(DateTime? fmlaDate, int id, int empId, int orgId, FinexAppContext _context)
        {
            var date = _context.EmployeePayrollSetups.FindAsync(id).Result;
            if (date != null && date.empId == empId && date.OrgAccountId == orgId)
            {
                date.fmlaStartDate = fmlaDate;
                _context.EmployeePayrollSetups.Update(date);
                _context.SaveChangesAsync();
            }

            return (DateTime)date?.fmlaStartDate;
        }

        public static bool InsertIntoAttendanceAndTimecard(LeaveRequest leaveRequest, FinexAppContext _timecardContext, bool isNewEntry, bool isDelete)
        {
            try
            {
                var timecardHeader = _timecardContext.TimeCardHeaders.Where(x => x.empID == leaveRequest.empId && x.startDate.Date <= leaveRequest.beginDate.Date
                    && x.endDate.Value.Date >= leaveRequest.endDate.Date).FirstOrDefault();

                var hoursType = _timecardContext.CodeValues.Where(x => x.value == "Regular" && x.CODE_TYPE_ID == 11).Select(h => h.Id).FirstOrDefault();
                var holidaySchedule = _timecardContext.HolidayScheduleDates.Where(h => h.holidayScheduleId == leaveRequest.empId).Select(x => x.date).ToList();
                //var primaryJob = _timecardContext.Salaries.FirstOrDefault(x => x.empId == leaveRequest.empId && !x.endDate.HasValue);

                var startDate = leaveRequest.beginDate;
                DateTime WorkDate = startDate.AddDays(0);
                int dayOfWeekStart = (int)startDate.DayOfWeek;

                var timeCardScheduleOverRide = _timecardContext.TimecardEmployeeScheduleOverrides
                    .Where(x => x.employeeId == leaveRequest.empId && x.dayofWeek == dayOfWeekStart).ToList();

                List<Schedules> schedules = new List<Schedules>();

                if (timeCardScheduleOverRide.Any())
                {
                    foreach (var item in timeCardScheduleOverRide)
                    {
                        Schedules schedule = new Schedules();
                        schedule.startDateTime = item.startDateTime;
                        schedule.endDateTime = item.endDateTime;
                        schedule.employeeId = item.employeeId;
                        schedule.jobDescriptionId = item.jobDescriptionId;
                        schedule.createTimecardEntries = true;
                        schedules.Add(schedule);
                    }
                }
                else
                {
                    var schStartDate = leaveRequest.beginDate;
                    var schEndDate = leaveRequest.endDate;

                    Schedules schedule = new Schedules();
                    schedule.startDateTime = schStartDate.Date;
                    schedule.endDateTime = schStartDate.Date.AddDays(1).AddMilliseconds(-1);
                    schedule.employeeId = leaveRequest.empId;
                    schedule.jobDescriptionId = leaveRequest.jobDescriptionId;
                    schedule.createTimecardEntries = false;
                    schedules.Add(schedule);
                }

                foreach (var item in schedules)
                {
                    item.startDateTime = WorkDate.Date + item.startDateTime.TimeOfDay;
                    item.endDateTime = WorkDate.Date + item.endDateTime.TimeOfDay;
                }
                //if (timecardHeader != null)
                //{
                if (isNewEntry)
                {
                    var empTimecard = _timecardContext.TimeCards.Where(tc => tc.startDateTime <= leaveRequest.endDate &&
                    tc.endDateTime >= leaveRequest.beginDate && tc.hourTypeID != 0 && tc.empID == leaveRequest.empId).ToList();
                    if (empTimecard.Count > 0)
                    {
                        _timecardContext.TimeCards.RemoveRange(empTimecard);
                    }
                }
                else
                {
                    var empTimecard = _timecardContext.TimeCards.Where(tc => tc.startDateTime <= leaveRequest.endDate &&
                    tc.endDateTime >= leaveRequest.beginDate && tc.empID == leaveRequest.empId && (tc.leaveTypeID != null ||
                    (tc.leaveTypeID == null && tc.hourTypeID != 0))).ToList();
                    if (empTimecard.Count > 0)
                    {
                        _timecardContext.TimeCards.RemoveRange(empTimecard);
                    }
                }
                GetScheduleWithMultipleLeave(schedules, new List<LeaveRequest> { leaveRequest }, timecardHeader?.ID ?? 0, holidaySchedule, hoursType, leaveRequest.empId, _timecardContext, isDelete, false);
                GetTimeCardVacaSick(timecardHeader?.ID ?? 0, leaveRequest.OrgAccountId, leaveRequest.empId, leaveRequest.beginDate, leaveRequest.endDate, false, _timecardContext);
                //}
                return true;
            }
            catch (Exception)
            {

                return false;
            }
        }

        public static decimal GetEmployeeLunchTime(FinexAppContext _timecardContext, int emplId)
        {
            var empTimecardSetup = _timecardContext.TimecardEmployeeDetails.FirstOrDefault(x => x.empId == emplId);
            if (empTimecardSetup != null && empTimecardSetup.maxLunchTime.HasValue && empTimecardSetup.isNonPaidLunchEnabled)
                return empTimecardSetup.maxLunchTime.Value;

            return 0;
        }
        public static decimal GetHoursPerDay(FinexAppContext _timecardContext, int emplId)
        {
            var empPayrollSetup = _timecardContext.Salaries.FirstOrDefault(x => !x.endDate.HasValue && x.empId == emplId);
            if (empPayrollSetup == null)
                return 0;
            return empPayrollSetup.hoursPerDay ?? 0;
        }

        public static decimal GetScheduledEmpHours(FinexAppContext _timecardContext, int emplId, DateTime whatDate)
        {
            var empSchedules = _timecardContext.TimecardEmployeeScheduleOverrides.Where(x => x.employeeId == emplId && x.dayofWeek == (int)whatDate.DayOfWeek);
            if (!empSchedules.Any())
            {
                return LeaveBalanceCalculations.GetHoursPerDay(_timecardContext, emplId);
            }

            decimal totalHours = 0;
            foreach (var empSchedule in empSchedules)
            {
                totalHours += Math.Round((decimal)(empSchedule.endDateTime - empSchedule.startDateTime).TotalMinutes / 60, 2);
            }

            return totalHours;
        }

        public static decimal DayFactor(FinexAppContext _timecardContext, int emplId, DateTime whatDate)
        {
            decimal dayFactor = 0M;
            decimal lunchTime = GetEmployeeLunchTime(_timecardContext, emplId);
            decimal scheduledHours = GetScheduledEmpHours(_timecardContext, emplId, whatDate);

            return (((scheduledHours - lunchTime) / 2) + 0.5M);
        }

        //    Public Function DayFactor(ByVal ConnString As String, ByVal EmpID As Int32, ByVal WhatDate As String) As Decimal

        //    DayFactor = 0

        //    Dim MaxLunch As Decimal = EmployeeLunchTime(ConnString, EmpID)
        //    Return((ScheduledEmpHours(ConnString, EmpID, WhatDate) - MaxLunch) / 2) + 0.5

        //End Function
        public static void GetScheduleWithMultipleLeave(List<Schedules> timecardEmployeeSchedules, List<LeaveRequest> leaveRequests, int headerId, List<DateTime> holidayScheduleDate, int hoursType, int empId, FinexAppContext _timecardContext, bool isDelete, bool isBatchProcess)
        {

            foreach (var timecardEmployeeSchedule in timecardEmployeeSchedules)
            {
                DateTime currentStart = timecardEmployeeSchedule.startDateTime;
                if (isDelete == false)
                {
                    var relevantLeaves = leaveRequests.Where(lr => lr.endDate > timecardEmployeeSchedule.startDateTime && lr.beginDate < timecardEmployeeSchedule.endDateTime)
                        .OrderBy(lr => lr.beginDate).ToList();

                    foreach (var leave in relevantLeaves)
                    {

                        if (leave.beginDate > currentStart && timecardEmployeeSchedule.createTimecardEntries)
                        {
                            CreateTimeCard(currentStart, leave.beginDate < timecardEmployeeSchedule.endDateTime ? leave.beginDate :
                                 timecardEmployeeSchedule.endDateTime, 0, timecardEmployeeSchedule.jobDescriptionId ?? 0, headerId, hoursType, empId, leave.FMLAID, _timecardContext, isBatchProcess);
                        }

                        if (leave.beginDate < timecardEmployeeSchedule.endDateTime && leave.endDate > timecardEmployeeSchedule.startDateTime)
                        {
                            var startDateTime = leave.beginDate > timecardEmployeeSchedule.startDateTime ? leave.beginDate : timecardEmployeeSchedule.startDateTime;
                            var endDateTime = leave.endDate < timecardEmployeeSchedule.endDateTime ? leave.endDate : timecardEmployeeSchedule.endDateTime;

                            CreateTimeCard(startDateTime, endDateTime, leave.leaveTypeID, timecardEmployeeSchedule.jobDescriptionId ?? 0, headerId, 0, empId, leave.FMLAID, _timecardContext, isBatchProcess);

                        }
                        currentStart = leave.endDate > currentStart ? leave.endDate : currentStart;
                    }
                }
                if (holidayScheduleDate.Any(h => h.Date >= timecardEmployeeSchedule.startDateTime.Date && h.Date <= timecardEmployeeSchedule.endDateTime.Date))
                {
                    //leaveTypeID value hardcode
                    //var holidayLeaveType = _timecardContext.LeaveTypes.FirstOrDefault(x => x.description.ToLower() == "holiday");
                    var holidayHoursType = _timecardContext.CodeValues.Where(x => x.value == "Holiday" && x.CODE_TYPE_ID == 11).Select(h => h.Id).FirstOrDefault();

                    //if (holidayLeaveType == null)
                    //{
                    //    holidayLeaveType = new LeaveType
                    //    {
                    //        description = "Holiday",
                    //        isActive = "Y",
                    //        allowEmployeeSelect = false,
                    //        isReasonRequired = false
                    //    };

                    //    _timecardContext.LeaveTypes.Add(holidayLeaveType);
                    //    _timecardContext.SaveChanges();
                    //}

                    CreateTimeCard(currentStart, timecardEmployeeSchedule.endDateTime, 0, timecardEmployeeSchedule.jobDescriptionId ?? 0, headerId, holidayHoursType, empId, null, _timecardContext, isBatchProcess, true);
                    continue;
                }
                if (currentStart < timecardEmployeeSchedule.endDateTime && timecardEmployeeSchedule.createTimecardEntries)
                {
                    CreateTimeCard(currentStart, timecardEmployeeSchedule.endDateTime, 0, timecardEmployeeSchedule.jobDescriptionId ?? 0, headerId, hoursType, empId, null, _timecardContext, isBatchProcess);
                }
            }
        }
        public static void CreateTimeCard(DateTime startdatetime, DateTime enddatetime, int leaveTypeId, int employeeJobId, int headerId, int hoursType, int empId, int? fmlaId, FinexAppContext _timecardContext, bool isBatchProcess, bool isHoliday = false)
        {
            try
            {
                DateTime entryStartTime = startdatetime;
                DateTime entryEndTime = enddatetime;

                double timehours = (enddatetime - startdatetime).TotalHours;

                var enforce7MinRule = _timecardContext.SettingsValue.Where(x => x.settingsId == 60).Select(x => x.settingValue).FirstOrDefault();
                if (enforce7MinRule != null && enforce7MinRule == "1")
                {
                    entryStartTime = LeaveBalanceCalculations.SevenMinuteRule(startdatetime);
                    entryEndTime = LeaveBalanceCalculations.SevenMinuteRule(enddatetime);
                    timehours = (entryEndTime - entryStartTime).TotalHours;
                }
                else
                {
                    var enforce3MinRule = _timecardContext.SettingsValue.Where(x => x.settingsId == 61).Select(x => x.settingValue).FirstOrDefault();
                    if (enforce3MinRule != null && enforce3MinRule == "1")
                    {
                        entryStartTime = LeaveBalanceCalculations.ThreeMinuteRule(startdatetime);
                        entryEndTime = LeaveBalanceCalculations.ThreeMinuteRule(enddatetime);
                        timehours = (entryEndTime - entryStartTime).TotalHours;
                    }
                }

                if (isHoliday)
                    timehours = Math.Min((double)LeaveBalanceCalculations.GetScheduledEmpHours(_timecardContext, empId, startdatetime), timehours);

                var lunchHrs = GetEmployeeLunchTime(_timecardContext, empId);
                if (timehours >= 4 && leaveTypeId > 0)
                    timehours = timehours + (double)lunchHrs;
                if (timehours >= 4 && leaveTypeId == 0)
                    timehours = timehours - (double)lunchHrs;

                string username = "";
                if (isBatchProcess)
                    username = _timecardContext.Employees.FirstOrDefault(x => x.id == empId).userName;

                if (timehours > 0)
                {
                    var timeCards = (new TimeCards
                    {
                        empID = empId,
                        startDateTime = startdatetime,
                        endDateTime = enddatetime,
                        leaveTypeID = leaveTypeId,
                        hourTypeID = hoursType,
                        jobID = employeeJobId,
                        timeCardHeaderID = headerId,
                        hours = Math.Round(timehours, 2),
                        createdBy = username,
                        FMLAID = fmlaId,
                        IsFMLA = fmlaId.HasValue,
                    });

                    _timecardContext.TimeCards.Add(timeCards);
                    _timecardContext.SaveChanges();
                }
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }
    }
}
