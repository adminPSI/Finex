using FinexAPI.Authorization;
using FinexAPI.Helper;
using FinexAPI.Models;
using FinexAPI.Models.AccountRevenue;
using FinexAPI.Models.Email;
using FinexAPI.Models.IHPOs;
using FinexAPI.Models.Organization;
using FinexAPI.Models.Payroll;
using FinexAPI.Models.PayrollDefaults;
using FinexAPI.Models.PayrollEmployee;
using FinexAPI.Models.PurchaseOrder;
using FinexAPI.Models.SAC;
using FinexAPI.Models.Voucher;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;

namespace FinexAPI.Data
{
    public class FinexAppContext : DbContext
    {
        private readonly IAppUser _appUser;
        //private readonly IHttpContextAccessor _context;
        private readonly ICurrentUserContext _currentUserContext;

        public FinexAppContext(DbContextOptions<FinexAppContext> options, IAppUser appUser, ICurrentUserContext currentUserContext) : base(options)
        {
            _currentUserContext = currentUserContext;
            _appUser = appUser;
        }

        public DbSet<CountyRevenue> CountyRevenue { get; set; }
        public DbSet<CountyRevenueBD> CountyRevenueBD { get; set; }


        public DbSet<CountyRevenueContrib> CountyRevenueContrib { get; set; }

        public DbSet<CountyRevenueDetails> CountyRevenueDetails { get; set; }

        public DbSet<AccountReceivables> AccountReceivables { get; set; }
        public DbSet<AccountReceivableDesc> AccountReceivableDesc { get; set; }

        public DbSet<RevenueReceivableApproval> RevenueReceivableApproval { get; set; }
        public DbSet<Asset> Assets { get; set; }
        public DbSet<AssetLocation> AssetLocations { get; set; }
        public DbSet<AssetSacAmount> AssetSacAmounts { get; set; }
        //public DbSet<Programs> Programs { get; set; }
        public DbSet<AssetLookup> AssetLookups { get; set; }
        public DbSet<OtherRevenueLookup> OtherRevenueLookups { get; set; }
        public DbSet<CodeValues> CodeValues { get; set; }
        public DbSet<CodeTypes> CodeTypes { get; set; }
        public DbSet<UploadDocument> UploadDocument { get; set; }
        public DbSet<Message> messages { get; set; }
        public DbSet<MessageAttachment> messageAttachments { get; set; }
        public DbSet<Employee> Employees { get; set; }
        public DbSet<EmployeeAddress> EmployeesAddress { get; set; }
        public DbSet<FundTrans> FundTranses { get; set; }
        public DbSet<EmployeeFamilyMember> EmployeesFamilyMember { get; set; }
        public DbSet<EmployeeUserMapping> EmployeeUserMapping { get; set; }
        public DbSet<Fund> Funds { get; set; }
        public DbSet<CashBalance> CashBalances { get; set; }
        public DbSet<AccountingCode> AccountingCodes { get; set; }
        public DbSet<BudgetAmount> BudgetAmounts { get; set; }
        public DbSet<Settings> Settings { get; set; }
        public DbSet<SettingsValue> SettingsValue { get; set; }
        public DbSet<Category> Category { get; set; }
        public DbSet<PreYearBalance> PreYearBalances { set; get; }
        public DbSet<PreYearBalanceRevenue> PreYearBalanceRevenues { set; get; }
        public DbSet<IHACCode> IHACCodes { get; set; }
        public DbSet<IHCAccount> IHCAccounts { get; set; }
        public DbSet<IHCDepartment> IHCDepartments { get; set; }
        public DbSet<IHCSubAccount> IHCSubAccounts { get; set; }
        public DbSet<IHCProgram> IHCPrograms { get; set; }
        public DbSet<IHACExpenseAmount> IHACExpenseAmounts { get; set; }
        public DbSet<SecurityProgDept> securityProgDepts { get; set; }
        public DbSet<IHPO> IHPO { get; set; }
        public DbSet<IHPODetails> IHPODetails { get; set; }
        public DbSet<IHPOPricing> IHPOPricing { get; set; }
        public DbSet<IHPOLineItem> IHPOLineItem { get; set; }
        public DbSet<IHPOApproval> IHPOApproval { get; set; }
        public DbSet<Vendor> Vendor { get; set; }
        public DbSet<IHPOWorkflowStep> IHPOWorkflowSteps { get; set; }
        public DbSet<Voucher> vouchers { get; set; }
        /*need to merge this into vouchercontext*/
        public DbSet<VoucherIHPO> VoucherIHPO { get; set; }
        public DbSet<Organization> Organizations { get; set; }
        public DbSet<OrgnizationLocation> orgnizationLocations { get; set; }
        public DbSet<OrgnizationAccount> orgnizationAccounts { get; set; }
        public DbSet<Attendance> Attendances { set; get; }
        public DbSet<PayrollTotals> PayrollTotals { set; get; }
        public DbSet<PayrollTotalBenefitDistribution> payrollTotalBenefitDistributions { set; get; }
        public DbSet<PayrollTotalDistribution> payrollTotalDistributions { set; get; }
        public DbSet<FinexAPI.Models.PayrollEmployee.Union> Unions { get; set; }
        public DbSet<Benefits> Benefits { set; get; }
        public DbSet<PayrollDefaultVacationrates> PayrollDefaultVacationrates { set; get; }
        public DbSet<PayrollDefaultValues> PayrollDefaultValues { set; get; }
        public DbSet<UnionPayrolldefaultsVacationRates> UnionPayrolldefaultsVacationRates { set; get; }
        public DbSet<BenefitPackageBenefitLink> BenefitPackageBenefitLinks { set; get; }
        public DbSet<BenefitPackage> BenefitPackages { set; get; }
        public DbSet<JobCodes> JobCodes { set; get; }
        public DbSet<PayrollJobDescription> PayrollJobDescriptions { set; get; }
        public DbSet<PayrollJobClassification> PayrollJobClassifications { set; get; }

