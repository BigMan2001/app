import React, { createContext, useContext, useState } from "react";

type BetContextType = {
  betInput: number; // Changed from string to number
  start: boolean;
  isMovingChips: boolean;
  showMessage: boolean;
  setBetInput: React.Dispatch<React.SetStateAction<number>>;
  setStart: React.Dispatch<React.SetStateAction<boolean>>;
  setIsMovingChips: React.Dispatch<React.SetStateAction<boolean>>;
  setShowMessage: React.Dispatch<React.SetStateAction<boolean>>;
};

const BetContext = createContext<BetContextType | null>(null);

export const BetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [betInput, setBetInput] = useState<number>(0);
  const [start, setStart] = useState<boolean>(false);
  const [isMovingChips, setIsMovingChips] = useState<boolean>(false);
  const [showMessage, setShowMessage] = useState<boolean>(false);

  return (
    <BetContext.Provider value={{ betInput, setBetInput, start, setStart, isMovingChips, setIsMovingChips, showMessage, setShowMessage }}>
      {children}
    </BetContext.Provider>
  );
};


export const useBet = () => useContext(BetContext);


