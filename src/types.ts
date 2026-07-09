export type DriverStatus = 'OFFLINE' | 'AVAILABLE' | 'BREAK' | 'GOING_HOME' | 'BUSY';

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
}

export interface Zone {
  id: string;
  name: string;
  carsInZone: number;
  activeBookings: number;
  driverPosition?: number; // undefined if driver is not in this zone
}

export interface BidJob {
  id: string;
  pickupTime: string;
  pickupName: string;
  destinationName: string;
  fareAmount: number;
  distance: number;
  vehicleType: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
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