        public DbSet<PayCodes> PayCodes { set; get; }
        public DbSet<PayrollRanges> PayrollRanges { set; get; }

        public DbSet<PayrollEmpYear> PayrollEmpYears { set; get; }

        public DbSet<BenefitType> BenefitTypes { set; get; }
        public DbSet<FinexAPI.Models.PayrollEmployee.County> Counties { set; get; }
        public DbSet<Salaries> Salaries { set; get; }
        public DbSet<SignificantRates> SignificantRates { set; get; }
        public DbSet<SignificantDates> SignificantDates { set; get; }
        public DbSet<PreYearStartingBalance> PreYearStartingBalances { set; get; }
        public DbSet<PayrollDistribution> PayrollDistributions { set; get; }
        public DbSet<FinexAPI.Models.PayrollEmployee.EmployeeDepartment> EmployeeDepartments { set; get; }
        //public DbSet<EmployeeJobInfo> EmployeeJobInfos { set; get; }
        public DbSet<EmployeePayrollBenefit> EmployeePayrollBenefits { set; get; }
        public DbSet<EmployeePayrollSetup> EmployeePayrollSetups { set; get; }
        public DbSet<FinexAPI.Models.PayrollEmployee.EEOJobDescription> EEOJobDescriptions { set; get; }
        public DbSet<BenefitIHACDistribution> benefitIHACDistributions { set; get; }
        public DbSet<Project> Projects { get; set; }
        public DbSet<ProjectEquipment> ProjectEquipments { get; set; }
        public DbSet<ProjectEquipmentSetup> ProjectEquipmentSetups { get; set; }
        public DbSet<ProjectLabor> ProjectLabors { get; set; }
        public DbSet<ProjectLocations> ProjectLocations { get; set; }
        public DbSet<ProjectMaterial> ProjectMaterials { get; set; }
        public DbSet<ProjectWorkTypes> ProjectWorkTypes { get; set; }
        public DbSet<CountyPO> CountyPO { get; set; }
        public DbSet<CountyPOType> CountyPOType { get; set; }
        public DbSet<CountyPOLineItem> CountyPOLineItem { get; set; }
        public DbSet<CountyPODetails> CountyPODetails { get; set; }
        public DbSet<CountyPOPricing> CountyPOPricing { get; set; }
        public DbSet<POAttention> POAttention { get; set; }
        public DbSet<POLiquidate> POLiquidate { get; set; }
        public DbSet<PODirectInq> PODirectInq { get; set; }
        public DbSet<PODeputy> PODeputy { get; set; }
        public DbSet<PODeliverTo> PODeliverTo { get; set; }
        public DbSet<VoucherBreakDown> VoucherBreakDowns { get; set; }
        public DbSet<VoucherInvoiceLineItem> VoucherInvoiceLineItems { get; set; }
        public DbSet<VoucherBatch> VoucherBatchs { get; set; }
        public DbSet<VoucherBatchLink> voucherBatchLink { get; set; }
        public DbSet<StateAccountCodeDetails> StateAccountCodeDetails { get; set; }
        public DbSet<LeaveType> LeaveTypes { get; set; }
        public DbSet<LeaveRequest> LeaveRequest { get; set; }
        public DbSet<TimecardEmployeeDetails> TimecardEmployeeDetails { get; set; }
        public DbSet<TimecardEmployeeSchedule> TimecardEmployeeSchedules { get; set; }
        public DbSet<TimecardEmpSchedule> TimecardEmpSchedules { get; set; }
        public DbSet<TimecardEmployeeScheduleOverride> TimecardEmployeeScheduleOverrides { get; set; }
        public DbSet<HolidayScheduleHeader> HolidayScheduleHeaders { get; set; }
        public DbSet<HolidayScheduleDate> HolidayScheduleDates { get; set; }
        public DbSet<SupervisorSubSchedules> SupervisorSubSchedules { get; set; }
        public DbSet<TimeCardHeaders> TimeCardHeaders { get; set; }
        public DbSet<TimeCards> TimeCards { get; set; }
        public DbSet<Vendor> Vendors { get; set; }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = new CancellationToken())
        {
            var addEditEntities = ChangeTracker.Entries().Where(e => e.State == EntityState.Added || e.State == EntityState.Modified).ToList();

            var OrgAccountId = _currentUserContext.OrgAccountId;
            foreach (var item in addEditEntities)
            {
                if (OrgAccountId > 0)
                {
                    if (item.Properties.Any(p => p.Metadata.Name == "OrgAccountId"))
                    {
                        item.Property("OrgAccountId").CurrentValue = OrgAccountId;
                    }
                }

                if (item.Entity.GetType() == typeof(Salaries))
                {
                    try
                    {
                        if (item.Property("hourlyRate").CurrentValue == null)
                        {
                            item.Property("hourlyRate").CurrentValue = 0M;
                        }
                        if (item.Property("payDaySalary").CurrentValue == null)
                        {
                            item.Property("payDaySalary").CurrentValue = 0M;
                        }
                        if (item.Property("hoursWorked").CurrentValue == null)
                        {
                            item.Property("hoursWorked").CurrentValue = 0M;
                        }
                    }
                    catch (Exception ex)
                    {
                        throw;
                    }
                }

            }

            AuditInformation.ApplyAuditInformation(this, _appUser);
            return base.SaveChangesAsync(cancellationToken);
        }

