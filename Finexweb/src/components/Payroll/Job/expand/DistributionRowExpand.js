import React from "react";

const DistributionRowExpand = (props) => {
  const { dataItem } = props;
  if (!dataItem) return <></>;
  return (
    <div>
      <div className="d-flex k-justify-content-between">
        <div className="col-6 d-flex p-2">
          <div className="col-5 fw-bold">Vacation Payout</div>
          <div className="col-3">{dataItem.vacaPayout ? "Yes" : "No"}</div>
        </div>
        <div className="col-6 d-flex p-2">
          <div className="col-5 fw-bold">Sick Payout</div>
          <div className="col-3">{dataItem.sickPayout ? "Yes" : "No"}</div>
        </div>
      </div>
      <div className="d-flex k-justify-content-between">
        <div className="col-6 d-flex p-2">
          <div className="col-5 fw-bold">Flat Rate No Hours</div>
          <div className="col-3">{dataItem.flatRateNoHours ? "Yes" : "No"}</div>
        </div>
        <div className="col-6 d-flex p-2">
          <div className="col-5 fw-bold">Sick Time</div>
          <div className="col-3">{dataItem.sick ? "Yes" : "No"}</div>
        </div>
      </div>
    </div>
  );
};

export default DistributionRowExpand;
