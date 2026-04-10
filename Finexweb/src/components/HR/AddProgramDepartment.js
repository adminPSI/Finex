import { Button } from "@progress/kendo-react-buttons";
import { Dialog } from "@progress/kendo-react-dialogs";
import { ListBox } from "@progress/kendo-react-listbox";
import { useEffect, useState } from "react";
import axiosInstance from "../../core/HttpInterceptor";
import {
  IHACExpenseCodeEndPoints
} from "../../EndPoints";
import {
  showErrorNotification
} from "../NotificationHandler/NotificationHandler";
export const AddProgramDepartment = ({
  setAddProgramDepartmentPopupVisible,
  selectedRowId,
  employeeData,
}) => {
  const [programList, setProgramList] = useState([]);
  const [selectedPrograms, setSelectedPrograms] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedBox, setSelectedBox] = useState(0);
  const SELECTED_FIELD = "selected";
  const closeMenuHandler = () => {
    setAddProgramDepartmentPopupVisible(false);
  };
  useEffect(() => {
    getProgramsListData();
    getDepartmentsListData();
  }, []);
  const getDepartmentsListData = () => {
    axiosInstance({
      method: "Get",
      url: IHACExpenseCodeEndPoints.GetIHCDepartmentList + "?forIhpo=false",
      withCredentials: false,
    })
      .then((response) => {
        getDepartments(response.data);
      })
      .catch(() => {});
  };
  const getProgramsListData = () => {
    axiosInstance({
      method: "Get",
      url: IHACExpenseCodeEndPoints.GetIHCProgramList + "?forIhpo=false",
      withCredentials: false,
    })
      .then((response) => {
        getPrograms(response.data);
      })
      .catch(() => {});
  };
  const getDepartments = (data) => {
    axiosInstance({
      method: "Get",
      url:
        IHACExpenseCodeEndPoints.GetProgDeptForEmployee +
        "?type=Department" +
        "&&empId=" +
        selectedRowId,
      withCredentials: false,
    })
      .then((response) => {
        let selectedDepartmentsList = response.data;
        var selectedDList = [];
        var availableDList = [];
        data = data.map((e, index) => {
          if (selectedDepartmentsList.find((s) => s.id == e.id)) {
            selectedDList.push({
              name: e.description,
              id: e.id,
              selected: false,
            });
          } else {
            availableDList.push({
              name: e.description,
              id: e.id,
              selected: false,
            });
          }
          return { name: e.description, id: e.id, selected: false };
        });

        setDepartmentList(availableDList);
        setSelectedDepartments(selectedDList);
      })
      .catch((err) => {});
  };
  const getPrograms = (data) => {
    axiosInstance({
      method: "Get",
      url:
        IHACExpenseCodeEndPoints.GetProgDeptForEmployee +
        "?type=Program" +
        "&&empId=" +
        selectedRowId,
      withCredentials: false,
    })
      .then((response) => {
        let selectedProgramsList = response.data;
        var selectedList = [];
        var availableList = [];
        data = data.map((e, index) => {
          if (selectedProgramsList.find((s) => s.id == e.id)) {
            selectedList.push({
              name: e.description,
              id: e.id,
              selected: false,
            });
          } else {
            availableList.push({
              name: e.description,
              id: e.id,
              selected: false,
            });
          }
          return { name: e.description, id: e.id, selected: false };
        });

        setProgramList(availableList);
        setSelectedPrograms(selectedList);
      })
      .catch((err) => {});
  };

  const handleItemClickOne = (event, data) => {
    var newData = programList;
    newData.map((e) => {
      if (e.id == event.dataItem.id) {
        if (e.id == event.dataItem.id && e.selected) {
          e.selected = false;
        } else {
          e.selected = true;
        }
        setSelectedBox(1);
      }

      return e;
    });
    var selectedData = selectedPrograms;
    selectedData.map((e) => {
      e.selected = false;
      return e;
    });
    setProgramList((previo) => [...newData]);
    setSelectedPrograms((previo) => [...selectedData]);
  };
  const handleItemClickTwo = (event, data) => {
    var selectedData = selectedPrograms;

    selectedData.map((e) => {
      if (e.id == event.dataItem.id) {
        if (e.id == event.dataItem.id && e.selected) {
          e.selected = false;
        } else {
          e.selected = true;
        }
        e.selected = true;
        setSelectedBox(2);
      } 
      return e;
    });
    var newData = programList;
    newData.map((e) => {
      e.selected = false;
      return e;
    });
    setProgramList((previo) => [...newData]);
    setSelectedPrograms((previo) => [...selectedData]);
  };
  const handleAdd = () => {
    if (selectedBox == 1) {
      var formateArray = [];
      programList.map((e, index) => {
        if (e.selected) {
          formateArray.push(e.id);
        }
        return e;
      });
      selectedPrograms.map((e, index) => {
        formateArray.push(e.id);
        return e;
      });
      axiosInstance({
        method: "POST",
        data: formateArray,
        url:
          IHACExpenseCodeEndPoints.AddProgDeptForEmployee +
          "?type=Program" +
          "&&empId=" +
          selectedRowId,
        withCredentials: false,
      })
        .then((response) => {
          getProgramsListData();
          //}
        })
        .catch(() => {});
    } else {
      showErrorNotification("Please select atleast one program");
    }
  };
  const handleAddAll = () => {
    var formateArray = [];
    programList.map((e, index) => {
      formateArray.push(e.id);
      return e;
    });
    selectedPrograms.map((e, index) => {
      formateArray.push(e.id);
      return e;
    });
    axiosInstance({
      method: "POST",
      data: formateArray,
      url:
        IHACExpenseCodeEndPoints.AddProgDeptForEmployee +
        "?type=Program" +
        "&&empId=" +
        selectedRowId,
      withCredentials: false,
    })
      .then((response) => {
        getProgramsListData();
      })
      .catch(() => {});
  };
  const handleRemove = () => {
    if (selectedBox == 2) {
      var formateArray = [];

      selectedPrograms.map((e, index) => {
        if (!e.selected) {
          formateArray.push(e.id);
        }
        return e;
      });
      axiosInstance({
        method: "POST",
        data: formateArray,
        url:
          IHACExpenseCodeEndPoints.AddProgDeptForEmployee +
          "?type=Program" +
          "&&empId=" +
          selectedRowId,
        withCredentials: false,
      })
        .then((response) => {
          getProgramsListData();
          //}
        })
        .catch(() => {});
    }
  };
  const handleRemoveAll = () => {
    var formateArray = [];

    axiosInstance({
      method: "POST",
      data: formateArray,
      url:
        IHACExpenseCodeEndPoints.AddProgDeptForEmployee +
        "?type=Program" +
        "&&empId=" +
        selectedRowId,
      withCredentials: false,
    })
      .then((response) => {
        getProgramsListData();
      })
      .catch(() => {});
  };

  const handleItemClickOneD = (event, data) => {
    var newData = departmentList;
    newData.map((e) => {
      if (e.id == event.dataItem.id) {
        if (e.id == event.dataItem.id && e.selected) {
          e.selected = false;
        } else {
          e.selected = true;
        }
        setSelectedBox(3);
      }
      return e;
    });
    let selectedData = selectedDepartments;
    selectedData.map((e) => {
      e.selected = false;
      return e;
    });
    setDepartmentList((previo) => [...newData]);
    setSelectedDepartments((previo) => [...selectedData]);
  };
  const handleItemClickTwoD = (event, data) => {
    let selectedData = selectedDepartments;

    selectedData.map((e) => {
      if (e.id == event.dataItem.id) {
        if (e.id == event.dataItem.id && e.selected) {
          e.selected = false;
        } else {
          e.selected = true;
        }
        e.selected = true;
        setSelectedBox(4);
      }
      return e;
    });
    var newData = departmentList;
    newData.map((e) => {
      e.selected = false;
      return e;
    });
    setDepartmentList((previo) => [...newData]);
    setSelectedDepartments((previo) => [...selectedData]);
  };
  const handleAddD = () => {
    if (selectedBox == 3) {
      var formateArray = [];
      departmentList.map((e, index) => {
        if (e.selected) {
          formateArray.push(e.id);
        }
        return e;
      });
      selectedDepartments.map((e, index) => {
        formateArray.push(e.id);
        return e;
      });
      axiosInstance({
        method: "POST",
        data: formateArray,
        url:
          IHACExpenseCodeEndPoints.AddProgDeptForEmployee +
          "?type=Department" +
          "&&empId=" +
          selectedRowId,
        withCredentials: false,
      })
        .then((response) => {
          getDepartmentsListData();
        })
        .catch(() => {});
    }
  };
  const handleAddAllD = () => {
    var formateArray = [];
    departmentList.map((e, index) => {
      formateArray.push(e.id);
      return e;
    });
    selectedDepartments.map((e, index) => {
      formateArray.push(e.id);
      return e;
    });
    axiosInstance({
      method: "POST",
      data: formateArray,
      url:
        IHACExpenseCodeEndPoints.AddProgDeptForEmployee +
        "?type=Department" +
        "&&empId=" +
        selectedRowId,
      withCredentials: false,
    })
      .then((response) => {
        getDepartmentsListData();
      })
      .catch((err) => {
        console.log(err, "errr");
      });
  };
  const handleRemoveD = () => {
    if (selectedBox == 4) {
      var formateArray = [];

      selectedDepartments.map((e, index) => {
        if (!e.selected) {
          formateArray.push(e.id);
        }
        return e;
      });
      axiosInstance({
        method: "POST",
        data: formateArray,
        url:
          IHACExpenseCodeEndPoints.AddProgDeptForEmployee +
          "?type=Department" +
          "&&empId=" +
          selectedRowId,
        withCredentials: false,
      })
        .then((response) => {
          getDepartmentsListData();
        })
        .catch(() => {});
    }
  };
  const handleRemoveAllD = () => {
    var formateArray = [];

    axiosInstance({
      method: "POST",
      data: formateArray,
      url:
        IHACExpenseCodeEndPoints.AddProgDeptForEmployee +
        "?type=Department" +
        "&&empId=" +
        selectedRowId,
      withCredentials: false,
    })
      .then((response) => {
        getDepartmentsListData();
      })
      .catch(() => {});
  };

  return (
    <Dialog
      width={800}
      height={600}
      title={
        <div className="d-flex align-items-center justify-content-center">
          <i className="fa-solid fa-right-left "></i>{" "}
          <span className="ms-2">Manage Program/Department</span>
        </div>
      }
      onClose={closeMenuHandler}
    >
      <div className="container">
        <h4 className="mt-2">Programs</h4>
        <div className="row justify-content-center">
          <div className="col">
            <h6>Available Programs</h6>
            <ListBox
              style={{
                height: 400,
                width: "100%",
              }}
              data={programList}
              textField="name"
              selectedField={SELECTED_FIELD}
              onItemClick={(e) => handleItemClickOne(e, "availableRoles")}
            />
          </div>
          <div className="col">
            <div className="d-flex flex-column item-align-center mt-5">
              <Button
                themeColor={"primary"}
                className="k-button k-button-lg k-rounded-lg"
                onClick={handleAdd}
              >
                Add
              </Button>
              <br />
              <Button
                themeColor={"primary"}
                className="k-button k-button-lg k-rounded-lg"
                onClick={handleAddAll}
              >
                Add All
              </Button>
              <br />
              <Button
                themeColor={"primary"}
                className="k-button k-button-lg k-rounded-lg"
                onClick={handleRemove}
              >
                Remove
              </Button>
              <br />
              <Button
                themeColor={"primary"}
                className="k-button k-button-lg k-rounded-lg"
                onClick={handleRemoveAll}
              >
                Remove All
              </Button>
              <br />
            </div>
          </div>
          <div className="col">
            <h6>Current Programs</h6>
            <ListBox
              style={{
                height: 400,
                width: "100%",
              }}
              data={selectedPrograms}
              textField="name"
              selectedField={SELECTED_FIELD}
              onItemClick={(e) => handleItemClickTwo(e, "currentRoles")}
            />
          </div>
        </div>
        <h4 className="mt-2">Department</h4>
        <div className="row justify-content-center">
          <div className="col">
            <h6>Available Department</h6>
            <ListBox
              style={{
                height: 400,
                width: "100%",
              }}
              data={departmentList}
              textField="name"
              selectedField={SELECTED_FIELD}
              onItemClick={(e) => handleItemClickOneD(e, "availableRoles")}
            />
          </div>
          <div className="col">
            <div className="d-flex flex-column item-align-center mt-5">
              <Button
                themeColor={"primary"}
                className="k-button k-button-lg k-rounded-lg"
                onClick={handleAddD}
              >
                Add
              </Button>
              <br />
              <Button
                themeColor={"primary"}
                className="k-button k-button-lg k-rounded-lg"
                onClick={handleAddAllD}
              >
                Add All
              </Button>
              <br />
              <Button
                themeColor={"primary"}
                className="k-button k-button-lg k-rounded-lg"
                onClick={handleRemoveD}
              >
                Remove
              </Button>
              <br />
              <Button
                themeColor={"primary"}
                className="k-button k-button-lg k-rounded-lg"
                onClick={handleRemoveAllD}
              >
                Remove All
              </Button>
              <br />
            </div>
          </div>
          <div className="col">
            <h6>Current Department</h6>
            <ListBox
              style={{
                height: 400,
                width: "100%",
              }}
              data={selectedDepartments}
              textField="name"
              selectedField={SELECTED_FIELD}
              onItemClick={(e) => handleItemClickTwoD(e, "currentRoles")}
            />
          </div>
        </div>
      </div>
    </Dialog>
  );
};