        public override int SaveChanges()
        {
            var addEditEntities = ChangeTracker.Entries().Where(e => e.State == EntityState.Added || e.State == EntityState.Modified).ToList();

            var OrgAccountId = _currentUserContext.OrgAccountId;
            foreach (var item in addEditEntities)
            {
                if (OrgAccountId > 0)
                {
                    if (item.Properties.Any(p => p.Metadata.Name == "OrgAccountId"))
                    {
                        item.Property("OrgAccountId").CurrentValue = OrgAccountId;
                    }
                }

                if (item.Entity.GetType() == typeof(Salaries))
                {
                    try
                    {
                        if (item.Property("hourlyRate").CurrentValue == null)
                        {
                            item.Property("hourlyRate").CurrentValue = 0M;
                        }
                        if (item.Property("payDaySalary").CurrentValue == null)
                        {
                            item.Property("payDaySalary").CurrentValue = 0M;
                        }
                        if (item.Property("hoursWorked").CurrentValue == null)
                        {
                            item.Property("hoursWorked").CurrentValue = 0M;
                        }
                    }
                    catch (Exception ex)
                    {
                        throw;
                    }
                }
            }
            AuditInformation.ApplyAuditInformation(this, _appUser);
            return base.SaveChanges();
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {


            //if (_context != null && _context.HttpContext != null && _context.HttpContext.Items.ContainsKey("OrgAccountId"))
            //{
            //var orgid = _currentUserContext.OrgAccountId;
            //if (orgid != 0)
            //{
            modelBuilder.Entity<PayrollDefaultVacationrates>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<CountyRevenue>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<CountyRevenueBD>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<AccountReceivables>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<RevenueReceivableApproval>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<Asset>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<AssetLocation>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<AssetSacAmount>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            // modelBuilder.Entity<Programs>().HasQueryFilter(e => e.ORG_ID == orgid);
            modelBuilder.Entity<AssetLookup>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<OtherRevenueLookup>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<UploadDocument>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<Employee>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<EmployeeAddress>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<EmployeeFamilyMember>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<EmployeeUserMapping>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<Fund>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<CashBalance>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<AccountingCode>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<SettingsValue>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            //modelBuilder.Entity<Category>().HasQueryFilter(e => e.ORG_ID == orgid);
            modelBuilder.Entity<PreYearBalance>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<IHACCode>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<IHCAccount>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<IHCDepartment>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<IHCSubAccount>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<IHCProgram>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<IHACExpenseAmount>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<SecurityProgDept>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<FundTrans>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<VoucherIHPO>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);

            modelBuilder.Entity<IHPO>()
            .HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId)
            .HasOne(x => x.IHPOWorkflowStep)
            .WithMany(x => x.IHPOs)
            .HasForeignKey(x => x.workflowStepSeq)
            .HasPrincipalKey(x => x.WorkflowId);

