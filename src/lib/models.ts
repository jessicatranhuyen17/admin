export type BookingStatus = "confirmed" | "pending" | "cancelled";
export type PaymentStatus = "paid" | "pending" | "refunded";
export type RoomStatus = "available" | "occupied" | "maintenance";

export type RoomType = "Standard" | "Deluxe" | "Suite";

export type Room = {
  id: string;
  number: string;
  type: RoomType;
  pricePerNight: number;
  status: RoomStatus;
  images: string[]; // URLs (bundled assets or object URLs)
  floor?: number;
  notes?: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  vipLevel: "None" | "Silver" | "Gold" | "Platinum";
  tags: string[];
};

export type Booking = {
  id: string;
  customerId: string;
  roomId: string;
  roomType: RoomType;
  checkIn: string; // ISO
  checkOut: string; // ISO
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  total: number;
  createdAt: string; // ISO
  notes?: string;
};

export type Transaction = {
  id: string;
  bookingId: string;
  amount: number;
  method: "card" | "cash" | "online";
  status: PaymentStatus;
  createdAt: string;
};

export type Review = {
  id: string;
  customerId: string;
  bookingId: string;
  rating: number; // 1..5
  comment: string;
  createdAt: string;
  visible: boolean;
};

export type StaffRole = "Super Admin" | "Manager" | "Staff";

export type Staff = {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  active: boolean;
};

export type Promo = {
  id: string;
  code: string;
  description: string;
  discountPercent: number;
  active: boolean;
  startsAt?: string;
  endsAt?: string;
};

export type CmsContent = {
  heroTitle: string;
  heroSubtitle: string;
  roomsIntro: string;
  servicesIntro: string;
  galleryIntro: string;
};

export type HotelSettings = {
  hotelName: string;
  address: string;
  phone: string;
  email: string;
  bookingPolicy: string;
  paymentConfig: {
    acceptCard: boolean;
    acceptCash: boolean;
    acceptOnline: boolean;
  };
  notifications: {
    email: boolean;
    sms: boolean;
    inApp: boolean;
  };
};

export type HotelData = {
  rooms: Room[];
  customers: Customer[];
  bookings: Booking[];
  transactions: Transaction[];
  reviews: Review[];
  staff: Staff[];
  promos: Promo[];
  cms: CmsContent;
  settings: HotelSettings;
};
