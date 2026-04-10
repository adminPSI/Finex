import React, { lazy } from "react";

const Dashboard = lazy(() => import("./components/Dashboard"));
const Account = lazy(() => import("./components/Account"));
const ProjectCosting = lazy(
  () => import("./components/Projects/ProjectCosting")
);
const EquipmentSetup = lazy(() => import("./components/EquipmentSetup"));
const Inventory = lazy(
  () => import("./components/AssetsAndInventory/Inventory")
);
const Assets = lazy(() => import("./components/AssetsAndInventory/Assets"));
const AddAssets = lazy(
  () => import("./components/AssetsAndInventory/AddAssets")
);
const AddInventory = lazy(
  () => import("./components/AssetsAndInventory/AddInventory")
);
const AppRoutes = [
  {
    index: true,
    path: "/",
    element: <Dashboard />,
  },
  {
    path: "/account",
    element: <Account />,
  },
  {
    path: "/projectcosting",
    element: <ProjectCosting />,
  },
  {
    path: "/equipmentsetup",
    element: <EquipmentSetup />,
  },
  {
    path: "/inventory",
    element: <Inventory />,
  },
  {
    path: "/assets",
    element: <Assets />,
  },
  {
    path: "/addassets",
    element: <AddAssets />,
  },
  {
    path: "/addinventory",
    element: <AddInventory />,
  },
];

export default AppRoutes;
