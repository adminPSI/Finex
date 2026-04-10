import React, { createContext, useContext, useState } from "react";

const EmployeeContext = createContext({
  selectedJob: null,
  selectedEmployee: null,
  setSelectedJob: () => {},
  setSelectedEmployeeId: () => {},
});

export const useEmployeeContext = () => useContext(EmployeeContext);

export const EmployeeProvider = ({ children }) => {
  const [selectedJob, setSelectedJob] = useState([]);
  const [selectedEmployee, setSelectedEmployeeId] = useState(null);

  return (
    <EmployeeContext.Provider
      value={{
        selectedJob: selectedJob,
        selectedEmployee: selectedEmployee,
        setSelectedJob,
        setSelectedEmployeeId,
      }}
    >
      {children}
    </EmployeeContext.Provider>
  );
};
