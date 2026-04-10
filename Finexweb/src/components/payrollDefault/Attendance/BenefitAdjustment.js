import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../../core/HttpInterceptor";
import { payrollEndpoints, PayrollEndPoints } from "../../../EndPoints";
import usePrivilege from "../../../helper/usePrivilege";
import BenefitAdjustmentFilter from "./BenefitAdjustmentFilter";
import BenefitAdjustmentGrid from "./BenefitAdjustmentGrid";

const BenefitAdjustment = () => {
  const [payrollAdjustmentData, setPayrollAdjustmentData] = useState([]);
  const [total, setTotal] = useState(0);
  const [pageTotal, setPageTotal] = useState();
  const [datePaid, setDatePaid] = useState();
  const [isPostDate, setIsPostDate] = useState()

  const [benefitList, setBenefitList] = useState([
    { id: 0, benefitsName: "Select Benefit" },
  ]);

  const [selectedBenefit, setSelectedBenefit] = useState();
  const [isFetch, setIsFetch] = useState(false);

  const fetchBenefit = async () => {
    try {
      const result = await axiosInstance({
        method: "GET",
        url: PayrollEndPoints.Benefits,
        withCredentials: false,
      });

      setBenefitList([
        { id: 0, benefitsName: "Select Benefit" },
        ...result.data?.data,
      ]);
      setIsFetch(true);
    } catch (error) {
      console.log(error);
    }
  };

  const getBenefitAdjustmentGrid = (cskip, ctake, sort, desc) => {
    getPayrollAdjustment(datePaid, false, cskip, ctake, sort, desc);
  };

  const getPayrollAdjustment = async (
    date = datePaid,
    benefitId = false,
    skip = 0,
    take = 10,
    sort = 'lastName',
    desc = false
  ) => {
    const BenefitId = benefitId
      ? benefitId
      : selectedBenefit &&
        Object.keys(selectedBenefit) &&
        Object.keys(selectedBenefit).length
        ? selectedBenefit.id
        : "";

    let url =
      payrollEndpoints.BenefitAdjustment +
      `?datePaid=${date}&skip=${skip}&take=${take}&desc=${desc}&sortKey=${sort}`;

    if (BenefitId && benefitId !== 0) {
      url += `&benefitId=${BenefitId}`;
    } else {
      url =
        payrollEndpoints.BenefitAdjustment +
        `?datePaid=${date}&skip=${skip}&take=${take}&desc=${desc}&sortKey=${sort}`;
    }

    return axiosInstance({
      method: "GET",
      url,
      withCredentials: false,
    })
      .then((response) => {
        let data = response.data;
        setPageTotal(data.total);
        setPayrollAdjustmentData(data.data);
        setTotal(data.totalAmount);
        setIsPostDate(data?.postDate)
      })
      .catch(() => { });
  };

  useEffect(() => {
    fetchBenefit();
  }, []);

  const BenefitAdjustmentOption = useMemo(() => {
    if (selectedBenefit && selectedBenefit?.id !== 0) {
      let arr = payrollAdjustmentData.filter(
        (i) => i.benefitId == selectedBenefit?.id
      );
      return arr;
    } else {
      return payrollAdjustmentData;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBenefit, payrollAdjustmentData]);
  const { checkPrivialgeGroup, loading, error } = usePrivilege('PayrollRun')
  if (loading) return <div>Loading privileges...</div>
  if (error) return <div>Error: {error}</div>
  return (
    <div>
      <div className="d-flex  k-flex-row k-w-full gap-3 pb-3 align-items-end k-flex-wrap">
        <BenefitAdjustmentFilter
          benefitList={benefitList}
          setSelectedBenefit={setSelectedBenefit}
          selectedBenefit={selectedBenefit}
          getPayrollAdjustment={getPayrollAdjustment}
          setDatePaid={setDatePaid}
          total={total}
          isPostDate={isPostDate}
          fetchBenefit={fetchBenefit}
        />
        {checkPrivialgeGroup("PRBAG", 1) && <BenefitAdjustmentGrid
          data={isFetch ? BenefitAdjustmentOption : []}
          benefitList={benefitList}
          setProjectOptions={setPayrollAdjustmentData}
          paginationData={{ pageTotal }}
          getBenefitAdjustmentGrid={getBenefitAdjustmentGrid}
          fetchBenefit={getPayrollAdjustment}
          checkPrivialgeGroup={checkPrivialgeGroup}
        />}
      </div>
    </div>
  );
};

export default BenefitAdjustment;
