import "bootstrap/dist/js/bootstrap.bundle.js";
import React, { Suspense, lazy, useEffect, useRef, useState } from "react";
import { Route, Routes } from "react-router-dom";
import axiosInstance from "../src/core/HttpInterceptor.js";
import "./App.scss";
import Permission from "./components/Account/CACCodes/Permission.js";
import ResetPassword from "./components/Auth/ResetPassword.js";
import InactivityModal from "./components/modal/InactivityModal.js";
import { NotificationHandler } from "./components/NotificationHandler/NotificationHandler.js";
import Organization from "./components/Organisation/Organisation.js";
import { useAuthContext } from "./contexts/AuthContext.js";

const Home = lazy(() => import("./components/Home"));
const Dashboard = lazy(() => import("./components/Dashboard"));
const Reports = lazy(() => import("./components/Reports/Reports"));
const Account = lazy(() => import("./components/Account"));

const FunctionalDemo = lazy(
  () => import("./components/Privilege/FunctionalDemo")
);
const FunctionalDemoResourceData = lazy(
  () => import("./components/Privilege/FunctionalDemoResourceData")
);

const Timecard = lazy(() => import("./components/TimecardSetup/Timecard"));
const EditEmployeeSchedule = lazy(
  () => import("./components/TimecardSetup/EditEmployeeSchedule")
);
const EmployeeForDay = lazy(
  () => import("./components/TimecardEmployee/EmployeeForDay")
);
const EmployeeTimecard = lazy(
  () => import("./components/TimecardEmployee/EmployeeTimecard")
);
const YourTimecard = lazy(() => import("./components/YourTimecard"));
const EmployeeLeaveRequest = lazy(
  () => import("./components/TimecardEmployee/EmployeeLeaveRequest")
);
const EmployeeFutureLeave = lazy(
  () => import("./components/TimecardEmployee/EmployeeFutureLeave")
);

const AddNewSalary = lazy(() => import("./components/Payroll/AddSalaries"));
const AddSignificantRates = lazy(
  () => import("./components/Payroll/AddSignificantRates")
);
const AddSignificantDates = lazy(
  () => import("./components/Payroll/AddSignificantDates")
);

const PayrollEmployeeInfoForm = lazy(
  () => import("./components/Payroll/PayrollEmployeeInfoForm")
);
const FormDemo = lazy(() => import("./components/FormDemo"));
const Login = lazy(() => import("./components/Login"));
const Revenue = lazy(
  () => import("./components/Account/AccountReceivable/Revenue")
);
const AccountReceivable = lazy(
  () => import("./components/Account/AccountReceivable/Receivable")
);
const RevenueForm = lazy(
  () => import("./components/Account/AccountReceivable/RevenueForm")
);
const AccountReceivableForm = lazy(
  () => import("./components/Account/AccountReceivable/AccountReceivableForm")
);

