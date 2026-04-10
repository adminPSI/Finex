import { Button } from "@progress/kendo-react-buttons";
import {
  Grid,
  GridColumn,
  GridToolbar
} from "@progress/kendo-react-grid";
import { Checkbox, Input } from "@progress/kendo-react-inputs";
import { ContextMenu, MenuItem } from "@progress/kendo-react-layout";
import React, { useState } from "react";
import { ColumnFormCurrencyTextBox } from "../form-components";
export default function BenefitPackage() {
  const [BenefitPackageShowFilter, setBenefitPackageShowFilter] =
    React.useState(false);
  const [BenefitPackageShow, setBenefitPackageShow] = React.useState(false);
  const [columnShow, setColumnShow] = useState(false);
  const BenefitPackageOffset = React.useRef({
    left: 0,
    top: 0,
  });
  const onCheckBox = (event) => {
    setColumnShow(!columnShow);
  };

  const { checkPrivialgeGroup, loading, error } = usePrivilege('Fund')
  if (loading) return <div>Loading privileges...</div>
  if (error) return <div>Error: {error}</div>
  return (
    <div>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item active" aria-current="page">
            Payroll
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Payroll Details
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Benefit Setup
          </li>
        </ol>
      </nav>

      <div className="row">
        <div className="col-sm-8 d-flex align-items-center">
          <h3>Benefit Setup</h3>
        </div>
        <div className="col-sm-4 text-end">
        </div>

        <Grid
          data={[]}
          filterable={BenefitPackageShowFilter}
          filter={BenefitPackageShow}
          pageable={{
            buttonCount: 4,
            pageSizes: [10, 15, "All"],
            pageSizeValue: 10,
          }}
        >
          <GridToolbar>
            <div className="row col-sm-12">
              <div className="col-sm-6 d-grid gap-3 d-md-block">
                <Button
                  className="buttons-container-button"
                  fillMode="outline"
                  themeColor={"primary"}
                >
                  <i className="fa-solid fa-arrow-down-wide-short"></i> &nbsp;
                  More Filter
                </Button>
              </div>
              <div className="col-sm-6 d-flex align-items-center justify-content-center">
                <div className="col-3">
                  {checkPrivialgeGroup("Modify Info Checkbox", 1) && (
                    <Checkbox
                      type="checkbox"
                      id="modifiedBy"
                      name="modifiedBy"
                      defaultChecked={columnShow}
                      onChange={onCheckBox}
                      label={"Modified Info"}
                    />
                  )}
                </div>
                <div className="input-group">
                  <Input className="form-control border-end-0 border" />
                  <span className="input-group-append">
                    <button
                      className="btn btn-outline-secondary bg-white rounded-0 border-start-0 rounded-end-2 border ms-n5"
                      type="button"
                    >
                      <i className="fa fa-search"></i>
                    </button>
                  </span>
                </div>
              </div>
            </div>
          </GridToolbar>
          <GridColumn field="benefitName" title="Benefit" />
          <GridColumn field="cac" title="Percent" format="{0:p}" />
          <GridColumn
            field="benefitPackage"
            title="Amount"
            format="{0:c2}"
            cell={ColumnFormCurrencyTextBox}
          />
          <GridColumn field="benefitPackage" title="Description" />
          <GridColumn field="benefitPackage" title="Benefit Type" />
          {columnShow && (
            <GridColumn
              field="createdDate"
              title="Created Date"
              cell={(props) => {
                const [year, month, day] = props.dataItem?.createdDate
                  ? props.dataItem?.createdDate.split("T")[0].split("-")
                  : [null, null, null];
                return (
                  <td>
                    {props.dataItem?.createdDate
                      ? `${month}/${day}/${year}`
                      : null}
                  </td>
                );
              }}
            />
          )}
          {columnShow && <GridColumn field="createdBy" title="Created By" />}
          {columnShow && (
            <GridColumn
              field="modifiedDate"
              title="Modified Date"
              cell={(props) => {
                const [year, month, day] = props.dataItem?.modifiedDate
                  ? props.dataItem?.modifiedDate.split("T")[0].split("-")
                  : [null, null, null];
                return (
                  <td>
                    {props.dataItem?.modifiedDate
                      ? `${month}/${day}/${year}`
                      : null}
                  </td>
                );
              }}
            />
          )}
          {columnShow && <GridColumn field="modifiedBy" title="Modified By" />}
        </Grid>
        <ContextMenu
          show={BenefitPackageShow}
          offset={BenefitPackageOffset.current}
        >
          {checkPrivialgeGroup("Fund Grid", 3) && (
            <MenuItem
              text="Edit Voucher"
              data={{
                action: "edit",
              }}
              icon="edit"
            />
          )}
          {checkPrivialgeGroup("Fund Grid", 3) && (
            <MenuItem
              text="Delete Voucher"
              data={{
                action: "delete",
              }}
              icon="delete"
            />
          )}
        </ContextMenu>
        <br></br>

        <div className="pt-4"></div>
        <fieldset>
          <div className="row">
            <div className="col-sm-8">
              <figure>
                <h4>Benefit Packages</h4>
              </figure>
            </div>
            <div className="col-sm-4 text-end">
            </div>
          </div>
          <br></br>

          <Grid
            data={[]}
            filterable={BenefitPackageShowFilter}
            filter={BenefitPackageShow}
            pageable={{
              buttonCount: 4,
              pageSizes: [10, 15, "All"],
              pageSizeValue: 10,
            }}
          >
            <GridToolbar>
              <div className="row col-sm-12">
                <div className="col-sm-9 d-grid gap-3 d-md-block">
                  <Button
                    className="buttons-container-button"
                    fillMode="outline"
                    themeColor={"primary"}
                  >
                    <i className="fa-solid fa-arrow-down-wide-short"></i> &nbsp;
                    More Filter
                  </Button>
                </div>
                <div className="col-sm-3">
                  <div className="input-group">
                    <Input className="form-control border-end-0 border" />
                    <span className="input-group-append">
                      <button
                        className="btn btn-outline-secondary bg-white rounded-0 border-start-0 rounded-end-2 border ms-n5"
                        type="button"
                      >
                        <i className="fa fa-search"></i>
                      </button>
                    </span>
                  </div>
                </div>
              </div>
            </GridToolbar>
            <GridColumn field="benefitName" title="Benefit Name" />
            <GridColumn field="cac" title="CAC" />
            <GridColumn field="benefitPackage" title="Benefit Package" />
          </Grid>
          <ContextMenu
            show={BenefitPackageShow}
            offset={BenefitPackageOffset.current}
          >
            {checkPrivialgeGroup("Fund Grid", 3) && (
              <MenuItem
                text="Edit Voucher"
                data={{
                  action: "edit",
                }}
                icon="edit"
              />
            )}
            {checkPrivialgeGroup("Fund Grid", 3) && (
              <MenuItem
                text="Delete Voucher"
                data={{
                  action: "delete",
                }}
                icon="delete"
              />
            )}
          </ContextMenu>
          <br></br>
        </fieldset>
      </div>
    </div>
  );
}
