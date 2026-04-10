import { Button } from "@progress/kendo-react-buttons";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import {
  Grid,
  GridColumn
} from "@progress/kendo-react-grid";
import {
  Drawer,
  DrawerContent,
  DrawerItem,
} from "@progress/kendo-react-layout";
import React, { useState } from "react";
import axiosInstance from "../../core/HttpInterceptor";
import { PayrollEndPoints } from "../../EndPoints";
import { FormInput } from "../form-components";
export default function PayrollAttendence({ payrollData }) {
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [deleteVisiblePackage, setDeleteVisiblePackage] = useState(false);
  const [, setShow] = React.useState(false);
  const [selectedBenefitRowId, setSelectedBenefitRowId] = React.useState(0);
  const [selectedPackageRowId, setSelectedPackageRowId] = React.useState(0);
  const [drawerexpanded, setDrawerExpanded] = React.useState(false);
  const itemss = [{ id: 1, text: "myText", name: "MyName" }];
  const [selectedId, setSelectedId] = React.useState();
  const BenefitSetupOffset = React.useRef({
    left: 0,
    top: 0,
  });
  const toggleDeleteDialogPackage = () => {
    setDeleteVisiblePackage(!deleteVisiblePackage);
  };
  const DeleteOnClickPackage = () => {
    let id = selectedPackageRowId;
    (async () => {
      try {
        await axiosInstance({
          method: "Delete",
          url: PayrollEndPoints.BenefitsByPackageID.replace("#ID#", id),
          withCredentials: false,
        });
        toggleDeleteDialogPackage();
      } catch (e) {
        console.log(e, "error");
      }
    })();
  };

  const handleContextMenuOpen = (e) => {
    e.preventDefault();
    setSelectedBenefitRowId(e.currentTarget.id);
    BenefitSetupOffset.current = {
      left: e.pageX,
      top: e.pageY,
    };
    setShow(true);
  };
  const toggleDeleteDialog = () => {
    setDeleteVisible(!deleteVisible);
  };
  const DeleteOnClick = () => {
    let id = selectedBenefitRowId;
    (async () => {
      try {
        await axiosInstance({
          method: "Delete",
          url: PayrollEndPoints.BenefitsById.replace("#ID#", id),
          withCredentials: false,
        });
        //setPayrollData(data)
        toggleDeleteDialog();
      } catch (e) {
        console.log(e, "error");
      }
    })();
  };
  const drawerhandleSelect = (ev) => {
    setDrawerExpanded(false);
  };
  const CustomItem = (props) => {
    return (
      <DrawerItem {...props}>
        <div className="item-descr-wrap">
          <Form
            onSubmit={{}}
            initialValues={{
              regular: "56.0000",
              overtime: "0",
              holidayWork: 0,
              holidayOT: 0,
              stHours: 0,
              nonstHours: 0,
              adjustment: 0,
              totalHours: 70.0,
              regularAmount: "1204.6.0000",
              otAmount: "0",
              holidayAmount: 0,
              holidayOTAmount: 0,
              stAmount: 0,
              nonstAmount: 0,
              adjustment: 0,
              gross: 1204.0,
              personalEarned: 0,
              vacaEarned: 0,
              sickEarned: 4.03,
              personalAdjust: 0,
              vacaAdjust: 0,
              sickAdjust: 0,
              vacaUsed: 0,
              sickUsed: 0,
              personal: 0,
              proDayUsed: 0,
              calamity: 0,
              compTime: 0,
              paidHol: 14.0,
            }}
            key={1}
            render={(formRenderProps) => (
              <FormElement>
                <fieldset className={"k-form-fieldset"}>
                  <div className="d-flex justify-content align-items-end ">
                    <Field
                      id={"regular"}
                      name={"regular"}
                      label={"Regular"}
                      component={FormInput}
                    />
                    <Field
                      id={"overtime"}
                      name={"overtime"}
                      label={"Overtime"}
                      component={FormInput}
                    />
                    <Field
                      id={"holidayWork"}
                      name={"holidayWork"}
                      label={"Holiday Work"}
                      component={FormInput}

                    />
                    <Field
                      id={"holidayOT"}
                      name={"holidayOT"}
                      label={"Holiday OT"}
                      component={FormInput}
                    />
                    <Field
                      id={"stHours"}
                      name={"stHours"}
                      label={"ST Hours"}
                      component={FormInput}
                    />
                    <Field
                      id={"nonstHours"}
                      name={"nonstHours"}
                      label={"NonST Hours"}
                      component={FormInput}
                    />
                    <Field
                      id={"adjustment"}
                      name={"adjustment"}
                      label={"Adjustment"}
                      component={FormInput}
                    />
                    <Field
                      id={"totalHours"}
                      name={"totalHours"}
                      label={"Total Hours"}
                      component={FormInput}

                    />
                  </div>
                  <div className="d-flex justify-content align-items-end ">
                    <Field
                      id={"regularAmount"}
                      name={"regularAmount"}
                      label={"Regular Amount"}
                      component={FormInput}

                    />
                    <Field
                      id={"otAmount"}
                      name={"otAmount"}
                      label={"OT Amount"}
                      component={FormInput}

                    />
                    <Field
                      id={"holidayAmount"}
                      name={"holidayAmount"}
                      label={"Holiday Amount"}
                      component={FormInput}

                    />
                    <Field
                      id={"holidayOTAmount"}
                      name={"holidayOTAmount"}
                      label={"Holiday OT Amount"}
                      component={FormInput}

                    />
                    <Field
                      id={"stAmount"}
                      name={"stAmount"}
                      label={"ST Amount"}
                      component={FormInput}

                    />
                    <Field
                      id={"nonstAmount"}
                      name={"nonstAmount"}
                      label={"NonST Amount"}
                      component={FormInput}

                    />{" "}
                    <Field
                      id={"adjustment"}
                      name={"adjustment"}
                      label={"Adjustment"}
                      component={FormInput}

                    />
                    <Field
                      id={"gross"}
                      name={"gross"}
                      label={"Gross"}
                      component={FormInput}

                    />
                  </div>
                  <div className="d-flex justify-content align-items-end ">
                    <Field
                      id={"personalEarned"}
                      name={"personalEarned"}
                      label={"Personal Earned"}
                      component={FormInput}

                    />
                    <Field
                      id={"vacaEarned"}
                      name={"vacaEarned"}
                      label={"VACA Earned"}
                      component={FormInput}

                    />
                    <Field
                      id={"sickEarned"}
                      name={"sickEarned"}
                      label={"Sick Earned"}
                      component={FormInput}

                    />
                    <Field
                      id={"personalAdjust"}
                      name={"personalAdjust"}
                      label={"Personal Adjust"}
                      component={FormInput}

                    />
                    <Field
                      id={"vacaAdjust"}
                      name={"vacaAdjust"}
                      label={"VACA Adjust"}
                      component={FormInput}

                    />
                    <Field
                      id={"sickAdjust"}
                      name={"sickAdjust"}
                      label={"Sick Adjust"}
                      component={FormInput}

                    />{" "}
                    <Field
                      id={"vacaUsed"}
                      name={"vacaUsed"}
                      label={"Vaca Used"}
                      component={FormInput}

                    />
                    <Field
                      id={"sickUsed"}
                      name={"sickUsed"}
                      label={"Sick Used"}
                      component={FormInput}

                    />
                  </div>
                  <div className="d-flex justify-content  align-items-end ">
                    <Field
                      id={"personal"}
                      name={"personal"}
                      label={"Personal"}
                      component={FormInput}

                    />
                    <Field
                      id={"proDayUsed"}
                      name={"proDayUsed"}
                      label={"ProDay Used"}
                      component={FormInput}

                    />
                    <Field
                      id={"calamity"}
                      name={"calamity"}
                      label={"Calamity"}
                      component={FormInput}

                    />
                    <Field
                      id={"compTime"}
                      name={"compTime"}
                      label={"CompTime"}
                      component={FormInput}

                    />
                    <Field
                      id={"vacaAdjust"}
                      name={"vacaAdjust"}
                      label={"VACA Adjust"}
                      component={FormInput}

                    />
                    <Field
                      id={"sickAdjust"}
                      name={"sickAdjust"}
                      label={"Sick Adjust"}
                      component={FormInput}

                    />{" "}
                    <Field
                      id={"vacaUsed"}
                      name={"vacaUsed"}
                      label={"Vaca Used"}
                      component={FormInput}

                    />
                    <Field
                      id={"sickUsed"}
                      name={"sickUsed"}
                      label={"Sick Used"}
                      component={FormInput}

                    />
                  </div>
                </fieldset>
                <div className="k-form-buttons">
                  <Button
                    themeColor={"primary"}
                    className={"col-2"}
                    onClick={drawerhandleSelect}
                  >
                    Close
                  </Button>
                </div>
              </FormElement>
            )}
          />{" "}
        </div>
      </DrawerItem>
    );
  };
  return (
    <div>
      <div
        className="d-flex  k-flex-row k-w-full gap-3 pt-3 pb-3 align-items-end"
        style={{ width: "125%" }}
      ></div>
      <Grid data={payrollData}>
        <GridColumn field="job" title="Job" />
        <GridColumn field="jobDescription" title="Distribution" />
      </Grid>
      <div
        className="offcanvas offcanvas-end"
        index="-1"
        id="offcanvass"
        aria-labelledby="offcanvass"
        style={{ width: "800px" }}
      >
        <div className="offcanvas-body"></div>
      </div>
      {deleteVisible && (
        <Dialog
          title={<span>Please confirm</span>}
          onClose={toggleDeleteDialog}
        >
          <p
            style={{
              margin: "25px",
              textAlign: "center",
            }}
          >
            Are you sure you want to Delete?
          </p>
          <DialogActionsBar>
            <Button
              themeColor={"secondary"}
              className={"col-12"}
              onClick={toggleDeleteDialog}
            >
              No
            </Button>
            <Button
              themeColor={"primary"}
              className={"col-12"}
              onClick={DeleteOnClick}
            >
              Yes
            </Button>
          </DialogActionsBar>
        </Dialog>
      )}
      {deleteVisiblePackage && (
        <Dialog
          title={<span>Please confirm</span>}
          onClose={toggleDeleteDialogPackage}
        >
          <p
            style={{
              margin: "25px",
              textAlign: "center",
            }}
          >
            Are you sure you want to Delete?
          </p>
          <DialogActionsBar>
            <Button
              themeColor={"secondary"}
              className={"col-12"}
              onClick={toggleDeleteDialogPackage}
            >
              No
            </Button>
            <Button
              themeColor={"primary"}
              className={"col-12"}
              onClick={DeleteOnClickPackage}
            >
              Yes
            </Button>
          </DialogActionsBar>
        </Dialog>
      )}
      <Drawer
        expanded={drawerexpanded}
        position={"end"}
        mode={"overlay"}
        width={1200}
        items={itemss.map((item) => ({
          ...item,
          selected: item.text == selectedId,
        }))}
        item={CustomItem}
      >
        <DrawerContent></DrawerContent>
      </Drawer>
    </div>
  );
}
