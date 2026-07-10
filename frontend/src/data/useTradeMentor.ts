import { useContext } from "react";
import { TradeMentorContext } from "./TradeMentorContext";

export function useTradeMentor() {
  const context = useContext(TradeMentorContext);
  if (!context) {
    throw new Error("useTradeMentor must be used within TradeMentorProvider");
  }
  return context;
}
