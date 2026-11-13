export type DriverStatus = 'OFFLINE' | 'AVAILABLE' | 'BREAK' | 'BUSY';

export type JobStatus = 'NONE' | 'OFFERED' | 'ACCEPTED' | 'ARRIVED' | 'POB' | 'STC';

export interface Location {
  lat: number;
  lng: number;
  name: string;
}

export interface Booking {
  id: string;
  passengerName: string;
  phone: string;
  pickup: Location;
  destination: Location;
  fareType: 'CASH' | 'CARD' | 'ACCOUNT';
  fareAmount: number;
  distance: number; // in miles
  estimatedDuration: number; // in minutes
  specialNotes?: string;
  offeredAt?: number;
  timeRequested?: string;
  sourceType?: 'PREBOOKING' | 'AUCTION' | 'DIRECT';
}

export interface Zone {
  id: string;
  name: string;
  carsInZone: number;
  activeBookings: number;
  driverPosition?: number;
}

export interface CounterBid {
  driverFare: number;
  notes?: string;
  submittedAt: number;
  status: 'SUBMITTED' | 'CUSTOMER_REVIEWING' | 'ACCEPTED' | 'REJECTED';
}

export interface BidJob {
  id: string;
  passengerName?: string;
  phone?: string;
  pickupTime: string;
  pickupName: string;
  pickupCoords?: { lat: number; lng: number };
  destinationName: string;
  destCoords?: { lat: number; lng: number };
  fareAmount: number;
  distance: number;
  vehicleType: string;
  specialNotes?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'IN_AUCTION' | 'AUCTION_WON';
  counterBid?: CounterBid;
}

export interface AuctionBid {
  id: string;
  driverName: string;
  amount: number;
  etaMinutes: number;
  rating: number;
  vehicle: string;
  isMe?: boolean;
  time: string;
}

export interface AuctionJob {
  id: string;
  customerName: string;
  phone: string;
  pickupTime: string;
  pickupName: string;
  pickupCoords: { lat: number; lng: number };
  destinationName: string;
  destCoords: { lat: number; lng: number };
  baseFare: number;
  maxBudget: number;
  currentHighestBid?: number;
  myBid?: number;
  myBidNote?: string;
  distance: number;
  vehicleType: string;
  isUrgent?: boolean;
  specialNotes?: string;
  status: 'OPEN' | 'BID_PLACED' | 'CUSTOMER_REVIEWING' | 'ACCEPTED' | 'OUTBID' | 'REJECTED' | 'EXPIRED';
  bidExpirySeconds: number;
  competingBids: AuctionBid[];
  createdAt: number;
}

export interface Message {
  id: string;
  sender: 'DISPATCH' | 'DRIVER';
  text: string;
  timestamp: string;
  isRead: boolean;
}

export interface EarningsRecord {
  id: string;
  date: string;
  fareAmount: number;
  fareType: 'CASH' | 'CARD' | 'ACCOUNT';
  pickup: string;
  destination: string;
  jobType?: 'AUCTION' | 'PREBOOKING';
}

export interface DriverProfile {
  id: string;
  name: string;
  badgeNumber: string;
  rating: number;
  vehicleModel: string;
  vehicleReg: string;
  fleetName: string;
  driverPin: string;
  documents: {
    name: string;
    expiryDate: string;
    status: 'VALID' | 'WARNING' | 'EXPIRED';
  }[];
}
