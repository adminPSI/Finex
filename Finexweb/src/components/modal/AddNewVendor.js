import { Button } from "@progress/kendo-react-buttons";
import { Dialog } from "@progress/kendo-react-dialogs";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import React, { useRef } from "react";
import { CommonEndPoints, VendorEndPoints } from "../../EndPoints";
import axiosInstance from "../../core/HttpInterceptor";
import {
  FormDatePicker,
  FormDropDownList,
  FormInput,
} from "../form-components";
import {
  vendorNameValidator,
  vendorTypeValidator
} from "../validators";

export default function AddNewVendor(props) {
  const CustomTitleBar = () => {
    return (
      <div className="d-flex align-items-center justify-content-center">
        <i
          className={"fa-solid " + (props?.vendorId ? "fa-edit" : "fa-plus")}
        ></i>
        <span className="ms-2">
          {props?.vendorId
            ? props.handleType == "Customer"
              ? "Edit Customer"
              : "Edit Vendor"
            : props.handleType == "Customer"
              ? "Add Customer"
              : "Add Vendor"}
        </span>
      </div>
    );
  };
  const [formInit, setFormInit] = React.useState();
  const [formKey, setFormKey] = React.useState(0);
  const [TypeList, setTypeList] = React.useState([]);
  const [selectedType, setSelectedType] = React.useState([]);
  const TypeRef = useRef([]);

  React.useEffect(() => {
    getType();
  }, []);
  React.useEffect(() => {
    firstLoad();
  }, [props.vendorId]);

  const firstLoad = async () => {
    let vendorId = props?.vendorId;
    if (vendorId) {
      await getVendorById(vendorId);
    }
  };
  const getType = async () => {
    axiosInstance({
      method: "GET",
      url: CommonEndPoints.Getcommon + "?id=" + 13,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        setTypeList(data);
        TypeRef.current = data;
        let vendorId = props?.vendorId;
        if (vendorId) {
          getVendorById(vendorId);
        }
        if (props.handleType) {
          let index = data.findIndex((code) => code.value == props.handleType);
          if (index >= 0) {
            setSelectedType(data[index]);
            let formData = {};
            formData.vendorType = data[index];
            setFormInit(formData);
            setFormKey(formKey + 1);
          }
        }
      })
      .catch(() => {});
  };
  const getVendorById = async (id) => {
    axiosInstance({
      method: "GET",
      url: VendorEndPoints.GetVendor + "/" + id,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        data.wDate = data.wDate ? new Date(data.wDate) : null;
        data.affidavitDate = data.affidavitDate
          ? new Date(data.affidavitDate)
          : null;
        setSelectedType(data.vendorType);
        setFormInit(data);
        setFormKey(formKey + 1);
      })
      .catch(() => {});
  };

  const handleVendorForm = (dataItem, e) => {
    if (dataItem?.id) {
      editVendor(dataItem, e);
    } else {
      AddNewVendor(dataItem, e);
    }
  };

  const AddNewVendor = (dataItem, e) => {
    const submitButton = e.target.querySelector("button[type='submit']");
    if (submitButton) {
      submitButton.disabled = true;
    }
    let apiRequest = {
      id: 0,
      vendorTypeId: dataItem.vendorType?.id,
      vendorType: "",
      orG_ID: 7,
      name: dataItem.name,
      address1: dataItem.address1,
      address2: dataItem.address2 || " ",
      city: dataItem.city,
      state: dataItem.state,
      zip: dataItem.zip,
      phone: dataItem.phone,
      sac: "",
      cac: "",
      vendorNo: dataItem.vendorNo,
      accountNo: dataItem.accountNo,
      poc: dataItem.poc,
      taxId: dataItem.taxId,
      vendorBAddress1: "",
      vendorBAddress2: "",
      vendorBCity: "",
      vendorBState: "",
      vendorBZip: "",
      vendorBPhone: "",
      vendorCat: 0,
      v1099: true,
      faxNumber: dataItem.faxNumber,
      customerNumber: dataItem.customerNumber,
      isActive: "Y",
      remittInvoice: true,
      wDate: dataItem.wDate==null?null:new Date(dataItem.wDate),
      remittInvoiceYn: "",
      affidavitDate: dataItem.affidavitDate==null?null:new Date(dataItem.affidavitDate),
      email: dataItem.email,
      memo: "",
    };
    axiosInstance({
      method: "POST",
      url: VendorEndPoints.AddVendor,
      data: apiRequest,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        props.handleVendorDialogClose("Added successfully");
        props.handlevendorDetail(data);
      })
      .catch(() => {})
      .finally(() => {
        if (submitButton) {
          submitButton.disabled = false;
        }
      });
  };
  const editVendor = (dataItem, e) => {
    const submitButton = e.target.querySelector("button[type='submit']");
    if (submitButton) {
      submitButton.disabled = true;
    }
    let apiRequest = {
      id: dataItem.id,
      vendorTypeId: dataItem.vendorType?.id,
      vendorType: "",
      orG_ID: 7,
      name: dataItem.name,
      address1: dataItem.address1,
      address2: dataItem.address2 || " ",
      city: dataItem.city,
      state: dataItem.state,
      zip: dataItem.zip,
      phone: dataItem.phone,
      sac: "",
      cac: "",
      vendorNo: dataItem.vendorNo,
      accountNo: dataItem.accountNo,
      poc: dataItem.poc,
      taxId: dataItem.taxId,
      vendorBAddress1: "",
      vendorBAddress2: "",
      vendorBCity: "",
      vendorBState: "",
      vendorBZip: "",
      vendorBPhone: "",
      vendorCat: 0,
      v1099: true,
      faxNumber: dataItem.faxNumber,
      customerNumber: dataItem.customerNumber,
      isActive: "Y",
      remittInvoice: true,
      wDate: dataItem.wDate==null?null:new Date(dataItem.wDate),
      remittInvoiceYn: "",
      affidavitDate: dataItem.affidavitDate==null?null:new Date(dataItem.affidavitDate),
      email: dataItem.email,
      memo: "",
    };
    axiosInstance({
      method: "PUT",
      url: VendorEndPoints.AddVendor + "/" + dataItem.id,
      data: apiRequest,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        props.handleVendorDialogClose("Updated Successfully");
        props.handlevendorDetail(data);
      })
      .catch(() => {})
      .finally(() => {
        if (submitButton) {
          submitButton.disabled = false;
        }
      });
  };

  return (
    <>
      <Dialog
        height={500}
        title={<CustomTitleBar />}
        onClose={() => {
          props.handleVendorDialogClose("");
        }}
      >
        <Form
          onSubmit={handleVendorForm}
          initialValues={formInit}
          key={formKey}
          render={(formRenderProps) => (
            <FormElement>
              <fieldset className={"k-form-fieldset"}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Field
                    id={"name"}
                    name={"name"}
                    label={"Vendor/Customer Name*"}
                    component={FormInput}
                    wrapperstyle={{
                      width: "100%",
                    }}
                    validator={vendorNameValidator}
                    maxlength={65}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Field
                    id={"vendorType"}
                    name={"vendorType"}
                    label={"Vendor/Customer Type*"}
                    textField="value"
                    dataItemKey="id"
                    component={FormDropDownList}
                    data={TypeList}
                    value={selectedType}
                    wrapperstyle={{
                      width: "100%",
                    }}
                    disabled={props.handleType}
                    validator={vendorTypeValidator}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Field
                    id={"vendorNo"}
                    name={"vendorNo"}
                    label={"Vendor Number"}
                    component={FormInput}
                    wrapperstyle={{
                      width: "100%",
                    }}
                    maxlength={10}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Field
                    id={"address1"}
                    name={"address1"}
                    label={"Address line1"}
                    component={FormInput}
                    wrapperstyle={{
                      width: "100%",
                    }}
                    maxlength={35}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <Field
                    id={"address2"}
                    name={"address2"}
                    label={"Address line2"}
                    component={FormInput}
                    wrapperstyle={{
                      width: "100%",
                    }}
                    maxlength={35}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Field
                    id={"city"}
                    name={"city"}
                    label={"City"}
                    component={FormInput}
                    wrapperstyle={{
                      width: "100%",
                    }}
                    maxlength={25}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Field
                    id={"state"}
                    name={"state"}
                    label={"State"}
                    component={FormInput}
                    wrapperstyle={{
                      width: "50%",
                      marginRight: "10px",
                    }}
                    maxlength={2}
                  />
                  <Field
                    id={"zip"}
                    name={"zip"}
                    label={"Zip"}
                    component={FormInput}
                    maxlength={10}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Field
                    id={"accountNo"}
                    name={"accountNo"}
                    label={"Vendor/Customer Account Number"}
                    component={FormInput}
                    wrapperstyle={{
                      width: "50%",
                      marginRight: "10px",
                    }}
                    //validator={vendorAccountNoValidator}
                    maxlength={15}
                  />
                  <Field
                    id={"taxId"}
                    name={"taxId"}
                    label={"Federal Tax ID"}
                    component={FormInput}
                    maxlength={11}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Field
                    id={"poc"}
                    name={"poc"}
                    label={"POC"}
                    component={FormInput}
                    wrapperstyle={{
                      width: "100%",
                    }}
                    maxlength={35}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Field
                    id={"phone"}
                    name={"phone"}
                    label={"Phone Number"}
                    component={FormInput}
                    wrapperstyle={{
                      width: "50%",
                      marginRight: "10px",
                    }}
                    maxlength={10}
                  />
                  <Field
                    id={"faxNumber"}
                    name={"faxNumber"}
                    label={"Fax Number"}
                    component={FormInput}
                    maxlength={10}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Field
                    id={"email"}
                    name={"email"}
                    label={"Email Address"}
                    component={FormInput}
                    wrapperstyle={{
                      width: "50%",
                      marginRight: "10px",
                    }}
                    maxlength={50}
                  />
                  <Field
                    id={"customerNumber"}
                    name={"customerNumber"}
                    label={"Customer Number"}
                    component={FormInput}
                    maxlength={50}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Field
                    id={"wDate"}
                    name={"wDate"}
                    label={"W9 Date"}
                    component={FormDatePicker}
                    wrapperstyle={{
                      width: "50%",
                    }}
                  />
                  <Field
                    id={"affidavitDate"}
                    name={"affidavitDate"}
                    label={"Affidavit Date"}
                    component={FormDatePicker}
                    wrapperstyle={{
                      width: "45%",
                    }}
                  />
                </div>

                <div className="k-form-buttons k-w-full">
                  <Button
                    type={"submit"}
                    className="k-w-full"
                    themeColor={"primary"}
                  >
                    Save
                  </Button>
                </div>
              </fieldset>
            </FormElement>
          )}
        />
      </Dialog>
    </>
  );
}
