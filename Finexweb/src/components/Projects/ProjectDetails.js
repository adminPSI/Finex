import {
  Chart,
  ChartCategoryAxis,
  ChartCategoryAxisItem,
  ChartSeries,
  ChartSeriesItem,
  ChartSeriesLabels,
} from "@progress/kendo-react-charts";
import React, { useEffect, useState } from "react";
import usePrivilege from "../../helper/usePrivilege";
import { projectService } from "../../services/ProjectServices";

const ProjectDetails = ({ project }) => {
  const [projectCostingDetails, setProjectCostingDetails] = useState(null);

  useEffect(() => {
    if (project) {
      getProjectDateById();
    }
  }, [project]);

  const getProjectDateById = () => {
    projectService
      .getProject(project.id)
      .then((data) => {
        setProjectCostingDetails(data);
      })
      .catch(() => { });
  };

  const materials = projectCostingDetails?.materialCost;
  const equipment = projectCostingDetails?.equipmentCost;
  const labor = projectCostingDetails?.laborCost;

  const totalCost = projectCostingDetails?.totalCost;
  const revenueCost = projectCostingDetails?.revenue;
  const budget = projectCostingDetails?.budget;

  const projectcostingData = [
    {
      category: "Materials/Supplies",
      value: materials,
    },
    {
      category: "Equipment",
      value: equipment,
    },
    {
      category: "Labor",
      value: labor,
    },
  ];
  const totalCosting = [
    {
      category: "Total Cost",
      value: totalCost,
    },
    {
      category: "Budget",
      value: budget,
    },
    {
      category: "RevenueCost",
      value: revenueCost,
    },
  ];
  const projectCostingCategery = ["Materials/Supplies", "Equipment", "Labor"];
  const totalCostingCategery = ["Total Cost", "Budget", "Revenue"];

  const numbericFormat = (num) => {
    let Amount = num.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
    return "$" + Amount.toLocaleString();
  };

  const dateFormat = (date) => {
    let dateform;
    if (date) {
      const [year, month, day] = date.split("T")[0].split("-");
      dateform = `${month}/${day}/${year}`;
    } else {
      dateform = null;
    }
    return dateform;
  };

  const chartBootstrapColors = [
    "#0275d8",
    "#5bc0de",
    "5cb85c",
    "#0270de",
    "#0560de",
  ];
  const { checkPrivialgeGroup, loading, error } = usePrivilege('Project Costing')
  if (loading) return <div>Loading privileges...</div>
  if (error) return <div>Error: {error}</div>
  return (
    <>
      {checkPrivialgeGroup("PCTDM", 1) && (
        <div className="w-100">
          <div className="d-flex align-items-start mb-3 w-100">
            <div className="col-4 me-3">
              <h2>Project Details</h2>
              <table>
                <tr className="">
                  <td className="py-1">
                    <div className="d-flex  align-items-center">
                      <h6 className="mb-0 me-2">Project Name</h6>
                      <strong className="ms-auto">:</strong>
                    </div>
                  </td>
                  <td>
                    <div className="ms-2"> {project?.name || ""}</div>
                  </td>
                </tr>
                <tr className="">
                  <td className="py-1">
                    <div className="d-flex  align-items-center">
                      <h6 className="mb-0 me-2">Type Of Work</h6>
                      <strong className="ms-auto">:</strong>
                    </div>
                  </td>
                  <td>
                    <div className="ms-2"> {project?.workType || "-"}</div>
                  </td>
                </tr>
                <tr className="">
                  <td className="py-1">
                    <div className="d-flex  align-items-center">
                      <h6 className="mb-0 me-2">Budget </h6>
                      <strong className="ms-auto">:</strong>
                    </div>
                  </td>
                  <td>
                    <div className="ms-2">
                      {numbericFormat(project?.budget || 0)}
                    </div>
                  </td>
                </tr>
                <tr className="">
                  <td className="py-1">
                    <div className="d-flex  align-items-center">
                      <h6 className="mb-0 me-2">Start Date </h6>
                      <strong className="ms-auto">:</strong>
                    </div>
                  </td>
                  <td>
                    <div className="ms-2">{dateFormat(project?.startDate)}</div>
                  </td>
                </tr>
                <tr className="">
                  <td className="py-1">
                    <div className="d-flex  align-items-center">
                      <h6 className="mb-0 me-2">End Date </h6>
                      <strong className="ms-auto">:</strong>
                    </div>
                  </td>
                  <td>
                    <div className="ms-2">
                      {project?.endDate ? (
                        <div> {dateFormat(project?.endDate)}</div>
                      ) : (
                        <div> -</div>
                      )}
                    </div>
                  </td>
                </tr>
                <tr className="">
                  <td className="py-1">
                    <div className="d-flex  align-items-center">
                      <h6 className="mb-0 me-2">Location </h6>
                      <strong className="ms-auto">:</strong>
                    </div>
                  </td>
                  <td>
                    <div className="ms-2">{project?.location}</div>
                  </td>
                </tr>
              </table>
            </div>
            <div className="col-8">
              <Chart
                style={{ width: 750, height: 300 }}
                seriesColors={chartBootstrapColors}
              >
                <ChartCategoryAxis>
                  <ChartCategoryAxisItem
                    categories={projectCostingCategery}
                    max={5}
                  />
                </ChartCategoryAxis>
                <ChartSeries>
                  <ChartSeriesItem
                    data={projectcostingData}
                    type="bar"
                    gap={4}
                    spacing={0.25}
                  >
                    <ChartSeriesLabels format="c2" />
                  </ChartSeriesItem>
                </ChartSeries>
              </Chart>
            </div>
          </div>

          <div>
            <Chart style={{ width: 1000, height: 300 }}>
              <ChartCategoryAxis>
                <ChartCategoryAxisItem categories={totalCostingCategery} />
              </ChartCategoryAxis>
              <ChartSeries>
                <ChartSeriesItem
                  data={totalCosting}
                  type="bar"
                  gap={4}
                  spacing={0.25}
                >
                  <ChartSeriesLabels format="c0" />
                </ChartSeriesItem>
              </ChartSeries>
            </Chart>
          </div>
        </div>
      )}
    </>
  );
};
export default ProjectDetails;
