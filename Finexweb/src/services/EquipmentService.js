import { equipmentSetupEndPoints } from "../EndPoints";
import axiosInstance from "../core/HttpInterceptor";

const getEquipmentSetupList = async () => {
  try {
    const response = await axiosInstance.get(
      equipmentSetupEndPoints.EquipmentSetup
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
const getEquipmentSetupWithFilter = async (skip, take, desc, sortKey) => {
  try {
    const response = await axiosInstance.post(
      equipmentSetupEndPoints.EquipmentSetupWithFilter +
        `?name=&&hourlyRate=&&search=&&skip=${skip}&&take=${take}&&desc=${desc}&&sortKey=${sortKey}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
const addEquipmentSetup = async (data) => {
  try {
    const response = await axiosInstance.post(
      equipmentSetupEndPoints.EquipmentSetup,
      data
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
const editEquipmentSetup = async (data) => {
  try {
    const response = await axiosInstance.put(
      equipmentSetupEndPoints.EquipmentSetup + "/" + data.id,
      data
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
const deleteEquipmentSetup = async (id) => {
  try {
    const response = await axiosInstance.delete(
      equipmentSetupEndPoints.EquipmentSetup + "/" + id
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const equipmentService = {
  getEquipmentSetupList,
  getEquipmentSetupWithFilter,
  addEquipmentSetup,
  editEquipmentSetup,
  deleteEquipmentSetup,
};
