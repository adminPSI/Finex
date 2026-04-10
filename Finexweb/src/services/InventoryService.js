import { InventoryEndPoints } from "../EndPoints";
import axiosInstance from "../core/HttpInterceptor";

const getInventoryList = async () => {
  try {
    const response = await axiosInstance.get(InventoryEndPoints.Inventory);
    return response.data;
  } catch (error) {
    throw error;
  }
};
const addInventory = async (data) => {
  try {
    const response = await axiosInstance.post(
      InventoryEndPoints.Inventory,
      data
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
const editInventory = async (data) => {
  try {
    const response = await axiosInstance.put(
      InventoryEndPoints.Inventory + "/" + data.id,
      data
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
const deleteInventory = async (id) => {
  try {
    const response = await axiosInstance.delete(
      InventoryEndPoints.Inventory + "/" + data.id
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const inventoryService = {
  getInventoryList,
  addInventory,
  editInventory,
  deleteInventory,
};
