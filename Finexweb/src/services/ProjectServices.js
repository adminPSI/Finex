import { projectCostingEndPoints } from "../EndPoints";
import axiosInstance from "../core/HttpInterceptor";
const fetchProjects = async () => {
  try {
    const response = await axiosInstance.get(projectCostingEndPoints.Project);
    return response.data;
  } catch (error) {
    return error;
  }
};
const getProject = async (id) => {
  try {
    const response = await axiosInstance.get(
      projectCostingEndPoints.Project + "/" + id
    );
    return response.data;
  } catch (error) {
    return error;
  }
};
const fetchLocations = async () => {
  try {
    const response = await axiosInstance.get(
      projectCostingEndPoints.GetLocations
    );
    return response.data;
  } catch (error) {
    return error;
  }
};
const fetchTypeOfWorkList = async () => {
  try {
    const response = await axiosInstance.get(
      projectCostingEndPoints.GetTypeOfWorkList
    );
    return response.data;
  } catch (error) {
    return error;
  }
};
const fetchVendorList = async () => {
  try {
    const response = await axiosInstance.post(
      projectCostingEndPoints.GetVendors +
        "/Filter?isActive=Y&vendorType=vendor&name="
    );
    return response.data;
  } catch (error) {
    return error;
  }
};
const addProject = async (data) => {
  try {
    const response = await axiosInstance.post(
      projectCostingEndPoints.Project,
      data
    );
    return response.data;
  } catch (error) {
    return error;
  }
};
const editProject = async (data) => {
  try {
    const response = await axiosInstance.put(
      projectCostingEndPoints.Project + "/" + data.id,
      data
    );
    return response.data;
  } catch (error) {
    return error;
  }
};
const getLabourList = async (id) => {
  try {
    const response = await axiosInstance.get(
      projectCostingEndPoints.Labour.replace("#ProjectId#", id)
    );
    return response.data;
  } catch (error) {
    return error;
  }
};
const getLabourListWithFilter = async (
  id,
  empName,
  workType,
  hours,
  hourlyRate,
  totalCost,
  search,
  cskip,
  ctake,
  desc,
  sortKey
) => {
  try {
    const response = await axiosInstance.post(
      projectCostingEndPoints.GetLaborWithFilter.replace("#ProjectId#", id) +
        "empName=" +
        empName +
        "&&hours=" +
        hours +
        "&&hourlyRate=" +
        hourlyRate +
        "&&totalCost=" +
        totalCost +
        "&&workType=" +
        workType +
        "&&search=" +
        search +
        "&&skip=" +
        cskip +
        "&&take=" +
        ctake +
        "&&desc=" +
        desc +
        "&&sortKey=" +
        sortKey
    );
    return response.data;
  } catch (error) {
    return error;
  }
};
const addLabourList = async (id, labourInfo) => {
  try {
    const response = await axiosInstance.post(
      projectCostingEndPoints.Labour.replace("#ProjectId#", id),
      labourInfo
    );
    return response.data;
  } catch (error) {
    return error;
  }
};
const editLabourList = async (id, labourInfo) => {
  try {
    const response = await axiosInstance.put(
      projectCostingEndPoints.Labour.replace("/#ProjectId#", "") +
        "/" +
        labourInfo.id,
      labourInfo
    );
    return response.data;
  } catch (error) {
    return error;
  }
};
const deleteLabourList = async (id) => {
  try {
    const response = await axiosInstance.delete(
      projectCostingEndPoints.Labour.replace("/#ProjectId#", "") + "/" + id
    );
    return response.data;
  } catch (error) {
    return error;
  }
};
const getMaterialSuppliesList = async (id) => {
  try {
    const response = await axiosInstance.get(
      projectCostingEndPoints.MaterialSupplies.replace("#ProjectId#", id)
    );
    return response.data;
  } catch (error) {
    return error;
  }
};
const getMaterialSuppliesListWithFilter = async (
  id,
  material,
  vendorName,
  quantity,
  unitCost,
  totalCost,
  notes,
  workType,
  search,
  cskip,
  ctake,
  desc,
  sortKey
) => {
  try {
    const response = await axiosInstance.post(
      projectCostingEndPoints.GetMaterialSuppliesListWithFilter.replace(
        "#ProjectId#",
        id
      ) +
        "material=" +
        material +
        "&&vendorName=" +
        vendorName +
        "&&unitCost=" +
        unitCost +
        "&&totalCost=" +
        totalCost +
        "&&notes=" +
        notes +
        "&&workType=" +
        workType +
        "&&quantity=" +
        quantity +
        "&&search=" +
        search +
        "&&skip=" +
        cskip +
        "&&take=" +
        ctake +
        "&&desc=" +
        desc +
        "&&sortKey=" +
        sortKey
    );
    return response.data;
  } catch (error) {
    return error;
  }
};

