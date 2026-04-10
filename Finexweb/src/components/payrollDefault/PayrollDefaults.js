import { Reveal } from "@progress/kendo-react-animation";
import {
  ExpansionPanel
} from "@progress/kendo-react-layout";
import React, { useEffect, useState } from "react";
import { PayrollEndPoints } from "../../EndPoints";
import axiosInstance from "../../core/HttpInterceptor";
import usePrivilege from "../../helper/usePrivilege";
import { ContractYearsForm } from "./ContractYearsForm";
import { DefaultsForm } from "./DefaultsForm";
import { RoundingForm } from "./RoundingForm";
import { VacationRatesForm } from "./VacationRateForm";
import { AddVacationPopup } from "./modals/AddVacationPopup";

export default function PayrollDefaults() {
  useEffect(() => {
    (async () => {
      try {
        const result = await axiosInstance({
          method: "GET",
          url: PayrollEndPoints.Vacation,
          withCredentials: false,
        });

        setContractFormInit(() => {
          const newState = result?.data;
          newState.forEach((element) => {
            if (element) {
              element.modifiedDate = new Date(element.modifiedDate);
            }
          });

          return newState;
        });
      } catch (e) {
        console.log(e, "error");
      }
    })();
  }, []);

  const [formInit, setFormInit] = useState([]);
  const [contractFormInit, setContractFormInit] = useState([]);

  const [vacationPopupVisible, setVacationPopupVisible] = useState(false);
  const [contractPopupVisible, setContractPopupVisible] = useState(false);
  const [recallApi, setRecallApi] = useState(0)

  useEffect(() => {
    (async () => {
      try {
        const result = await axiosInstance({
          method: "GET",
          url: PayrollEndPoints.Defaults,
          withCredentials: false,
        });

        setFormInit(() => {
          const newState = result?.data;
          if (newState) {
            newState.modifiedDate = new Date(newState.modifiedDate);
            newState.payrollStartDate = newState.payrollStartDate == null ? null : new Date(newState.payrollStartDate);
            newState.firstPayDay = newState.firstPayDay == null ? null : new Date(newState.firstPayDay);
            return [newState];
          }
        });
      } catch (e) {
        console.log(e, "error");
      }
    })();
  }, [recallApi]);

  const [expanded, setExpanded] = React.useState("");

  const { checkPrivialgeGroup, loading, error } = usePrivilege('PayrollOrganizationDataSetup')
  if (loading) return <div>Loading privileges...</div>
  if (error) return <div>Error: {error}</div>
  return (
    <React.Fragment>
      {checkPrivialgeGroup("PRDM", 1) && (<div>
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item active" aria-current="page">
              Payroll
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Payroll Details
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Payroll Defaults
            </li>
          </ol>
        </nav>

        <div className="row">
          <div className="col-sm-8">
            <figure>
              <blockquote className="blockquote">
                <h1>Payroll Defaults</h1>
              </blockquote>
            </figure>
          </div>
        </div>
        {checkPrivialgeGroup("PRDPanel", 1) && <>
          <ExpansionPanel
            className={"k-expanded-payroll"}
            title="Payroll Default"
            expanded={expanded == "Payroll Defaults"}
            tabIndex={0}
            key="Payroll Defaults"
            onAction={(event) => {
              setExpanded(event.expanded ? "" : "Payroll Defaults");
            }}
          >
            <Reveal>
              {expanded == "Payroll Defaults" && (
                <DefaultsForm formInit={formInit} setRecallApi={setRecallApi} expanded />
              )}
            </Reveal>
          </ExpansionPanel>

          <ExpansionPanel
            className={"k-expanded-payroll"}
            title="Rounding"
            expanded={expanded == "Rounding"}
            tabIndex={0}
            key="Rounding"
            onAction={(event) => {
              setExpanded(event.expanded ? "" : "Rounding");
            }}
          >
            <Reveal>
              {expanded == "Rounding" && <RoundingForm formInit={formInit} />}
            </Reveal>
          </ExpansionPanel>
        </>}
        {checkPrivialgeGroup("PRCYPanel", 1) && <>
          <ExpansionPanel
            className={"k-expanded-payroll"}
            title="Contract Years"
            expanded={expanded == "Contract Years"}
            tabIndex={0}
            key="Contract Years"
            onAction={(event) => {
              setExpanded(event.expanded ? "" : "Contract Years");
            }}
          >
            <Reveal>
              {expanded == "Contract Years" && (
                <ContractYearsForm
                  setContractPopupVisible={setContractPopupVisible}
                />
              )}
            </Reveal>
          </ExpansionPanel>

          <ExpansionPanel
            className={"k-expanded-payroll"}
            title="Vacation Rate"
            expanded={expanded == "Vacation Rate"}
            tabIndex={0}
            key="Vacation Rate"
            onAction={(event) => {
              setExpanded(event.expanded ? "" : "Vacation Rate");
            }}
          >
            <Reveal>
              {expanded == "Vacation Rate" && (
                <VacationRatesForm
                  setVacationPopupVisible={setVacationPopupVisible}
                  contractData={contractFormInit}
                  setContractData={setContractFormInit}
                />
              )}
            </Reveal>
          </ExpansionPanel>
        </>}
        {vacationPopupVisible && (
          <AddVacationPopup
            setVacationPopupVisible={setVacationPopupVisible}
            setData={setContractFormInit}
          />
        )}
      </div>)}
    </React.Fragment>
  );
}
