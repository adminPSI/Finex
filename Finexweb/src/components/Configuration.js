import { Button } from "@progress/kendo-react-buttons";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import React, { useState } from "react";
import axiosInstance from "../core/HttpInterceptor";
import { ConfigurationEndPoints } from "../EndPoints";
import usePrivilege from "../helper/usePrivilege";
import { FormCheckbox, FormInput } from "./form-components";
import { showSuccessNotification } from "./NotificationHandler/NotificationHandler";
const Title = (props) => {
  return (
    <>
      <div className="text-success">
        <i className={props.tab.icon}></i> &nbsp;&nbsp;
        <span>{props.tab.name}</span>
      </div>
    </>
  );
};
export default function Configuration() {
  React.useEffect(() => {
    GetConfigurationMasterData();
  }, []);

  const [selected, setSelected] = React.useState(0);
  const [CategoryList, setCategoryList] = React.useState([]);

  const handleSelect = (e) => {
    setSelected(e.selected);
    let FormObject = {};
    if (CategoryList[e.selected].settingsObj.length) {
      CategoryList[e.selected].settingsObj.map((obj) => {
        let convertedObject = convertArrayToObject(obj.keyData);
        FormObject = { ...FormObject, ...convertedObject };
      });
    }
    setFormInit(FormObject);
    setFormKey(formKey + 1);
  };

  const [formInit, setFormInit] = useState([]);
  const [formKey, setFormKey] = React.useState(1);

  const GetConfigurationMasterData = () => {
    axiosInstance({
      method: "GET",
      url: ConfigurationEndPoints.GetConfigurationData,
      withCredentials: false,
    })
      .then((response) => {
        setCategoryList(response.data.result);
        let FormObject = {};
        if (response.data.result[selected].settingsObj.length) {
          response.data.result[selected].settingsObj.map((obj) => {
            let convertedObject = convertArrayToObject(obj.keyData);
            FormObject = { ...FormObject, ...convertedObject };
          });
        }
        setFormInit(FormObject);
        setFormKey(formKey + 1);
      })
      .catch(() => { });
  };

  const convertArrayToObject = (array) => {
    const result = {};
    array.forEach((obj) => {
      result["chk_" + obj.settingKey] =
        obj.settingsValue == "1"
          ? true
          : obj.settingsValue == "0" ||
            (obj.settingsValue == null && obj.type == "Checkbox")
            ? false
            : obj.settingsValue;
    });
    return result;
  };

  const handleSubmit = (dataItem, e) => {
    const submitButton = e.target.querySelector("button[type='submit']");
    if (submitButton) {
      submitButton.disabled = true;
    }

    var apirequest = [];
    for (let [key, value] of Object.entries(dataItem)) {
      var sval;
      if (typeof value == "boolean") {
        sval = value ? "1" : "0";
      } else {
        sval = value;
      }
      apirequest.push({
        id: 0,
        settingsId: key.split("_")[1],
        settingValue: sval,
      });
    }
    axiosInstance({
      method: "POST",
      url: ConfigurationEndPoints.SaveConfiguration,
      data: apirequest,
    })
      .then((response) => {
        GetConfigurationMasterData();
        showSuccessNotification("Data saved successfully");
      })
      .catch(() => { })
      .finally(() => {
        if (submitButton) {
          submitButton.disabled = false;
        }
      });
  };
  const { checkPrivialgeGroup, loading, error } = usePrivilege('Configuration')
  if (loading) return <div>Loading privileges...</div>
  if (error) return <div>Error: {error}</div>
  return (
    <>
      {checkPrivialgeGroup("ConfigurationM", 1) && (
        <>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <a href="/">
                  <i className="fa fa-home"></i>
                </a>
              </li>
              <li className="breadcrumb-item">
                <a href="#">Account</a>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Configuration
              </li>
            </ol>
          </nav>
          <br></br>
          <div>
            {checkPrivialgeGroup("ConfigurationTab", 1) && (
              <>
                <TabStrip
                  selected={selected}
                  onSelect={handleSelect}
                  tabPosition={"left"}
                >
                  {CategoryList.map((cat) => (
                    <TabStripTab title={<Title tab={cat} />} key={cat.id}>
                      {!!cat.settingsObj && cat.settingsObj.length > 0 ? (
                        <Form
                          onSubmit={handleSubmit}
                          key={formKey}
                          initialValues={formInit}
                          render={(ConfigformRender) => (
                            <FormElement>
                              {cat.settingsObj.map((setObj) =>
                                !!setObj.keyId ? (
                                  <>
                                    <fieldset className={"border p-2"}>
                                      <legend
                                        className={"float-none w-auto p-2"}
                                      >
                                        {setObj.keyId}
                                      </legend>
                                      {setObj.keyData.map((set) => (
                                        <Field
                                          id={"chk_" + set.settingKey}
                                          name={"chk_" + set.settingKey}
                                          label={set.displayName}
                                          component={
                                            set.type == "Checkbox"
                                              ? FormCheckbox
                                              : FormInput
                                          }
                                        />
                                      ))}
                                    </fieldset>
                                    <br></br>
                                  </>
                                ) : (
                                  setObj.keyData.map((set) => (
                                    <Field
                                      id={"chk_" + set.settingKey}
                                      name={"chk_" + set.settingKey}
                                      label={set.displayName}
                                      component={
                                        set.type == "Checkbox"
                                          ? FormCheckbox
                                          : FormInput
                                      }
                                    />
                                  ))
                                )
                              )}
                              <div>
                                <br></br>
                                <p
                                  style={{ textAlign: "center", margin: "3px" }}
                                >
                                  {checkPrivialgeGroup("ConfigSaveB", 3) && (
                                    <Button
                                      type={"submit"}
                                      themeColor={"primary"}
                                      disabled={!ConfigformRender.allowSubmit}
                                    >
                                      Save
                                    </Button>
                                  )}
                                  &nbsp;&nbsp;&nbsp;
                                </p>
                              </div>
                            </FormElement>
                          )}
                        />
                      ) : null}
                    </TabStripTab>
                  ))}
                </TabStrip>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}