const Funds = lazy(() => import("./components/Account/CACCodes/Funds"));
const PurchaseOrder = lazy(
  () => import("./components/PurchaseOrder/PurchaseOrder")
);
const Batch = lazy(() => import("./components/PurchaseOrder/Batch"));
const AddPurchaseOrder = lazy(
  () => import("./components/PurchaseOrder/AddPurchaseOrder")
);
const Configuration = lazy(() => import("./components/Configuration"));
const ExpenseCode = lazy(
  () => import("./components/Account/CACCodes/ExpenseCode")
);
const RevenueCode = lazy(
  () => import("./components/Account/CACCodes/RevenueCode")
);
const IHACExpense = lazy(
  () => import("./components/Account/IHACCodes/IHACExpense")
);
const IHACRevenue = lazy(
  () => import("./components/Account/IHACCodes/IHACRevenue")
);
const Program = lazy(() => import("./components/Account/IHACCodes/Program"));
const Department = lazy(
  () => import("./components/Account/IHACCodes/Department")
);
const IHCSubAccount = lazy(
  () => import("./components/Account/IHACCodes/IHCSubAccount")
);
const IHCAccount = lazy(
  () => import("./components/Account/IHACCodes/IHCAccount")
);
const Error500 = lazy(() => import("./components/Error500"));
const Error400 = lazy(() => import("./components/Error400"));
const ProjectCosting = lazy(
  () => import("./components/Projects/ProjectCosting")
);
const EquipmentSetup = lazy(
  () => import("./components/Equipment/EquipmentSetup")
);
const Inventory = lazy(
  () => import("./components/AssetsAndInventory/Inventory")
);
const Assets = lazy(() => import("./components/AssetsAndInventory/Assets"));
const AddAssets = lazy(
  () => import("./components/AssetsAndInventory/AddAssets")
);
const AddInventory = lazy(
  () => import("./components/AssetsAndInventory/AddInventory")
);
const PayrollEmployeeInfo = lazy(
  () => import("./components/Payroll/PayrollEmployeeInfo")
);
const PayrollAddNewEmployee = lazy(
  () => import("./components/Payroll/PayrollAddNewEmployee")
);
const SignificantRates = lazy(
  () => import("./components/Payroll/SignificantRates")
);
const YourBenefits = lazy(() => import("./components/Payroll/YourBenefits"));
const ContracterTimecard = lazy(
  () => import("./components/TimecardEmployee/ContracterTimeCard")
);
const AddRequestIHPO = lazy(
  () => import("./components/PurchaseOrder/RequestIHPO")
);
const ReviewIHPO = lazy(() => import("./components/PurchaseOrder/ReviewIHPO"));
const AddVoucher = lazy(() => import("./components/PurchaseOrder/AddVoucher"));
const ApproveIHPO = lazy(
  () => import("./components/PurchaseOrder/ApproveIHPO")
);
const SignIn = lazy(() => import("./components/Auth/SignIn"));
const Registration = lazy(() => import("./components/Auth/Registration"));
const RootLayout = lazy(() => import("./components/Layout/RootLayout"));
const AuthLayout = lazy(() => import("./components/Layout/AuthLayout"));

const AddPayDistribution = lazy(
  () => import("./components/Payroll/AddPayDistribution")
);
const AddBenefitsDistribution = lazy(
  () => import("./components/Payroll/AddBenefitsDistribution")
);
const StartingBalances = lazy(
  () => import("./components/Payroll/StartingBalances.js")
);
const AddNewBalances = lazy(
  () => import("./components/Payroll/AddNewBalances")
);

const PayrollHome = lazy(() => import("./components/Payroll/Home"));
const ExportSetup = lazy(
  () => import("./components/payrollDefault/ExportSetup")
);
const Attendence = lazy(() => import("./components/payrollDefault/Attendence"));
const BenefitAdjustment = lazy(
  () => import("./components/payrollDefault/BenefitAdjustment")
);
const PayrollDefaults = lazy(
  () => import("./components/payrollDefault/PayrollDefaults")
);
const BenefitSetup = lazy(
  () => import("./components/payrollDefault/BenefitSetup")
);

const Employee = lazy(() => import("./components/HR/Employee"));
const EditEmployee = lazy(() => import("./components/HR/EditEmployee"));

const VendorList = lazy(() => import("./components/VendorAndCustomer/Vender"));
const AssetsLocationLookup = lazy(
  () => import("./components/AssetsAndInventory/AssetsLocationLookup")
);
const Privilege = lazy(() => import("./components/Privilege/privilege"));
const AddRole = lazy(() => import("./components/Privilege/RolesEmployeesList"));
const PrevYearExpense = lazy(
  () => import("./components/PrevYear/PrevYearExpense")
);
const PrevYearRevenue = lazy(
  () => import("./components/PrevYear/PrevYearRevenue")
);
const TypeOfWork = lazy(() => import("./components/Work/TypeOfWork"));
const TypeOfLocation = lazy(() => import("./components/Work/TypeOfLocation"));
const UploadDocumentList = lazy(
  () => import("./components/UploadFile/UploadDocumentList")
);
const UploadDocument = lazy(
  () => import("./components/UploadFile/UploadDocument")
);
const Loaders = lazy(() => import("../src/components/Loaders.js"));

