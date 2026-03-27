import type { HotelData } from "@/lib/models";
import { createSeedData } from "@/lib/seed";

const KEY = "had_data_v1";

export function loadHotelData(): HotelData {
  const raw = localStorage.getItem(KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as HotelData;
    } catch {
      // fall through
    }
  }
  const seed = createSeedData();
  saveHotelData(seed);
  return seed;
}

export function saveHotelData(data: HotelData) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export async function mockDelay(ms = 350) {
  await new Promise((r) => setTimeout(r, ms));
}

export async function resetToSeed(): Promise<HotelData> {
  await mockDelay(250);
  const seed = createSeedData();
  saveHotelData(seed);
  return seed;
}
