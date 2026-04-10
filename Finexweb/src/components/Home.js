import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../img/logo.jpg";
import PSILogo from "../img/PSI_logo.png";
import SignIn from "./Auth/SignIn";

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    if (
      sessionStorage.getItem("user") == "[]" ||
      sessionStorage.getItem("user") == null
    ) {
      return;
    } else {
      navigate("/dashboard");
    }
  }, []);

  return (
    <div className="app-wrapper content-wrapper w-100">
      <header className="header-wrapper">
        <div className="container">
          <div className="d-flex justify-content-between">
            <div className="logo">
              <img src={Logo} width={200} alt="logo" />
            </div>
            <div style={{ marginRight: "18px" }}>
              <img src={PSILogo} width={100} alt="logo" />
            </div>
          </div>
        </div>
      </header>
      <section className="heroScreen">
        <div className="container ">
          <div className="row d-flex justify-content-center h-100">
            <div className="d-flex flex-column col-12 col-md-7">
              <div className="hero-col-left">
                <div className="title-1">
                  <h1 className="title-heading">Finex</h1>
                </div>
                <div className="title-2">
                  <h1 className="title-heading">
                    Accurate accounting technology for government agencies
                  </h1>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-5">
              <div className="hero-form">
                <SignIn></SignIn>
              </div>
            </div>
          </div>
        </div>
      </section>
      <main className=" w-100 flex-1">
        <div>
          <div className="container">
            <div className="row d-flex justify-content-center">
              <div className="title-header-center-content col-md-7">
                <h3 className="title-header-center-text">
                  Feel confident reconciling accounts with your local and state
                  auditors’ offices.
                </h3>
              </div>
            </div>
          </div>
          <div className="tab-button-container container">
            <div className="row d-flex justify-content-center">
              <div className="col-md-3">
                <div className="tab-button-content text-center">
                  <a className="tab-text" target="_self" href="#section-1">
                    Accounts Payable & Receivable
                  </a>
                </div>
              </div>
              <div className="col-md-3">
                <div className="tab-button-content text-center">
                  <a className="tab-text" target="_self" href="#section-2">
                    Employee Payroll & Leave
                  </a>
                </div>
              </div>
              <div className="col-md-3">
                <div className="tab-button-content text-center">
                  <a className="tab-text" target="_self" href="#section-3">
                    Account Payable, Vouchers & Budgets
                  </a>
                </div>
              </div>
              <div className="col-md-3">
                <div className="tab-button-content text-center">
                  <a className="tab-text" target="_self" href="#section-4">
                    Asset, Inventory & Project Tracking
                  </a>
                </div>
              </div>
            </div>
          </div>
          <section className="section-1" id="section-1">
            <div className="container">
              <div className="row d-flex justify-content-center h-100 ">
                <div className="col-12 col-md-6">
                  <div className="section-img">
                    <img
                      src={
                        "https://primarysolutions.net/wp-content/uploads/2023/11/8.png"
                      }
                      width={500}
                      alt="logo"
                    />
                  </div>
                </div>
                <div className="col-12 col-md-6 d-flex flex-1">
                  <div className="section-content">
                    <div className="title-heading">
                      <h2>Accounts Payable & Receivable</h2>
                    </div>
                    <div className="content-text">
                      <p>
                        Track expenditures and receivables using County, State
                        and internal account codes. Feel confident when
                        reconciling with auditor offices. Store key documents
                        like vouchers as backups.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="section-2" id="section-2">
            <div className="container">
              <div className="row d-flex justify-content-center h-100 ">
                <div className="col-12 col-md-6">
                  <div className="section-img">
                    <img
                      src={
                        "https://primarysolutions.net/wp-content/uploads/2023/11/9.png"
                      }
                      width={500}
                      alt="logo"
                    />
                  </div>
                </div>
                <div className="col-12 col-md-6 d-flex flex-1">
                  <div className="section-content">
                    <div className="title-heading">
                      <h2>Employee Payroll & Leave</h2>
                    </div>
                    <div className="content-text">
                      <p>
                        Manage employee timecards, pay, leave requests, accruals
                        and raises in this customizable and compliant system.
                        Store confidential personnel records, benefits and other
                        important workforce management information.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="section-3" id="section-3">
            <div className="container">
              <div className="row d-flex justify-content-center h-100 ">
                <div className="col-12 col-md-6">
                  <div className="section-img">
                    <img
                      src={
                        "https://primarysolutions.net/wp-content/uploads/2023/11/11.png"
                      }
                      width={500}
                      alt="logo"
                    />
                  </div>
                </div>
                <div className="col-12 col-md-6 d-flex flex-1">
                  <div className="section-content">
                    <div className="title-heading">
                      <h2>Departmental Budgets & Purchase Tracking</h2>
                    </div>
                    <div className="content-text">
                      <p>
                        Ensure departments never exceed their budget with
                        purchase tracking, approvals and budget creation.
                        Create, track and store Account Payable, vouchers and
                        invoices in one system.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="section-4" id="section-4">
            <div className="container">
              <div className="row d-flex justify-content-center h-100 ">
                <div className="col-12 col-md-6">
                  <div className="section-img">
                    <img
                      src={
                        "https://primarysolutions.net/wp-content/uploads/2023/11/10.png"
                      }
                      width={500}
                      alt="logo"
                    />
                  </div>
                </div>
                <div className="col-12 col-md-6 d-flex flex-1">
                  <div className="section-content">
                    <div className="title-heading">
                      <h2>Asset, Inventory & Project Tracking</h2>
                    </div>
                    <div className="content-text">
                      <p>
                        Log inventory location, responsible parties, calculate
                        asset depreciation and report to county commissioners on
                        an annual basis. Create project costing, manage project
                        budget and track expenses in detail.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
