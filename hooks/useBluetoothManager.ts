import { BluetoothManager } from "@/utils/BluetoothManager";
import { useState } from "react";

// Custom Hooks
export const useBluetoothManager = () => {
    const [manager] = useState(() => new BluetoothManager());
    
    return manager;
  };