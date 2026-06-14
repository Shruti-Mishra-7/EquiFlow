import { useEffect, useState } from "react";
import { db } from "./firebaseConfigs"; // Your firebase init file
import { doc, onSnapshot, collection } from "firebase/firestore";

export const useValveData = (wardId, valveId) => {
  const [valve, setValve] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This is the "Magic" path to your Phase 3 data
    const valveRef = doc(db, "wards", wardId, "valves", valveId);

    // Listen for real-time changes
    const unsubscribe = onSnapshot(valveRef, (docSnap) => {
      if (docSnap.exists()) {
        setValve({ id: docSnap.id, ...docSnap.data() });
      }
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [wardId, valveId]);

  return { valve, loading };
};