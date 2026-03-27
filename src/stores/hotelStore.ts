import { create } from "zustand";
import { nanoid } from "nanoid";
import type {
  Booking,
  Customer,
  HotelData,
  Promo,
  Review,
  Room,
  Staff,
  Transaction,
} from "@/lib/models";
import { loadHotelData, mockDelay, resetToSeed, saveHotelData } from "@/lib/mockDb";

type HotelState = HotelData & {
  initialized: boolean;

  // derived (cached)
  getKpis: () => {
    totalBookings: number;
    revenueMonthly: number;
    revenueToday: number;
    occupancyRate: number;
    availableRooms: number;
  };

  init: () => Promise<void>;
  reset: () => Promise<void>;

  // bookings
  upsertBooking: (b: Partial<Booking> & { id?: string }) => Promise<void>;
  cancelBooking: (id: string) => Promise<void>;

  // rooms
  upsertRoom: (r: Partial<Room> & { id?: string }) => Promise<void>;
  deleteRoom: (id: string) => Promise<void>;

  // customers
  upsertCustomer: (c: Partial<Customer> & { id?: string }) => Promise<void>;

  // payments
  addTransaction: (t: Omit<Transaction, "id">) => Promise<void>;

  // reviews
  setReviewVisibility: (id: string, visible: boolean) => Promise<void>;

  // staff
  upsertStaff: (s: Partial<Staff> & { id?: string }) => Promise<void>;
  deactivateStaff: (id: string) => Promise<void>;

  // promos
  upsertPromo: (p: Partial<Promo> & { id?: string }) => Promise<void>;
  togglePromo: (id: string) => Promise<void>;

  // cms + settings
  updateCms: (patch: Partial<HotelData["cms"]>) => Promise<void>;
  updateSettings: (patch: Partial<HotelData["settings"]>) => Promise<void>;
};

function computeKpis(data: HotelData) {
  const now = new Date();
  const todayKey = now.toISOString().slice(0, 10);
  const monthKey = now.toISOString().slice(0, 7);

  const totalBookings = data.bookings.length;

  const revenueMonthly = data.transactions
    .filter((t) => t.status === "paid" && t.createdAt.slice(0, 7) === monthKey)
    .reduce((sum, t) => sum + t.amount, 0);

  const revenueToday = data.transactions
    .filter((t) => t.status === "paid" && t.createdAt.slice(0, 10) === todayKey)
    .reduce((sum, t) => sum + t.amount, 0);

  const availableRooms = data.rooms.filter((r) => r.status === "available").length;
  const occupiedRooms = data.rooms.filter((r) => r.status === "occupied").length;
  const occupancyRate = data.rooms.length ? occupiedRooms / data.rooms.length : 0;

  return { totalBookings, revenueMonthly, revenueToday, occupancyRate, availableRooms };
}

function persist(next: HotelData) {
  saveHotelData(next);
}

