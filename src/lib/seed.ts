import { nanoid } from "nanoid";
import type { Booking, Customer, HotelData, Promo, Review, Room, Staff, Transaction } from "@/lib/models";
import roomStandard from "@/assets/hotel/room-standard.webp";
import roomSuite from "@/assets/hotel/room-suite.webp";

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)]!;
}

function addDays(iso: string, days: number) {
  const d = new Date(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
}

function startOfUtcDay(d: Date) {
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  return x;
}

export function createSeedData(now = new Date("2026-03-28T00:00:00Z")): HotelData {
  const rng = mulberry32(1337);

  const rooms: Room[] = [
    { id: "r_101", number: "101", type: "Standard", pricePerNight: 180, status: "available", images: [roomStandard], floor: 1 },
    { id: "r_102", number: "102", type: "Standard", pricePerNight: 180, status: "occupied", images: [roomStandard], floor: 1 },
    { id: "r_201", number: "201", type: "Deluxe", pricePerNight: 260, status: "available", images: [roomStandard], floor: 2 },
    { id: "r_202", number: "202", type: "Deluxe", pricePerNight: 260, status: "maintenance", images: [roomStandard], floor: 2 },
    { id: "r_301", number: "301", type: "Suite", pricePerNight: 420, status: "available", images: [roomSuite], floor: 3 },
    { id: "r_302", number: "302", type: "Suite", pricePerNight: 420, status: "occupied", images: [roomSuite], floor: 3 },
  ];

  const customers: Customer[] = [
    { id: "c_01", name: "Ava Nguyen", email: "ava.nguyen@example.com", phone: "+84 901 111 222", vipLevel: "Gold", tags: ["anniversary"] },
    { id: "c_02", name: "Ethan Tran", email: "ethan.tran@example.com", phone: "+84 901 333 444", vipLevel: "None", tags: [] },
    { id: "c_03", name: "Mia Le", email: "mia.le@example.com", phone: "+84 901 555 666", vipLevel: "Platinum", tags: ["vip", "quiet-floor"] },
    { id: "c_04", name: "Noah Pham", email: "noah.pham@example.com", phone: "+84 901 777 888", vipLevel: "Silver", tags: ["late-checkout"] },
  ];

  const staff: Staff[] = [
    { id: "s_01", name: "Admin", email: "admin@hotel.local", role: "Super Admin", active: true },
    { id: "s_02", name: "Front Office", email: "frontoffice@hotel.local", role: "Manager", active: true },
    { id: "s_03", name: "Night Shift", email: "night@hotel.local", role: "Staff", active: true },
  ];

  const promos: Promo[] = [
    { id: "p_01", code: "LAKEVIEW10", description: "10% off waterfront stays", discountPercent: 10, active: true },
    { id: "p_02", code: "SUITE15", description: "15% off suites (limited)", discountPercent: 15, active: false },
  ];

  const bookings: Booking[] = [];
  const transactions: Transaction[] = [];
  const reviews: Review[] = [];

  const today = startOfUtcDay(now);

  // Generate ~50 bookings across last 30 days
  for (let i = 0; i < 52; i++) {
    const createdAt = addDays(today.toISOString(), -Math.floor(rng() * 30));
    const nights = 1 + Math.floor(rng() * 4);
    const room = pick(rng, rooms);
    const customer = pick(rng, customers);
    const checkIn = addDays(createdAt, Math.floor(rng() * 10));
    const checkOut = addDays(checkIn, nights);

    const status = pick(rng, ["confirmed", "confirmed", "pending", "cancelled"] as const);
    const paymentStatus = status === "cancelled" ? pick(rng, ["refunded", "pending"] as const) : pick(rng, ["paid", "paid", "pending"] as const);

    const total = room.pricePerNight * nights * (paymentStatus === "refunded" ? 0.2 : 1);

    const booking: Booking = {
      id: `b_${String(i + 1).padStart(3, "0")}`,
      customerId: customer.id,
      roomId: room.id,
      roomType: room.type,
      checkIn,
      checkOut,
      status,
      paymentStatus,
      total: Math.round(total),
      createdAt,
    };
    bookings.push(booking);

    if (paymentStatus !== "pending") {
      transactions.push({
        id: `t_${String(i + 1).padStart(3, "0")}`,
        bookingId: booking.id,
        amount: booking.total,
        method: pick(rng, ["card", "cash", "online"] as const),
        status: paymentStatus,
        createdAt,
      });
    }

    if (status === "confirmed" && rng() > 0.55) {
      reviews.push({
        id: nanoid(),
        customerId: customer.id,
        bookingId: booking.id,
        rating: pick(rng, [4, 5, 5, 4, 5]),
        comment: pick(rng, [
          "Quiet, refined, and impeccably clean.",
          "The check-in was effortless. Loved the textures and lighting.",
          "Suite views were unreal. Would return.",
          "Perfect sleep—soundproofing is excellent.",
        ]),
        createdAt,
        visible: rng() > 0.2,
      });
    }
  }

  const cms = {
    heroTitle: "Arrive softly. Stay brilliantly.",
    heroSubtitle: "Modern rooms, spa rituals, and a booking experience built for speed.",
    roomsIntro: "Choose your room style—from minimalist kings to panoramic suites.",
    servicesIntro: "Concierge-led stays. Zero friction.",
    galleryIntro: "A calm palette of light, wood, and water.",
  };

  const settings = {
    hotelName: "The Artisan Lakeview Hotel",
    address: "88 Aurelia Avenue, Waterfront District",
    phone: "+84 900 123 456",
    email: "hello@artisanlakeview.example",
    bookingPolicy:
      "Free cancellation up to 24h before check-in. Late cancellations incur one-night charge.",
    paymentConfig: { acceptCard: true, acceptCash: true, acceptOnline: true },
    notifications: { email: true, sms: false, inApp: true },
  };

  return { rooms, customers, bookings, transactions, reviews, staff, promos, cms, settings };
}
