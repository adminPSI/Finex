import { Button } from "@progress/kendo-react-buttons";
import React, { useState } from "react";
import { CreateRole } from "./createRole";
import { RemoveRole } from "./removeRole";

export default function Privilege() {
  const [removeRolePopupVisible, setRemoveRolePopupVisible] = useState(false);
  const [rolePopupVisible, setRolePopupVisible] = useState(false);
  return (
    <>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item active" aria-current="page">
            Privilege
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Privilege
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Privilege
          </li>
        </ol>
      </nav>
      <div className="row">
        <div className="col-sm-6 d-flex align-items-center">
          <h3>Privilege</h3>
        </div>
        <div className="col-sm-6 text-end">
          <Button
            style={{
              margin: "5px",
            }}
            themeColor={"primary"}
            onClick={() => setRolePopupVisible(true)}
          >
            <i className="fa-solid fa-plus"></i> &nbsp; Add Role
          </Button>
          <Button
            style={{
              margin: "5px",
            }}
            themeColor={"primary"}
            onClick={() => setRemoveRolePopupVisible(true)}
          >
            <i className="fa-solid "></i> &nbsp; Remove Role
          </Button>
        </div>
      </div>
      <br />
      {rolePopupVisible && (
        <CreateRole setRolePopupVisible={setRolePopupVisible} />
      )}
      {removeRolePopupVisible && (
        <RemoveRole setRemoveRolePopupVisible={setRemoveRolePopupVisible} />
      )}
    </>
  );
}
