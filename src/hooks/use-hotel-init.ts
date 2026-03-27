import * as React from "react";
import { useHotelStore } from "@/stores/hotelStore";

export function useHotelInit() {
  const initialized = useHotelStore((s) => s.initialized);
  const init = useHotelStore((s) => s.init);

  React.useEffect(() => {
    if (!initialized) init();
  }, [initialized, init]);

  return initialized;
}
