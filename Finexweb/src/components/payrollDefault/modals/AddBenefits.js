import { Button } from "@progress/kendo-react-buttons";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import {
  DropDownList,
  MultiColumnComboBox,
} from "@progress/kendo-react-dropdowns";
import { Grid, GridColumn } from "@progress/kendo-react-grid";
import React, { useEffect, useState } from "react";
import axiosInstance from "../../../core/HttpInterceptor";
import { ExpenseEndPoints, PayrollEndPoints } from "../../../EndPoints";
import { MyCommandCell } from "../../Projects/myCommandCell";

export const AddBenefits = ({
  setBenefitsPopupVisible,
  setPackageData,
  selectedPackageRowId,
  selectedBenefitRowId,
  cacId,
  benefitPackageLinkID
}) => {
  const [benefitsData, setBenefitsData] = useState([
    {
      benefits: "",
      cac: "",
      inEdit: true,
      Discontinued: false,
      id: 0,
    },
  ]);
  const [benefitsList, setbenefitsList] = React.useState([]);
  const [CACDDList, setCACDDList] = React.useState([]);
  const [, setCacList] = React.useState([]);
  const [formKey, setformKey] = React.useState(0);
  const closeMenuHandler = () => {
    setBenefitsPopupVisible(false);
  };
  useEffect(() => {
    (async () => {
      axiosInstance({
        method: "GET",
        url: ExpenseEndPoints.GetExpenseCodeList,
        withCredentials: false,
      }).then((response) => {
        let data = response.data;

        let itemsData = [];
        data.forEach((data) => {
          let items = {
            desc: data.countyExpenseDescription,
            text: data.countyExpenseCode,
            id: data.id,
          };
          itemsData.push(items);
        });
        setCACDDList(itemsData);
      });

      const result = await axiosInstance({
        method: "GET",
        url: PayrollEndPoints.Benefits + `?take=0&skip=0`,
        withCredentials: false,
      });
      let benefitsListArr = [];
      result?.data?.data.map((e) => {
        benefitsListArr.push({ id: e.id, type: e.benefitsName });
      });
      setbenefitsList(benefitsListArr);
      const result1 = await axiosInstance({
        method: "GET",
        url: PayrollEndPoints.Benefits,
        withCredentials: false,
      });

      setCacList(result1);
    })();
  }, []);

  const DropDownCell = (props) => {
    const handleChange = (e) => {
      if (props.onChange) {
        props.onChange({
          dataIndex: 0,
          dataItem: props.dataItem,
          field: props.field,
          syntheticEvent: e.syntheticEvent,
          value: e.target.value.id,
        });
      }
    };
    const { dataItem } = props;
    const field = props.field || "";
    let dataValue = dataItem[field] == null ? "" : dataItem[field];
    return (
      <td>
        {dataItem.inEdit ? (
          <DropDownList
            data={benefitsList}
            onChange={handleChange}
            dataItemKey="id"
            textField="type"
            value={benefitsList.find((c) => c.id == dataValue)}
          />
        ) : (
          benefitsList.find((c) => c.id == dataValue)?.type
        )}{" "}
      </td>
    );
  };
  const MultiColumnDropDownCell = (props) => {
    const columns = [
      {
        field: "id",
        header: "ID",
        width: "100px",
      },
      {
        field: "text",
        header: "Name",
        width: "100px",
      },
      {
        field: "desc",
        header: "Description",
        width: "200px",
      },
    ];

    const handleChange = (e) => {
      if (props.onChange) {
        props.onChange({
          dataIndex: 0,
          dataItem: props.dataItem,
          field: props.field,
          syntheticEvent: e.syntheticEvent,
          value: e.target.value.id,
        });
      }
    };
    const { dataItem } = props;
    const field = props.field || "";
    let dataValue = dataItem[field] == null ? "" : dataItem[field];
    return (
      <td>
        {dataItem.inEdit ? (
          <MultiColumnComboBox
            data={CACDDList}
            onChange={handleChange}
            dataItemKey="id"
            columns={columns}
            textField={"text"}
            value={CACDDList.find((c) => c.id == dataValue)}
          />
        ) : (
          CACDDList.find((c) => c.id == dataValue)?.text
        )}
      </td>
    );
  };
  const editField = "inEdit";

  const CommandCell = (props) => (
    <MyCommandCell
      {...props}
      edit={enterEdit}
      remove={remove}
      discard={discard}
      update={update}
      cancel={cancel}
      editField={editField}
    />
  );

  const discard = (dataItem) => { };
  let count = 0;
  const update = (dataItem) => {
    if (dataItem.benefits && dataItem.cac && dataItem.id == 0) {
      let finalData = benefitsData.map((item, index) => {
        item.id = item.id == 0 ? count + 1 : item.id;
        count++;
        item.inEdit = false;
        return item;
      });

      const newData = [...finalData];

      newData.push({
        benefits: "",
        cac: "",
        inEdit: true,
        Discontinued: false,
        id: 0,
      });

      setBenefitsData(newData);
    } else if (dataItem.benefits && dataItem.cac && dataItem.id != 0) {
      let finalData = benefitsData.map((item, index) => {
        item.inEdit = dataItem.id == item.id ? false : item.inEdit;
        return item;
      });

      const newData = [...finalData];

      setBenefitsData(newData);
    }
  };

  const remove = (dataItem) => {
    const newData = benefitsData.filter((obj) => obj.id !== dataItem.id);
    setBenefitsData(newData);
  };
  const cancel = (dataItem) => {
    let newData = benefitsData.map((item) =>
      item.id == dataItem.id
        ? {
          ...item,
          inEdit: false,
        }
        : item
    );
    setBenefitsData(newData);
  };
  const enterEdit = (dataItem) => {
    let newData = benefitsData.map((item) =>
      item.id == dataItem.id
        ? {
          ...item,
          inEdit: true,
        }
        : item
    );
    setBenefitsData(newData);
  };
  const itemChange = (event) => {
    const field = event.field || "";
    const newData = benefitsData.map((item) =>
      item.id == event.dataItem.id
        ? {
          ...item,
          [field]: event.value,
        }
        : item
    );
    setBenefitsData(newData);
  };
  const handleSubmit = (dataItem) => {
    var benefitsFinalArray = [];
    benefitsData.map((item, index) => {
      let data = {
        id: 0, 
        orgAccountId: 7,
        cacId: item.cac,
        bennyId: item.benefits,
        macroNameId: selectedPackageRowId,
      };
      if (item.benefits && item.cac) {
        benefitsFinalArray.push(data);
      }
      return item;
    });

    if (benefitsFinalArray.length > 0) {
      axiosInstance({
        method: "POST",
        url: PayrollEndPoints.AddBenefitToPackage,
        data: benefitsFinalArray,
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

  const handleUpdateSubmit = (dataItem) => {

    var benefitsFinalArray = [];
    benefitsData.map((item, index) => {
      let data = {
        id: benefitPackageLinkID,
        orgAccountId: 7,
        cacId: item.cac,
        bennyId: item.benefits,
        macroNameId: selectedPackageRowId,
      };
      if (item.benefits && item.cac) {
        benefitsFinalArray.push(data);
      }
      return item;
    });

    axiosInstance({
      method: "PUT",
      url: PayrollEndPoints.UpdateBenefitToPackage,
      data: benefitsFinalArray[0],
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
  };

  useEffect(() => {
    (async () => {
      try {
        if (selectedBenefitRowId) {
          const result = await axiosInstance({
            method: "GET",
            url: PayrollEndPoints.BenefitsById.replace(
              "#ID#",
              selectedBenefitRowId
            ),
            withCredentials: false,
          });

          const benefitByFindId = benefitsList.find(
            (el) => el?.type == result?.data?.benefitsName
          );

          const cacFindId = CACDDList.find((el) => el?.text == cacId);

          setBenefitsData([
            {
              benefits: benefitByFindId?.id,
              cac: cacFindId?.id,
              inEdit: true,
              Discontinued: false,
              id: 0,
            },
          ]);
          setformKey(formKey + 1);
        }
      } catch (e) {
        console.log(e, "error");
      }
    })();
  }, [selectedBenefitRowId, benefitsList, CACDDList]);

  return (
    <Dialog
      width={900}
      title={
        <div className="d-flex align-items-center justify-content-center">
          <i className="fa-solid fa-plus"></i>
          <span className="ms-2">
            {!selectedBenefitRowId ? "Add Benefits" : "Edit Benefits"}
          </span>
        </div>
      }
      onClose={closeMenuHandler}
    >
      <Grid
        data={benefitsData}
        editField={editField}
        dataItemKey={"id"}
        onItemChange={itemChange}
      >
        <GridColumn field="benefits" title="Benefits" cell={DropDownCell} />
        <GridColumn field="cac" title="CAC" cell={MultiColumnDropDownCell} />
        {!selectedBenefitRowId && (
          <GridColumn cell={CommandCell} width="240px" filterable={false} />
        )}
      </Grid>

      <DialogActionsBar>
        <Button
          themeColor={"secondary"}
          className={"col-12"}
          onClick={closeMenuHandler}
        >
          Cancel
        </Button>
        {!selectedBenefitRowId ? (
          <Button
            themeColor={"primary"}
            className={"col-12"}
            onClick={handleSubmit}
          >
            Save
          </Button>
        ) : (
          <Button
            themeColor={"primary"}
            className={"col-12"}
            onClick={handleUpdateSubmit}
          >
            Update Benefit
          </Button>
        )}
      </DialogActionsBar>
    </Dialog>
  );
};
