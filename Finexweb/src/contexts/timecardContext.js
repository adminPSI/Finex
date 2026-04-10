import React, { createContext, useContext, useState } from "react";

const TimeCardContext = createContext();

export const useTimecardContext = () => useContext(TimeCardContext);

export const TimeCardProvider = ({ children }) => {
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setIsformType] = useState("");
  const [formData, setIsformData] = useState({});

  const handleFormSubmit = (formType) => {
    setIsformType(formType);
    setIsFormSubmitted(true);
  };
  const handleFormOpen = (formData) => {
    setIsFormOpen(true);
    setIsformData(formData);
  };

  const resetFormData = () => {
    setIsformData({});
    setIsFormOpen(false);
  };
  const resetFormSubmit = () => {
    setIsformType("");
    setIsFormSubmitted(false);
  };

  return (
    <TimeCardContext.Provider
      value={{
        isFormSubmitted,
        isFormOpen,
        formType,
        formData,
        handleFormSubmit,
        handleFormOpen,
        resetFormData,
        resetFormSubmit,
      }}
    >
      {children}
    </TimeCardContext.Provider>
  );
};