            modelBuilder.Entity<IHPODetails>().HasQueryFilter(e => e.OrgAccountId.HasValue && e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<IHPOPricing>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<IHPOLineItem>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<IHPOApproval>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<Vendor>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<IHPOWorkflowStep>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId)
                .HasAlternateKey(x => x.WorkflowId);
            modelBuilder.Entity<Voucher>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<Employee>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<Attendance>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<PayrollTotals>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<PayrollTotalBenefitDistribution>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<PayrollTotalDistribution>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<FinexAPI.Models.PayrollEmployee.Union>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<Benefits>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<PayrollDefaultValues>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<UnionPayrolldefaultsVacationRates>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<BenefitPackageBenefitLink>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<BenefitPackage>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<JobCodes>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<PayrollJobDescription>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<PayrollJobClassification>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<PayCodes>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<PayrollRanges>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<PayrollEmpYear>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<Salaries>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<SignificantRates>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<SignificantDates>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<PreYearStartingBalance>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<PayrollDistribution>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<EmployeePayrollBenefit>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<EmployeePayrollSetup>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<FinexAPI.Models.PayrollEmployee.EEOJobDescription>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<BenefitIHACDistribution>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<Project>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<ProjectEquipment>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<ProjectEquipmentSetup>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<ProjectLabor>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<ProjectLocations>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<ProjectMaterial>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<ProjectWorkTypes>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);

            modelBuilder.Entity<CountyPO>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<CountyPOLineItem>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<CountyPODetails>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<CountyPOPricing>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);

            modelBuilder.Entity<IHPOLineItem>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<VoucherBreakDown>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<VoucherInvoiceLineItem>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<Voucher>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<VoucherBatch>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<VoucherBatchLink>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<Employee>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<LeaveType>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<LeaveRequest>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<TimecardEmployeeDetails>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<TimecardEmployeeSchedule>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<TimecardEmployeeScheduleOverride>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<HolidayScheduleHeader>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<HolidayScheduleDate>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<SupervisorSubSchedules>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<TimeCardHeaders>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<TimeCards>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            modelBuilder.Entity<Vendor>().HasQueryFilter(e => e.OrgAccountId == _currentUserContext.OrgAccountId);
            //}
            //}


            modelBuilder.Entity<AccountReceivables>()
                .HasOne(x => x.CountyRevenueContrib)
                .WithMany()
                .HasForeignKey(x => x.vendorID);

            modelBuilder.Entity<AccountReceivableDesc>()
               .HasOne(x => x.CountyRevenueContrib)
               .WithOne()
               .HasForeignKey<AccountReceivableDesc>(x => x.customerID);

            modelBuilder.Entity<CountyRevenue>()
               .HasOne(x => x.CountyRevenueContrib)
               .WithMany()
               .HasForeignKey(x => x.rev_From);

            modelBuilder.Entity<CountyRevenueDetails>()
             .HasOne(x => x.CountyRevenue)
             .WithOne(x => x.CountyRevenueDetails)
             .HasForeignKey<CountyRevenueDetails>(x => x.countyRevenueId);

            modelBuilder.Entity<CountyRevenue>()
              .HasMany(x => x.CountyRevenueBD)
              .WithOne(x => x.CountyRevenue)
               .HasForeignKey(x => x.rev_ID);

            modelBuilder.Entity<AccountReceivables>()
             .HasMany(x => x.AccountReceivableDescs)
             .WithOne(x => x.AccountReceivable)
              .HasForeignKey(x => x.arID);

            modelBuilder.Entity<CountyRevenueBD>()
              .HasOne(x => x.CountyRevenueCode)
              .WithOne()
               .HasForeignKey<CountyRevenueBD>(x => x.rev_BD_CAC);

            modelBuilder.Entity<CountyRevenue>()
             .HasOne(x => x.RevenueReceivableApproval)
             .WithOne(x => x.CountyRevenue)
              .HasForeignKey<RevenueReceivableApproval>(x => x.refId);
            modelBuilder.Entity<AccountReceivables>()
            .HasOne(x => x.RevenueReceivableApproval)
            .WithOne(x => x.AccountReceivable)
             .HasForeignKey<RevenueReceivableApproval>(x => x.refId);

            modelBuilder.Entity<CountyRevenueBD>()
                .HasOne(x => x.AccountReceivables)
                .WithMany()
                .HasForeignKey(x => x.invoiceId);
            modelBuilder.Entity<CountyRevenue>()
                .HasOne(x => x.CodeValues).WithMany().HasForeignKey(x => x.status);

            modelBuilder.Entity<Asset>()
              .HasOne(a => a.Vendor)
              .WithMany()
              .HasForeignKey(a => a.supplier);

            modelBuilder.Entity<CodeTypes>().HasKey(x => x.Id);
            modelBuilder.Entity<CodeValues>().HasKey(x => x.Id);


            modelBuilder.Entity<CodeValues>()
                .HasOne(x => x.CodeTypes)
                .WithMany()
                .HasForeignKey(x => x.CODE_TYPE_ID);

            modelBuilder.Entity<Message>().HasKey(x => x.MessageID);
            modelBuilder.Entity<MessageAttachment>().HasKey(x => x.Id);


            modelBuilder.Entity<MessageAttachment>()
                .HasOne(x => x.Message)
                .WithMany()
                .HasForeignKey(x => x.MessageID);

            modelBuilder.Entity<AccountingCode>()
               .HasOne(a => a.Fund)
               .WithMany()
               .HasForeignKey(a => a.FundId);
            modelBuilder.Entity<PreYearBalance>()
                .HasOne(p => p.AccountingCode)
                .WithMany()
                .HasForeignKey(p => p.balCACID);
            modelBuilder.Entity<PreYearBalanceRevenue>()
                .HasOne(p => p.accountingCode)
                .WithMany()
                .HasForeignKey(p => p.cACID);

            modelBuilder.Entity<IHACCode>()
               .HasOne(a => a.IHACProgram)
               .WithMany()
               .HasForeignKey(a => a.programAccountingCode);

            modelBuilder.Entity<IHACCode>()
                .HasOne(a => a.IHACDepartment)
                .WithMany()
                .HasForeignKey(a => a.departmentAccountingCode);

            modelBuilder.Entity<IHACCode>()
                .HasOne(a => a.IHACAccount)
                .WithMany()
                .HasForeignKey(a => a.ihcAccountCode);

            modelBuilder.Entity<IHACCode>()
               .HasOne(a => a.IHACSubAccount)
               .WithMany()
               .HasForeignKey(a => a.subAccountAccountingCode);

            modelBuilder.Entity<IHACCode>()
               .HasOne(a => a.AccountingCode)
               .WithMany()
               .HasForeignKey(a => a.countyAccountingCode);

            modelBuilder.Entity<IHPO>().HasKey(x => x.ID);
            modelBuilder.Entity<IHPODetails>().HasKey(x => x.ID);
            modelBuilder.Entity<IHPOApproval>().HasKey(x => x.ID);
            modelBuilder.Entity<IHPOPricing>().HasKey(x => x.ID);
            modelBuilder.Entity<IHPOLineItem>().HasKey(x => x.ID);


            modelBuilder.Entity<IHPO>()
               .HasOne(x => x.IHPODetails)
               .WithOne(x => x.IHPO)
               .HasForeignKey<IHPODetails>(x => x.reqID);

            modelBuilder.Entity<IHPO>()
               .HasMany(x => x.IHPOApproval)
               .WithOne(x => x.IHPO)
               .HasForeignKey(x => x.reqID);

            modelBuilder.Entity<IHPO>()
               .HasOne(x => x.IHPOPricing)
               .WithOne(x => x.IHPO)
               .HasForeignKey<IHPOPricing>(x => x.reqID);

            modelBuilder.Entity<IHPO>()
                  .HasMany(x => x.IHPOLineItem)
                  .WithOne(x => x.IHPO)
                  .HasForeignKey(x => x.reqID);

            modelBuilder.Entity<IHPODetails>()
               .HasOne(x => x.Vendor)
               .WithMany()
               .HasForeignKey(x => x.reqVendor);
            modelBuilder.Entity<IHPO>()
                .HasOne(x => x.countyPO)
                .WithMany()
                .HasForeignKey(x => x.reqPOid);

            modelBuilder.Entity<Organization>()
               .HasOne(x => x.OrgnizationAccount)
               .WithOne(x => x.Organization)
               .HasForeignKey<OrgnizationAccount>(x => x.orgId);

            modelBuilder.Entity<Organization>()
                .HasOne(x => x.OrgnizationLocation)
                .WithOne(x => x.Organization)
                .HasForeignKey<OrgnizationLocation>(x => x.orgId);


            modelBuilder.Entity<PayrollTotals>()
              .HasOne(a => a.employee)
              .WithMany()
              .HasForeignKey(a => a.empId).IsRequired(false);

            modelBuilder.Entity<Benefits>()
               .HasOne(a => a.BenefitType)
               .WithMany()
               .HasForeignKey(a => a.benefitsType);
            modelBuilder.Entity<JobCodes>()
                .HasOne(j => j.PayrollJobDescription)
                .WithMany()
                .HasForeignKey(j => j.jobId);

            modelBuilder.Entity<Salaries>()
              .HasOne(a => a.JobDescription)
              .WithMany()
              .HasForeignKey(a => a.jobDescId);

            modelBuilder.Entity<EmployeePayrollBenefit>()
                .HasOne(b => b.benefit)
                .WithMany()
                .HasForeignKey(b => b.benefitId);
            modelBuilder.Entity<EmployeePayrollSetup>()
                .HasOne(a => a.Employee)
                .WithMany()
                .HasForeignKey(x => x.empId);
            modelBuilder.Entity<EmployeePayrollBenefit>()
                .HasOne(x => x.benefitIHACDistribution)
                .WithOne(x => x.EmployeePayrollBenefit)
                .HasForeignKey<BenefitIHACDistribution>(x => x.benId);

            modelBuilder.Entity<ProjectEquipment>()
                .HasOne(a => a.equipmentSetup)
                .WithMany()
                .HasForeignKey(a => a.equipmentId);

            modelBuilder.Entity<ProjectEquipment>()
                .HasOne(a => a.workType)
                .WithMany()
                .HasForeignKey(a => a.workTypeId);

            modelBuilder.Entity<ProjectLabor>()
                .HasOne(a => a.Employee)
                .WithMany()
                .HasForeignKey(a => a.empId);

            modelBuilder.Entity<ProjectLabor>()
                .HasOne(a => a.WorkType)
                .WithMany()
                .HasForeignKey(a => a.workTypeId);

            modelBuilder.Entity<ProjectMaterial>()
                .HasOne(a => a.Vendor)
                .WithMany()
                .HasForeignKey(a => a.vendorId);

            modelBuilder.Entity<ProjectMaterial>()
                .HasOne(a => a.WorkType)
                .WithMany()
                .HasForeignKey(a => a.workTypeId);

            modelBuilder.Entity<CountyPO>().HasKey(x => x.Id);
            modelBuilder.Entity<CountyPODetails>().HasKey(x => x.Id);
            modelBuilder.Entity<CountyPOPricing>().HasKey(x => x.Id);

            modelBuilder.Entity<CountyPO>()
                .HasOne(x => x.CountyPODetails)
                .WithOne(x => x.CountyPO)
                .HasForeignKey<CountyPODetails>(x => x.poId);//.OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CountyPO>()
                .HasOne(x => x.CountyPOPricing)
                .WithOne(x => x.CountyPO)
                .HasForeignKey<CountyPOPricing>(x => x.poId);//.OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CountyPO>()
                .HasMany(x => x.CountyPOLineItem)
                .WithOne(x => x.CountyPO)
                .HasForeignKey(x => x.countyPOId);//.OnDelete(DeleteBehavior.Cascade);

            // 1 pO has many liquidate
            modelBuilder.Entity<POLiquidate>()
                .HasOne(x => x.CountyPO)
                .WithMany()
                .HasForeignKey(x => x.countyPOId);

            modelBuilder.Entity<CountyPODetails>()
               .HasOne(x => x.Vendor)
               .WithMany()
               .HasForeignKey(x => x.poVendorNo);


            modelBuilder.Entity<Voucher>()
               .HasOne(a => a.vendor)
               .WithMany()
               .HasForeignKey(a => a.vendorNo);
            modelBuilder.Entity<CountyPODetails>()
                .HasOne(x => x.AccountingCode)
                .WithMany()
                .HasForeignKey(x => x.pocacid);
            modelBuilder.Entity<Voucher>()
                .HasOne(x => x.CountyPO)
                .WithMany()
                .HasForeignKey(x => x.poId);
            modelBuilder.Entity<Voucher>()
                .HasOne(x => x.accountingCode)
                .WithMany()
                .HasForeignKey(x => x.poCACId);

            modelBuilder.Entity<TimeCardHeaders>()
               .HasMany(x => x.TimeCards)
               .WithOne(h => h.TimeCardHeaders)
               .HasForeignKey(a => a.timeCardHeaderID);

            modelBuilder.Entity<SupervisorSubSchedules>()
            .HasKey(t => t.SupervisorSubScheduleId);
            modelBuilder.Entity<TimecardEmployeeSchedule>()
                .HasKey(x => x.id);

            modelBuilder.Entity<SupervisorSubSchedules>()
                .HasOne(a => a.supervisor)
                .WithMany()
                .HasForeignKey(a => a.supId);
            modelBuilder.Entity<SupervisorSubSchedules>()
                .HasOne(a => a.subSupervisor)
                .WithMany()
                .HasForeignKey(a => a.supSubId);
            modelBuilder.Entity<LeaveRequest>()
                .HasOne(a => a.employee)
                .WithMany()
                .HasForeignKey(a => a.empId);
            modelBuilder.Entity<TimecardEmployeeDetails>()
               .HasOne(a => a.Employee)
               .WithMany()
               .HasForeignKey(a => a.empId);
            modelBuilder.Entity<TimecardEmployeeScheduleOverride>()
                .HasOne(a => a.Employee)
                .WithMany()
                .HasForeignKey(a => a.employeeId);

            modelBuilder.Entity<LeaveRequest>()
                .HasOne(x => x.leaveType)
                .WithMany()
                .HasForeignKey(x => x.leaveTypeID);
            modelBuilder.Entity<TimeCards>()
                .HasOne(a => a.Employee)
                .WithMany()
                .HasForeignKey(a => a.empID);

            modelBuilder.Entity<LeaveRequest>()
              .HasOne(a => a.FMLAType)
              .WithMany()
              .HasForeignKey(a => a.FMLAID).IsRequired(false);

            modelBuilder.Entity<TimeCards>()
              .HasOne(a => a.FMLAType)
              .WithMany()
              .HasForeignKey(a => a.FMLAID).IsRequired(false);

            modelBuilder.Entity<Vendor>()
               .HasOne(a => a.VendorType)
               .WithMany()
               .HasForeignKey(a => a.vendorTypeId);
            //base.OnModelCreating(modelBuilder);
        }
    }
}
