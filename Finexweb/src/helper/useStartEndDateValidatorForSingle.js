import { useEffect, useState } from "react";

export const useStartEndDateValidatorForSingle = () => {
  const [selectedStartDate, setSelectedStartDate] = useState();
  const [selectedEndDate, setSelectedEndDate] = useState();
  const [endDateError, setEndDateError] = useState("");
  const [key, setKey] = useState(0);

  useEffect(() => {
    setEndDateError("");
  }, []);

  const localEndDateValidator = ({ enddate, startdate }) => {
    setKey(key + 1);
    const startDate = new Date(startdate ?? selectedStartDate);
    const endDate = new Date(enddate ?? selectedEndDate);

    if (!startDate && !startdate) {
      return setEndDateError("Please select start date first");
    }

    if (
      startDate &&
      endDate &&
      endDate.getFullYear() !== 1969 &&
      endDate <= startDate
    ) {
      setEndDateError("End date should be greater than start date");
    } else {
      setEndDateError("");
    }
  };

  const updateStartDateFun = ({ formRenderProps, enddate }) => {
    setKey(key + 1);
    let dateformat = new Date(formRenderProps.value);
    let month =
      dateformat.getMonth() < 9
        ? "0" + (dateformat.getMonth() + 1)
        : dateformat.getMonth() + 1;
    let date =
      month + "-" + dateformat.getDate() + "-" + dateformat.getFullYear();

    setSelectedStartDate(date.toString());
    localEndDateValidator({ startdate: dateformat, enddate });
  };

  const updateEndDateFun = ({ formRenderProps, startdate }) => {
    setKey(key + 1);
    let dateformat = new Date(formRenderProps.value);
    let month =
      dateformat.getMonth() < 9
        ? "0" + (dateformat.getMonth() + 1)
        : dateformat.getMonth() + 1;
    let date =
      month + "-" + dateformat.getDate() + "-" + dateformat.getFullYear();

    setSelectedEndDate(date.toString());
    localEndDateValidator({ enddate: dateformat, startdate });
  };

  const resetDatesFun = () => {
    setSelectedStartDate(null);
    setSelectedEndDate(null);
    setEndDateError("");
  };

  return {
    selectedStartDate,
    selectedEndDate,
    endDateError,
    updateStartDateFun,
    updateEndDateFun,
    resetDatesFun,
  };
};
