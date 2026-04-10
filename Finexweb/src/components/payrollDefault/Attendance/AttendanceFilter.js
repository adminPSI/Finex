import React, { useEffect, useState } from "react";
import { Form, Field, FormElement } from "@progress/kendo-react-form";
import { FormDatePicker, FormDropDownList } from "../../form-components";
import { PayrollAttendance } from "../../../EndPoints";
import axiosInstance from "../../../core/HttpInterceptor";
const AttendanceFilter = ({ filterData, setFilterData }) => {
  const [paidDates, setPaidDates] = useState([]);
  const [formKey, setFormKey] = useState(1);

  useEffect(() => {
    getPaidDates();
    if (paidDates[0] !== filterData.datePaid) {
      getPayrollDetails(filterData.datePaid);
    }
  }, []);

  useEffect(() => {
    setFormKey(formKey + 1);
  }, [filterData.payEnd]);

  const getPaidDates = () => {
    axiosInstance({
      method: "GET",
      url: PayrollAttendance.GetDatePaid,
      withCredentials: false,
    })
      .then((response) => {
        if (response?.data?.data?.length) {
          setPaidDates(response.data.data);
          let firstRecord = response.data.data[0];
          getPayrollDetails(firstRecord);
          setFilterData({ datePaid: firstRecord });
        }
      })
      .catch(() => {});
  };

  const getPayrollDetails = async (date) => {
    const apiRequest = {
      DatePaid: date,
      mCustomPay: false,
    };
    return axiosInstance({
      method: "POST",
      url: PayrollAttendance.GetDatePaidDetailData,
      data: apiRequest,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        setFilterData({
          ...filterData,
          datePaid: date,
          payStart: data.payStartDate && new Date(data.payStartDate),
          payEnd: data.payEndDate && new Date(data.payEndDate),
          postDate: data.postDate && new Date(data.postDate),
        });
        setFormKey(formKey + 1);
      })
      .catch(() => {});
  };

  const getFieldData = (e) => {
    setFilterData((pre) => ({ ...pre, [e.target.name]: e.target.value }));
    getPayrollDetails(e.value);
  };

  return (
    <div>
      <div
        className="d-flex  k-flex-row k-w-full gap-3 pb-3 align-items-end k-flex-wrap"
        style={{ width: "100%" }}
      >
        <Form
          initialValues={filterData}
          key={formKey}
          render={(formRenderProps) => (
            <FormElement>
              <fieldset className={"k-form-fieldset"}>
                <div
                  className="d-flex justify-content align-items-end k-w-full"
                  style={{
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  <Field
                    id={"datePaid"}
                    name={"datePaid"}
                    label={"Date Paid"}
                    component={FormDropDownList}
                    value={filterData.datePaid}
                    data={paidDates}
                    onChange={getFieldData}
                    wrapperstyle={{
                      width: "23%",
                    }}
                    filterable={false}
                  />
                  <Field
                    id={"payStart"}
                    name={"payStart"}
                    label={"Pay Start"}
                    component={FormDatePicker}
                    wrapperstyle={{
                      width: "23%",
                    }}
                    disabled={true}
                    onChange={getFieldData}
                  />
                  <Field
                    id={"payEnd"}
                    name={"payEnd"}
                    label={"Pay End"}
                    value={filterData.payEnd}
                    component={FormDatePicker}
                    wrapperstyle={{
                      width: "23%",
                    }}
                    disabled={true}
                    onChange={getFieldData}
                  />

                  <Field
                    id={"postDate"}
                    name={"postDate"}
                    label={"Post Date"}
                    value={filterData.postDate}
                    component={FormDatePicker}
                    wrapperstyle={{
                      width: "23%",
                    }}
                    disabled={true}
                    onChange={getFieldData}
                  />
                </div>
              </fieldset>
            </FormElement>
          )}
        />
      </div>
    </div>
  );
};

export default AttendanceFilter;
