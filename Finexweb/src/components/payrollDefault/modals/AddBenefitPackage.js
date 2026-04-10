import { Button } from "@progress/kendo-react-buttons";
import { Dialog } from "@progress/kendo-react-dialogs";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import React, { useEffect } from "react";
import axiosInstance from "../../../core/HttpInterceptor";
import { PayrollEndPoints } from "../../../EndPoints";
import { FormInput } from "../../form-components";
export const AddBenefitPackage = ({
  setBenefitPackagePopupVisible,
  setPackageData,
  selectedPackageRowId,
  setSelectedPackageRowId,
}) => {
  const [benefitPackageFormInit, setBenefitPackageFormInit] = React.useState(
    []
  );
  const [formKey, setformKey] = React.useState(0);
  const closeMenuHandler = () => {
    setBenefitPackagePopupVisible(false);
    setSelectedPackageRowId && setSelectedPackageRowId(0);
  };
  useEffect(() => {
    (async () => {
      try {
        if (selectedPackageRowId) {
          const result = await axiosInstance({
            method: "GET",
            url: PayrollEndPoints.Packages + "/" + selectedPackageRowId,
            withCredentials: false,
          });
          setBenefitPackageFormInit(result.data);
          setformKey(formKey + 1);
        }
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);
  const handleSubmit = (dataItem) => {
    if (dataItem.id != undefined) {
      const data = {
        id: dataItem.id,
        orgAccountId: 7,
        benMacroName: dataItem.benMacroName,
        activeInd: true,
      };

      axiosInstance({
        method: "PUT",
        url: PayrollEndPoints.PackagesById.replace("#ID#", dataItem.id),
        data: data,
        withCredentials: false,
      })
        .then((response) => {
          (async () => {
            try {
              const result = await axiosInstance({
                method: "GET",
                url: PayrollEndPoints.Packages,
                withCredentials: false,
              });

              setPackageData(result.data);
            } catch (error) {
              console.log(error);
            }
          })();
          closeMenuHandler();
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      const data = {
        id: 0,
        orgAccountId: 7,
        benMacroName: dataItem.benMacroName,
        activeInd: true,
      };

      axiosInstance({
        method: "POST",
        url: PayrollEndPoints.Packages,
        data: data,
        withCredentials: false,
      })
        .then((response) => {
          (async () => {
            try {
              const result = await axiosInstance({
                method: "GET",
                url: PayrollEndPoints.Packages,
                withCredentials: false,
              });

              setPackageData(result?.data?.data || []);
            } catch (error) {
              console.log(error);
            }
          })();
          closeMenuHandler();
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };
  return (
    <Dialog
      width={500}
      title={
        <div className="d-flex align-items-center justify-content-center">
          <i
            className={
              "fa-solid " +
              " " +
              (benefitPackageFormInit.id > 0 ? "fa-edit" : "fa-plus")
            }
          ></i>
          <span className="ms-2">
            {benefitPackageFormInit.id > 0 ? "Edit Package" : "Add Package"}
          </span>
        </div>
      }
      onClose={closeMenuHandler}
    >
      <Form
        onSubmit={handleSubmit}
        initialValues={benefitPackageFormInit}
        key={formKey}
        render={(formRenderProps) => (
          <FormElement>
            <fieldset className={"k-form-fieldset"}>
              <Field
                id={"benMacroName"}
                name={"benMacroName"}
                label={"Benefit Package Name*"}
                component={FormInput}
                wrapperstyle={{
                  width: "100%",
                }}
              />

              <div className="k-form-buttons">
                <Button
                  themeColor={"primary"}
                  className={"col-12"}
                  type={"submit"}
                  disabled={!formRenderProps.allowSubmit}
                >
                  Save
                </Button>
              </div>
            </fieldset>
          </FormElement>
        )}
      />
    </Dialog>
  );
};