const addMaterialSuppliesList = async (id, MaterialSuppliesInfo) => {
  try {
    const response = await axiosInstance.post(
      projectCostingEndPoints.MaterialSupplies.replace("#ProjectId#", id),
      MaterialSuppliesInfo
    );
    return response.data;
  } catch (error) {
    return error;
  }
};
const editMaterialSuppliesList = async (id, MaterialSuppliesInfo) => {
  try {
    const response = await axiosInstance.put(
      projectCostingEndPoints.MaterialSupplies.replace("/#ProjectId#", "") +
        "/" +
        MaterialSuppliesInfo.id,
      MaterialSuppliesInfo
    );
    return response.data;
  } catch (error) {
    return error;
  }
};
const deleteMaterialSuppliesList = async (id) => {
  try {
    const response = await axiosInstance.delete(
      projectCostingEndPoints.MaterialSupplies.replace("/#ProjectId#", "") +
        "/" +
        id
    );
    return response.data;
  } catch (error) {
    return error;
  }
};
const getEquipmentList = async (id) => {
  try {
    const response = await axiosInstance.get(
      projectCostingEndPoints.Equipment.replace("#ProjectId#", id)
    );
    return response.data;
  } catch (error) {
    return error;
  }
};
const GetEquipmentListWithFilter = async (
  id,
  name,
  workType,
  hours,
  hourlyRate,
  totalCost,
  search,
  cskip,
  ctake,
  desc,
  sortKey
) => {
  try {
    const response = await axiosInstance.post(
      projectCostingEndPoints.GetEquipmentWithFilter.replace(
        "#ProjectId#",
        id
      ) +
        "name=" +
        name +
        "&&hours=" +
        hours +
        "&&hourlyRate=" +
        hourlyRate +
        "&&totalCost=" +
        totalCost +
        "&&workType=" +
        workType +
        "&&search=" +
        search +
        "&&skip=" +
        cskip +
        "&&take=" +
        ctake +
        "&&desc=" +
        desc +
        "&&sortKey=" +
        sortKey
    );
    return response.data;
  } catch (error) {
    return error;
  }
};
const addEquipmentList = async (id, EquipmentInfo) => {
  try {
    const response = await axiosInstance.post(
      projectCostingEndPoints.Equipment.replace("#ProjectId#", id),
      EquipmentInfo
    );
    return response.data;
  } catch (error) {
    return error;
  }
};
const editEquipmentList = async (id, EquipmentInfo) => {
  try {
    const response = await axiosInstance.put(
      projectCostingEndPoints.Equipment.replace("/#ProjectId#", "") +
        "/" +
        EquipmentInfo.id,
      EquipmentInfo
    );
    return response.data;
  } catch (error) {
    return error;
  }
};
const deleteEquipmentList = async (id) => {
  try {
    const response = await axiosInstance.delete(
      projectCostingEndPoints.Equipment.replace("/#ProjectId#", "") + "/" + id
    );
    return response.data;
  } catch (error) {
    return error;
  }
};
const getRevenueList = async (id) => {
  try {
    const response = await axiosInstance.get(
      projectCostingEndPoints.Revenue.replace("#ProjectId#", id)
    );
    return response.data;
  } catch (error) {
    return error;
  }
};
const GetRevenueListWithFilter = async (
  id,
  revBDCheckNo,
  customerName,
  bdDescription,
  modifiedBy,
  revBDAmount,
  search,
  cskip,
  ctake,
  desc,
  sortKey
) => {
  try {
    const response = await axiosInstance.post(
      projectCostingEndPoints.GetRevenueWithFilter.replace("#ProjectId#", id) +
        "revBDCheckNo=" +
        revBDCheckNo +
        "&&customerName=" +
        customerName +
        "&&bdDescription=" +
        bdDescription +
        "&&modifiedBy=" +
        modifiedBy +
        "&&revBDAmount=" +
        revBDAmount +
        "&&search=" +
        search +
        "&&skip=" +
        cskip +
        "&&take=" +
        ctake +
        "&&desc=" +
        desc +
        "&&sortKey=" +
        sortKey
    );
    return response.data;
  } catch (error) {
    return error;
  }
};
const addRevenueList = async (id, RevenueInfo) => {
  try {
    const response = await axiosInstance.post(
      projectCostingEndPoints.Revenue.replace("#ProjectId#", id),
      RevenueInfo
    );
    return response.data;
  } catch (error) {
    return error;
  }
};
const editRevenueList = async (id, RevenueInfo) => {
  try {
    const response = await axiosInstance.put(
      projectCostingEndPoints.Revenue.replace("/#ProjectId#", "") +
        "/" +
        RevenueInfo.id,
      RevenueInfo
    );
    return response.data;
  } catch (error) {
    return error;
  }
};
const deleteRevenueList = async (id) => {
  try {
    const response = await axiosInstance.delete(
      projectCostingEndPoints.Revenue.replace("/#ProjectId#", "") + "/" + id
    );
    return response.data;
  } catch (error) {
    return error;
  }
};
export const projectService = {
  fetchProjects,
  getProject,
  addProject,
  editProject,
  fetchLocations,
  fetchTypeOfWorkList,
  fetchVendorList,
  getLabourList,
  addLabourList,
  editLabourList,
  deleteLabourList,
  getLabourListWithFilter,
  getMaterialSuppliesList,
  addMaterialSuppliesList,
  editMaterialSuppliesList,
  deleteMaterialSuppliesList,
  getMaterialSuppliesListWithFilter,
  getEquipmentList,
  addEquipmentList,
  editEquipmentList,
  deleteEquipmentList,
  GetEquipmentListWithFilter,
  getRevenueList,
  addRevenueList,
  editRevenueList,
  deleteRevenueList,
  GetRevenueListWithFilter,
};
