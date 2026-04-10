import { useEffect, useState } from "react";
import { getCurrentDimension } from "../helpers/getCurrentDimension";

export const useSmallWidth = (width) => {
  const currentWidth = getCurrentDimension().width;

  const [isValid, setIsValid] = useState(() => currentWidth < width);

  useEffect(() => {
    const handleResizing = () => {
      if (currentWidth < width) {
        setIsValid(true);
      } else setIsValid(false);
    };

    window.addEventListener("resize", handleResizing);

    return () => {
      window.removeEventListener("resize", handleResizing);
    };
  }, [width]);
  return isValid;
};