export const useHotelStore = create<HotelState>((set, get) => ({
  initialized: false,
  rooms: [],
  customers: [],
  bookings: [],
  transactions: [],
  reviews: [],
  staff: [],
  promos: [],
  cms: {
    heroTitle: "",
    heroSubtitle: "",
    roomsIntro: "",
    servicesIntro: "",
    galleryIntro: "",
  },
  settings: {
    hotelName: "",
    address: "",
    phone: "",
    email: "",
    bookingPolicy: "",
    paymentConfig: { acceptCard: true, acceptCash: true, acceptOnline: true },
    notifications: { email: true, sms: false, inApp: true },
  },

  getKpis: () => computeKpis(get()),

  init: async () => {
    if (get().initialized) return;
    await mockDelay(250);
    const data = loadHotelData();
    set({ ...data, initialized: true });
  },

  reset: async () => {
    const data = await resetToSeed();
    set({ ...data, initialized: true });
  },

  upsertBooking: async (b) => {
    await mockDelay();
    set((state) => {
      const next: HotelData = {
        ...state,
        bookings: state.bookings.some((x) => x.id === b.id)
          ? state.bookings.map((x) => (x.id === b.id ? ({ ...x, ...b } as Booking) : x))
          : [
              {
                id: b.id ?? nanoid(),
                customerId: b.customerId ?? state.customers[0]?.id ?? "",
                roomId: b.roomId ?? state.rooms[0]?.id ?? "",
                roomType: b.roomType ?? "Standard",
                checkIn: b.checkIn ?? new Date().toISOString(),
                checkOut: b.checkOut ?? new Date().toISOString(),
                status: b.status ?? "pending",
                paymentStatus: b.paymentStatus ?? "pending",
                total: b.total ?? 0,
                createdAt: b.createdAt ?? new Date().toISOString(),
                notes: b.notes,
              },
              ...state.bookings,
            ],
      };
      persist(next);
      return next;
    });
  },

  cancelBooking: async (id) => {
    await mockDelay();
    set((state) => {
      const next: HotelData = {
        ...state,
        bookings: state.bookings.map((b) =>
          b.id === id ? { ...b, status: "cancelled", paymentStatus: b.paymentStatus === "paid" ? "refunded" : b.paymentStatus } : b
        ),
      };
      persist(next);
      return next;
    });
  },

  upsertRoom: async (r) => {
    await mockDelay();
    set((state) => {
      const next: HotelData = {
        ...state,
        rooms: state.rooms.some((x) => x.id === r.id)
          ? state.rooms.map((x) => (x.id === r.id ? ({ ...x, ...r } as Room) : x))
          : [
              {
                id: r.id ?? nanoid(),
                number: r.number ?? "",
                type: r.type ?? "Standard",
                pricePerNight: r.pricePerNight ?? 0,
                status: r.status ?? "available",
                images: r.images ?? [],
                floor: r.floor,
                notes: r.notes,
              },
              ...state.rooms,
            ],
      };
      persist(next);
      return next;
    });
  },

  deleteRoom: async (id) => {
    await mockDelay();
    set((state) => {
      const next: HotelData = {
        ...state,
        rooms: state.rooms.filter((r) => r.id !== id),
        bookings: state.bookings.filter((b) => b.roomId !== id),
      };
      persist(next);
      return next;
    });
  },

  upsertCustomer: async (c) => {
    await mockDelay();
    set((state) => {
      const next: HotelData = {
        ...state,
        customers: state.customers.some((x) => x.id === c.id)
          ? state.customers.map((x) => (x.id === c.id ? ({ ...x, ...c } as Customer) : x))
          : [
              {
                id: c.id ?? nanoid(),
                name: c.name ?? "",
                email: c.email ?? "",
                phone: c.phone ?? "",
                vipLevel: c.vipLevel ?? "None",
                tags: c.tags ?? [],
              },
              ...state.customers,
            ],
      };
      persist(next);
      return next;
    });
  },

  addTransaction: async (t) => {
    await mockDelay();
    set((state) => {
      const next: HotelData = {
        ...state,
        transactions: [{ ...t, id: nanoid() }, ...state.transactions],
      };
      persist(next);
      return next;
    });
  },

  setReviewVisibility: async (id, visible) => {
    await mockDelay();
    set((state) => {
      const next: HotelData = {
        ...state,
        reviews: state.reviews.map((r) => (r.id === id ? { ...r, visible } : r)),
      };
      persist(next);
      return next;
    });
  },

  upsertStaff: async (s) => {
    await mockDelay();
    set((state) => {
      const next: HotelData = {
        ...state,
        staff: state.staff.some((x) => x.id === s.id)
          ? state.staff.map((x) => (x.id === s.id ? ({ ...x, ...s } as Staff) : x))
          : [
              {
                id: s.id ?? nanoid(),
                name: s.name ?? "",
                email: s.email ?? "",
                role: s.role ?? "Staff",
                active: s.active ?? true,
              },
              ...state.staff,
            ],
      };
      persist(next);
      return next;
    });
  },

  deactivateStaff: async (id) => {
    await mockDelay();
    set((state) => {
      const next: HotelData = {
        ...state,
        staff: state.staff.map((s) => (s.id === id ? { ...s, active: false } : s)),
      };
      persist(next);
      return next;
    });
  },

  upsertPromo: async (p) => {
    await mockDelay();
    set((state) => {
      const next: HotelData = {
        ...state,
        promos: state.promos.some((x) => x.id === p.id)
          ? state.promos.map((x) => (x.id === p.id ? ({ ...x, ...p } as Promo) : x))
          : [
              {
                id: p.id ?? nanoid(),
                code: p.code ?? "",
                description: p.description ?? "",
                discountPercent: p.discountPercent ?? 0,
                active: p.active ?? true,
                startsAt: p.startsAt,
                endsAt: p.endsAt,
              },
              ...state.promos,
            ],
      };
      persist(next);
      return next;
    });
  },

  togglePromo: async (id) => {
    await mockDelay();
    set((state) => {
      const next: HotelData = {
        ...state,
        promos: state.promos.map((p) => (p.id === id ? { ...p, active: !p.active } : p)),
      };
      persist(next);
      return next;
    });
  },

  updateCms: async (patch) => {
    await mockDelay();
    set((state) => {
      const next: HotelData = { ...state, cms: { ...state.cms, ...patch } };
      persist(next);
      return next;
    });
  },

  updateSettings: async (patch) => {
    await mockDelay();
    set((state) => {
      const next: HotelData = { ...state, settings: { ...state.settings, ...patch } };
      persist(next);
      return next;
    });
  },
}));
