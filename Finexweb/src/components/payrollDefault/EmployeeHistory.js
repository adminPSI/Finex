import { getter } from "@progress/kendo-data-query";
import { toString as kendoToString } from "@progress/kendo-intl";
import { getSelectedState, Grid, GridColumn } from "@progress/kendo-react-grid";
import React, { useState } from "react";
import axiosInstance from "../../core/HttpInterceptor";
import { payrollEndpoints } from "../../EndPoints";
import { CheckBoxCell } from "../cells/CheckBoxCell";
import {
  ColumnFormCurrencyTextBox,
  ColumnFormTextArea,
} from "../form-components";

export default function EmployeeHistory({
  selectedState,
  setSelectedState,
  EmployeePaidHistoryData,
  benefitData,
  setBenefitData,
  distributionData,
  setDistributionData,
  PREmployeeDistributions,
}) {
  const DATA_ITEM_KEY = "id";
  const SELECTED_FIELD = "selected";
  const idGetter = getter(DATA_ITEM_KEY);
  const [selectedHistory, setSelectedHistory] = useState(null);

  const onSelectionChange = React.useCallback(
    (event) => {
      const newSelectedState = getSelectedState({
        event,
        selectedState: selectedState,
        dataItemKey: DATA_ITEM_KEY,
      });
      if (Object.keys(selectedState)[0] !== Object.keys(newSelectedState)[0]) {
        setSelectedState(newSelectedState);
        const id = Object.keys(newSelectedState)[0];
        const data = distributionData.find((item) => item.id == id);
        if (data) {
          getEmployeeHistoryBenefits(
            data.payDistId,
            kendoToString(selectedHistory.prDatePaid, "MM/dd/yyyy")
          );
          PREmployeeDistributions({
            selected: "selected",
            datePaid: kendoToString(selectedHistory.prDatePaid, "MM/dd/yyyy"),
            selectedRowId: selectedHistory.empId,
            key: selectedHistory.jobDescriptionId,
          });
        }
      } else {
        setSelectedState({});
        setBenefitData([]);
      }
    },
    [selectedState, distributionData]
  );

  const myCustomDateCell = (props) => {
    var myDate = props.dataItem.prDatePaid;
    const [year, month, day] = myDate.split("T")[0].split("-");

    return <td>{`${month}/${day}/${year} `}</td>;
  };

  const getEmployeePaidDistributions = (dataItem) => {
    axiosInstance({
      method: "GET",
      url: payrollEndpoints.EmployeePaidDistributions + `?payId=${dataItem.id}`,
      withCredentials: true,
    }).then((response) => {
      let data = response.data;
      setDistributionData(data);

      const tmpData = distributionData.find((item) => item.primaryJob);
      if (tmpData) {
        setSelectedState({ [tmpData.id]: true });

        getEmployeeHistoryBenefits(
          tmpData.payDistId,
          kendoToString(dataItem.prDatePaid, "MM/dd/yyyy")
        );
        PREmployeeDistributions({
          selected: "selected",
          datePaid: kendoToString(dataItem.prDatePaid, "MM/dd/yyyy"),
          selectedRowId: dataItem.empId,
          key: dataItem.jobDescriptionId,
        });
      } else {
        setBenefitData([]);
        setSelectedState({});
      }
    });
  };

  const getEmployeeHistoryBenefits = (id, datePaid) => {
    axiosInstance({
      method: "GET",
      url:
        payrollEndpoints.EmployeeHistoryBenefits +
        `?payDistId=${id}` +
        `&datePaid=${datePaid}`,
      withCredentials: true,
    }).then((response) => {
      let data = response.data;
      setBenefitData(data);
    });
  };

  const onRowClickEmployeePaidHistoryData = (props) => {
    const { dataItem } = props;

    if (
      employeePaidHistorySelected &&
      employeePaidHistorySelected[dataItem.id]
    ) {
      setDistributionData([]);
      PREmployeeDistributions({});
      setSelectedHistory({});

      setBenefitData([]);
      setEmployeePaidHistorySelected({});
    } else {
      setDistributionData([]);
      PREmployeeDistributions({});
      setSelectedHistory(dataItem);
      getEmployeePaidDistributions(dataItem);
      setBenefitData([]);
      setEmployeePaidHistorySelected({ [dataItem.id]: true });
    }
  };

  const [employeePaidHistorySelected, setEmployeePaidHistorySelected] =
    useState({});

  return (
    <div>
      <div className="mt-3">
        <fieldset>
          <Grid
            data={EmployeePaidHistoryData.map((item) => ({
              ...item,
              [SELECTED_FIELD]: employeePaidHistorySelected[idGetter(item)],
            }))}
            scrollable={"scrollable"}
            style={{
              height: 155,
            }}
            onRowClick={onRowClickEmployeePaidHistoryData}
            selectedField={SELECTED_FIELD}
            selectable={{
              enabled: true,
              drag: false,
              cell: false,
              mode: "multiple",
            }}
          >
            <GridColumn
              field="prDatePaid"
              title="Date Paid"
              cell={myCustomDateCell}
            />
            <GridColumn field="jobName" title="Job Name" />
            <GridColumn field="jobId" title="Job Number" />
          </Grid>

          <br></br>
          <div>
            <Grid
              data={distributionData.map((item) => ({
                ...item,
                [SELECTED_FIELD]: selectedState[idGetter(item)],
              }))}
              dataItemKey={"id"}
              selectedField={SELECTED_FIELD}
              selectable={{
                enabled: true,
                drag: false,
                cell: false,
                mode: "multiple",
              }}
              onSelectionChange={onSelectionChange}
              scrollable="scrollable"
              style={{
                height: "18vh",
              }}
            >
              <GridColumn field="jobName" title="Job" />
              <GridColumn field="accountingCode" title="CAC" />
              <GridColumn field="ihac" title="IHAC" />
              <GridColumn field="sac" title="SAC" />
              <GridColumn field="payrollTotals.prSalary" title="Salary" />
              <GridColumn
                field="gross"
                title="Gross Pay"
                format="{0:c2}"
                headerCell={(props) => {
                  return (
                    <span className="k-cell-inner">
                      <span className="k-link !k-cursor-default d-flex justify-content-end">
                        <span className="k-column-title">{props.title}</span>
                        {props.children}
                      </span>
                    </span>
                  );
                }}
                cell={ColumnFormCurrencyTextBox}
              />
              <GridColumn
                field="nots"
                title="Notes"
                cell={ColumnFormTextArea}
              />
              <GridColumn
                field="primaryJob"
                title="Primary Jobs"
                cell={(props) => <CheckBoxCell {...props} showText="true" />}
              />
            </Grid>
          </div>

          <br></br>
          <Grid
            data={benefitData}
            scrollable={"scrollable"}
            style={{
              height: 155,
            }}
          >
            <GridColumn field="benefitName" title="Benefit" />
            <GridColumn
              field="prtbdAmount"
              title="Amount"
              format="{0:c2}"
              cell={ColumnFormCurrencyTextBox}
            />
            <GridColumn field="accountingCode" title="CAC" />
            <GridColumn field="prtbdIHAC" title="IHAC" />
            <GridColumn field="prtbdSAC" title="SAC" />
          </Grid>
          <br></br>
        </fieldset>
      </div>
    </div>
  );
}