function App() {
  const [isLoaders, setIsLoaders] = React.useState(false);
  useEffect(() => {
    axiosInstance.interceptors.request.use(
      (config) => {
        setIsLoaders(true);
        return config;
      },
      (error) => {
        setIsLoaders(false);
        return Promise.reject(error);
      }
    );
    axiosInstance.interceptors.response.use(
      (config) => {
        setIsLoaders(false);
        return config;
      },
      (error) => {
        setIsLoaders(false);
        return Promise.reject(error);
      }
    );
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const { logOut } = useAuthContext();
  const user = JSON.parse(sessionStorage.getItem("user"));

  const inactivityTimeout = 10 * 1000;
  const refreshTokenTime =
    +localStorage.getItem("refreshTokenTime") * 60 * 1000;
  const inactivityTimer = useRef(null);

  useEffect(() => {
    if (user?.token) {
      setIsLogin(true);
    } else {
      setIsLogin(false);
      setIsModalOpen(false);
      clearTimeout(inactivityTimer.current);
    }
  }, [user]);

  useEffect(() => {
    if (isLogin) {
      inactivityTimer.current = null;
      resetInactivityTimer();
      setIsModalOpen(false);
    }
  }, []);

  const resetInactivityTimer = () => {
    if (isLogin) {
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
      inactivityTimer.current = setTimeout(() => {
        if (Login) {
          setIsModalOpen(true);
        }
      }, inactivityTimeout);
    } else {
      clearTimeout(inactivityTimer.current);
    }
  };

  const logout = () => {
    logOut();
    setIsModalOpen(false);
    resetInactivityTimer();
    inactivityTimer.current = null;
    clearTimeout(inactivityTimer.current);
    setIsLogin(false);
  };

  const continueLogin = () => {
    setIsModalOpen(false);
    resetInactivityTimer();
    getRefreshToken();
  };

  const onCloseModal = () => setIsModalOpen(false);

  useEffect(() => {
    if (isLogin) {
      const handleClick = resetInactivityTimer;
      const handleKeyPrss = resetInactivityTimer;

      window.addEventListener("click", handleClick);
      window.addEventListener("keydown", handleKeyPrss);
    } else {
      clearTimeout(inactivityTimer.current);
    }

    return () => clearTimeout(inactivityTimer.current);
  }, [isLogin]);

  useEffect(() => {
    if (isLogin) {
      const refreshTokenTimer = setTimeout(getRefreshToken, refreshTokenTime);
      return () => clearTimeout(refreshTokenTimer);
    }
  }, [refreshTokenTime, isLogin]);

  useEffect(() => {
    if (isModalOpen) {
      const modalOpenTimer = setTimeout(() => {
        onCloseModal();
        logOut();
      }, 60 * 1000);
      return () => clearTimeout(modalOpenTimer);
    }
  }, [isModalOpen]);

  const getRefreshToken = () => {
    localStorage.setItem("refreshTokenTime", 25);
  };

  return (
    <Suspense>
      <Loaders show={isLoaders} />
      <NotificationHandler />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route element={<AuthLayout />}>
          <Route path="/resetPassword" element={<ResetPassword />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/registration" element={<Registration />} />
        </Route>
        <Route element={<RootLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/account" element={<Account />} />
          <Route path="/timecard" element={<Timecard />} />
          <Route path="/timecard/your-timecard" element={<YourTimecard />} />
          <Route path="/timecard/timecard" element={<EmployeeTimecard />} />
          <Route
            path="/timecard/contracter-timecard"
            element={<ContracterTimecard />}
          />
          <Route
            path="/timecard/employee-schedule"
            element={<EditEmployeeSchedule />}
          />
          <Route path="/timecard/employeeForDay" element={<EmployeeForDay />} />
          <Route
            path="/timecard/future-leave"
            element={<EmployeeFutureLeave />}
          />
          <Route
            path="/timecard/leave-request"
            element={<EmployeeLeaveRequest />}
          />
          <Route
            path="/payroll/payroll-employee-info"
            element={<PayrollEmployeeInfo />}
          />
          <Route
            path="/payroll/significant-rates"
            element={<SignificantRates />}
          />
          <Route path="/payroll/benefits" element={<YourBenefits />} />
          <Route path="/formDemo" element={<FormDemo />} />
          <Route
            path="/payrollEmployeeInfoForm"
            element={<PayrollEmployeeInfoForm />}
          />
          <Route
            path="/PayrollAddNewEmployee"
            element={<PayrollAddNewEmployee />}
          />
          <Route path="/login" element={<Login />} />
          <Route path="/funds" element={<Funds />} />
          <Route path="/batch-voucher" element={<Batch />} />
          <Route path="/purchaseorder" element={<PurchaseOrder />} />
          <Route path="/addpurchaseorder" element={<AddPurchaseOrder />} />
          <Route path="/configuration" element={<Configuration />} />
          <Route path="/approveIHPO" element={<ApproveIHPO />} />
          <Route path="/addVoucher" element={<AddVoucher />} />
          <Route path="/reviewIHPO" element={<ReviewIHPO />} />
          <Route path="/requestIHPO" element={<AddRequestIHPO />} />
          <Route path="/expenseCode" element={<ExpenseCode />} />
          <Route path="/revenueCode" element={<RevenueCode />} />
          <Route path="/ihacExpense" element={<IHACExpense />} />
          <Route path="/ihacRevenue" element={<IHACRevenue />} />
          <Route path="/program" element={<Program />} />
          <Route path="/department" element={<Department />} />
          <Route path="/IHCSubAccount" element={<IHCSubAccount />} />
          <Route path="/IHCAccount" element={<IHCAccount />} />
          <Route
            path="/payroll/add-pay-distribution"
            element={<AddPayDistribution />}
          ></Route>
          <Route
            path="/payroll/add-benefits-distribution"
            element={<AddBenefitsDistribution />}
          ></Route>
          <Route
            path="/payroll/job/starting-balances"
            element={<StartingBalances />}
          ></Route>
          <Route
            path="/payroll/add-new-balances"
            element={<AddNewBalances />}
          ></Route>

          <Route path="/payroll/setup" element={<PayrollHome />}></Route>

          <Route path="/error500" element={<Error500 />} />
          <Route path="/error400" element={<Error400 />} />
          <Route path="*" element={<Error400 />} />
          <Route path="/projectcosting" element={<ProjectCosting />} />
          <Route path="/equipmentsetup" element={<EquipmentSetup />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/assets" element={<Assets />} />
          <Route path="/addassets" element={<AddAssets />} />
          <Route path="/addinventory" element={<AddInventory />} />

          <Route
            path="/payroll/add-significant-dates"
            element={<AddSignificantDates />}
          ></Route>
          <Route
            path="/payroll/add-significant-rates"
            element={<AddSignificantRates />}
          ></Route>
          <Route path="/salaries/add-salary" element={<AddNewSalary />}></Route>
          <Route path="/Revenue" element={<Revenue />} />
          <Route path="/hr-employee" element={<Employee />} />
          <Route path="/hr-employee-edit" element={<EditEmployee />} />
          <Route path="/AccountReceivable" element={<AccountReceivable />} />
          <Route path="/revenue-form" element={<RevenueForm />} />
          <Route path="/receivable-form" element={<AccountReceivableForm />} />

          <Route path="/payroll/attendence" element={<Attendence />} />
          <Route
            path="/payroll/benefitAdjustment"
            element={<BenefitAdjustment />}
          />
          <Route path="/payroll/exportSetup" element={<ExportSetup />} />
          <Route
            path="/payroll/payrollDefaults"
            element={<PayrollDefaults />}
          />
          <Route path="/payroll/benefitSetup" element={<BenefitSetup />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/prevYearExpense" element={<PrevYearExpense />} />
          <Route path="/prevYearRevenue" element={<PrevYearRevenue />} />
          <Route path="/typeofWork" element={<TypeOfWork />} />
          <Route path="/typeofLocation" element={<TypeOfLocation />} />
          <Route path="/uploaddocument" element={<UploadDocument />} />
          <Route path="/uploaddocumentlist" element={<UploadDocumentList />} />
          <Route path="/vendor" element={<VendorList />} />
          <Route
            path="/assetsLocationLookup"
            element={<AssetsLocationLookup />}
          />
          <Route path="/privilege" element={<Privilege />} />
          <Route path="/addrole" element={<AddRole />} />

          <Route path="/organization" element={<Organization />} />
          <Route path="/permission" element={<Permission />} />
          <Route path="/FunctionalDemo" element={<FunctionalDemo />} />
          <Route
            path="/FunctionalDemoResourceData"
            element={<FunctionalDemoResourceData />}
          />
        </Route>
      </Routes>
      {isModalOpen && (
        <InactivityModal
          onLogout={logout}
          onContinue={continueLogin}
          onCloseModal={onCloseModal}
        />
      )}
    </Suspense>
  );
}
//
export default App;
