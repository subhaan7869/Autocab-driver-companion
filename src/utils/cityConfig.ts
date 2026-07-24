import { Zone, BidJob, Booking } from '../types';

export interface Point {
  x: number;
  y: number;
  name: string;
}

export interface CityData {
  cityName: string;
  fleetName: string;
  center: { lat: number; lng: number };
  zones: Zone[];
  landmarks: Record<string, Point & { lat: number; lng: number }>;
  roads: string[][];
  bids: BidJob[];
  presetBookings: Omit<Booking, 'id'>[];
}

export const CITIES: Record<string, CityData> = {
  YORK: {
    cityName: 'York',
    fleetName: 'Autocab York & District',
    center: { lat: 53.9579, lng: -1.0929 },
    zones: [
      { id: '38', name: 'YORK HOSPITAL', carsInZone: 15, activeBookings: 0, driverPosition: 1 },
      { id: '39', name: 'YORK CITY CENTRE', carsInZone: 22, activeBookings: 0 },
      { id: '50', name: 'LEEDS T/STATION', carsInZone: 18, activeBookings: 0 },
      { id: '16', name: 'THIRSK', carsInZone: 4, activeBookings: 0 },
      { id: '17', name: 'KIRBY MOORSIDE', carsInZone: 2, activeBookings: 0 },
      { id: '24', name: 'PICKERING', carsInZone: 5, activeBookings: 0 },
      { id: '25', name: 'TERRINGTON (YORK)', carsInZone: 1, activeBookings: 0 },
      { id: '28', name: 'BOROUGHBRIDGE', carsInZone: 3, activeBookings: 0 },
      { id: '26', name: 'HARROGATE', carsInZone: 9, activeBookings: 1 },
      { id: '18', name: 'EASINGWOLD (YORK)', carsInZone: 3, activeBookings: 0 },
      { id: '29', name: 'MALTON (YORK)', carsInZone: 6, activeBookings: 0 },
      { id: '30', name: 'SHERIFF HUTTON (YORK)', carsInZone: 2, activeBookings: 0 },
      { id: '31', name: 'LINTON ON OUSE (YORK)', carsInZone: 1, activeBookings: 0 },
      { id: '32', name: 'GREEN HAMMERTON (YORK)', carsInZone: 2, activeBookings: 0 },
      { id: '33', name: 'SCARBOROUGH', carsInZone: 7, activeBookings: 0 },
      { id: '34', name: 'HAXBY (YORK)', carsInZone: 4, activeBookings: 0 },
      { id: '0', name: 'NATIONAL NORTH', carsInZone: 1, activeBookings: 0 },
    ],
    landmarks: {
      'YORK HOSPITAL': { x: 400, y: 150, name: 'YORK HOSPITAL', lat: 53.9682, lng: -1.0772 },
      'YORK CITY CENTRE': { x: 420, y: 350, name: 'YORK CITY CENTRE', lat: 53.9579, lng: -1.0929 },
      'LEEDS T/STATION': { x: 180, y: 520, name: 'LEEDS T/STATION', lat: 53.7972, lng: -1.5458 },
      'THIRSK': { x: 250, y: 100, name: 'THIRSK', lat: 54.2307, lng: -1.3431 },
      'KIRBY MOORSIDE': { x: 500, y: 80, name: 'KIRBY MOORSIDE', lat: 54.2691, lng: -0.9298 },
      'PICKERING': { x: 620, y: 120, name: 'PICKERING', lat: 54.2442, lng: -0.7761 },
      'HARROGATE': { x: 150, y: 380, name: 'HARROGATE', lat: 53.9911, lng: -1.5398 },
      'MALTON (YORK)': { x: 680, y: 220, name: 'MALTON (YORK)', lat: 54.1357, lng: -0.7963 },
      'HAXBY (YORK)': { x: 500, y: 200, name: 'HAXBY (YORK)', lat: 53.9984, lng: -1.0722 },
      'NATIONAL NORTH': { x: 380, y: 50, name: 'NATIONAL NORTH', lat: 54.1000, lng: -1.1000 },
      'ARGOS': { x: 550, y: 400, name: 'ARGOS', lat: 53.9575, lng: -1.0667 },
    },
    roads: [
      ['THIRSK', 'NATIONAL NORTH'],
      ['NATIONAL NORTH', 'YORK HOSPITAL'],
      ['YORK HOSPITAL', 'YORK CITY CENTRE'],
      ['YORK CITY CENTRE', 'LEEDS T/STATION'],
      ['YORK CITY CENTRE', 'ARGOS'],
      ['YORK HOSPITAL', 'HAXBY (YORK)'],
      ['HAXBY (YORK)', 'PICKERING'],
      ['PICKERING', 'KIRBY MOORSIDE'],
      ['KIRBY MOORSIDE', 'MALTON (YORK)'],
      ['MALTON (YORK)', 'ARGOS'],
      ['HARROGATE', 'LEEDS T/STATION'],
      ['HARROGATE', 'YORK CITY CENTRE'],
    ],
    bids: [
      {
        id: 'bid-101',
        pickupTime: '14:30',
        pickupName: 'YORK HOSPITAL',
        destinationName: 'YORK CITY CENTRE',
        fareAmount: 7.50,
        distance: 2.3,
        vehicleType: 'Standard Saloon',
        status: 'PENDING'
      },
      {
        id: 'bid-102',
        pickupTime: '15:15',
        pickupName: 'HARROGATE',
        destinationName: 'YORK HOSPITAL',
        fareAmount: 38.20,
        distance: 21.4,
        vehicleType: 'Executive Estate',
        status: 'PENDING'
      },
      {
        id: 'bid-103',
        pickupTime: '16:00',
        pickupName: 'THIRSK',
        destinationName: 'LEEDS T/STATION',
        fareAmount: 52.00,
        distance: 38.6,
        vehicleType: 'Wheelchair MPV',
        status: 'PENDING'
      }
    ],
    presetBookings: [
      {
        passengerName: 'Dale',
        phone: '+44 7911 123456',
        pickup: { lat: 53.9682, lng: -1.0772, name: 'YORK HOSPITAL' },
        destination: { lat: 53.9579, lng: -1.0929, name: 'YORK CITY CENTRE' },
        fareType: 'CASH',
        fareAmount: 5.00,
        distance: 2.1,
        estimatedDuration: 8,
        specialNotes: 'Cash booking. Passenger is at Main Entrance reception.'
      },
      {
        passengerName: 'John Doe',
        phone: '+44 7822 654321',
        pickup: { lat: 53.7972, lng: -1.5458, name: 'LEEDS T/STATION' },
        destination: { lat: 53.9575, lng: -1.0667, name: 'ARGOS' },
        fareType: 'CASH',
        fareAmount: 45.26,
        distance: 24.2,
        estimatedDuration: 35,
        specialNotes: 'Account booking. Customer has heavy baggage.'
      },
      {
        passengerName: 'Sarah Jenkins',
        phone: '+44 7566 987654',
        pickup: { lat: 54.2307, lng: -1.3431, name: 'THIRSK' },
        destination: { lat: 53.9579, lng: -1.0929, name: 'YORK CITY CENTRE' },
        fareType: 'CARD',
        fareAmount: 32.50,
        distance: 23.1,
        estimatedDuration: 28,
        specialNotes: 'In-app Card pre-paid. Ulez compliant hybrid car.'
      }
    ]
  },
  MANCHESTER: {
    cityName: 'Manchester',
    fleetName: 'Autocab Greater Manchester',
    center: { lat: 53.4808, lng: -2.2426 },
    zones: [
      { id: '101', name: 'PICCADILLY STATION', carsInZone: 28, activeBookings: 1, driverPosition: 1 },
      { id: '102', name: 'MANCHESTER AIRPORT', carsInZone: 45, activeBookings: 3 },
      { id: '103', name: 'SPINNINGFIELDS', carsInZone: 18, activeBookings: 0 },
      { id: '104', name: 'DEANSGATE', carsInZone: 12, activeBookings: 0 },
      { id: '105', name: 'SALFORD QUAYS', carsInZone: 10, activeBookings: 0 },
      { id: '106', name: 'OLD TRAFFORD', carsInZone: 15, activeBookings: 0 },
      { id: '107', name: 'ETIHAD STADIUM', carsInZone: 8, activeBookings: 0 },
      { id: '108', name: 'ARNDALE CENTRE', carsInZone: 20, activeBookings: 1 },
      { id: '109', name: 'FALLOWFIELD', carsInZone: 14, activeBookings: 0 },
      { id: '110', name: 'DIDSBURY', carsInZone: 9, activeBookings: 0 },
    ],
    landmarks: {
      'PICCADILLY STATION': { x: 450, y: 350, name: 'PICCADILLY STATION', lat: 53.4774, lng: -2.2309 },
      'MANCHESTER AIRPORT': { x: 200, y: 550, name: 'MANCHESTER AIRPORT', lat: 53.3588, lng: -2.2727 },
      'SPINNINGFIELDS': { x: 320, y: 330, name: 'SPINNINGFIELDS', lat: 53.4801, lng: -2.2512 },
      'DEANSGATE': { x: 350, y: 250, name: 'DEANSGATE', lat: 53.4839, lng: -2.2452 },
      'SALFORD QUAYS': { x: 150, y: 380, name: 'SALFORD QUAYS', lat: 53.4722, lng: -2.2861 },
      'OLD TRAFFORD': { x: 180, y: 460, name: 'OLD TRAFFORD', lat: 53.4631, lng: -2.2913 },
      'ETIHAD STADIUM': { x: 650, y: 280, name: 'ETIHAD STADIUM', lat: 53.4831, lng: -2.2003 },
      'ARNDALE CENTRE': { x: 420, y: 180, name: 'ARNDALE CENTRE', lat: 53.4848, lng: -2.2423 },
      'FALLOWFIELD': { x: 500, y: 480, name: 'FALLOWFIELD', lat: 53.4442, lng: -2.2212 },
      'DIDSBURY': { x: 480, y: 580, name: 'DIDSBURY', lat: 53.4167, lng: -2.2281 },
    },
    roads: [
      ['DEANSGATE', 'ARNDALE CENTRE'],
      ['ARNDALE CENTRE', 'PICCADILLY STATION'],
      ['SPINNINGFIELDS', 'DEANSGATE'],
      ['SPINNINGFIELDS', 'SALFORD QUAYS'],
      ['SALFORD QUAYS', 'OLD TRAFFORD'],
      ['OLD TRAFFORD', 'MANCHESTER AIRPORT'],
      ['PICCADILLY STATION', 'ETIHAD STADIUM'],
      ['PICCADILLY STATION', 'FALLOWFIELD'],
      ['FALLOWFIELD', 'DIDSBURY'],
      ['DIDSBURY', 'MANCHESTER AIRPORT'],
    ],
    bids: [
      {
        id: 'bid-m01',
        pickupTime: '15:10',
        pickupName: 'MANCHESTER AIRPORT',
        destinationName: 'SPINNINGFIELDS',
        fareAmount: 26.50,
        distance: 10.2,
        vehicleType: 'Standard Saloon',
        status: 'PENDING'
      },
      {
        id: 'bid-m02',
        pickupTime: '16:15',
        pickupName: 'PICCADILLY STATION',
        destinationName: 'OLD TRAFFORD',
        fareAmount: 9.80,
        distance: 3.4,
        vehicleType: 'Executive Estate',
        status: 'PENDING'
      }
    ],
    presetBookings: [
      {
        passengerName: 'Marcus',
        phone: '+44 7123 999111',
        pickup: { lat: 53.4774, lng: -2.2309, name: 'PICCADILLY STATION' },
        destination: { lat: 53.3588, lng: -2.2727, name: 'MANCHESTER AIRPORT' },
        fareType: 'CARD',
        fareAmount: 22.00,
        distance: 9.8,
        estimatedDuration: 18,
        specialNotes: 'Prepaid corporate run. T2 drop-off.'
      },
      {
        passengerName: 'Emma Watson',
        phone: '+44 7345 888222',
        pickup: { lat: 53.4801, lng: -2.2512, name: 'SPINNINGFIELDS' },
        destination: { lat: 53.4722, lng: -2.2861, name: 'SALFORD QUAYS' },
        fareType: 'CASH',
        fareAmount: 8.50,
        distance: 2.9,
        estimatedDuration: 8,
        specialNotes: 'Cash booking. Passenger outside Starbucks.'
      }
    ]
  },
  LEEDS: {
    cityName: 'Leeds',
    fleetName: 'Autocab Leeds & West Yorks',
    center: { lat: 53.8008, lng: -1.5491 },
    zones: [
      { id: '201', name: 'LEEDS STATION', carsInZone: 20, activeBookings: 1, driverPosition: 1 },
      { id: '202', name: 'TRINITY LEEDS', carsInZone: 16, activeBookings: 0 },
      { id: '203', name: 'HEADINGLEY', carsInZone: 11, activeBookings: 0 },
      { id: '204', name: 'ROUNDHAY PARK', carsInZone: 5, activeBookings: 0 },
      { id: '205', name: 'BEESTON', carsInZone: 13, activeBookings: 0 },
      { id: '206', name: 'ST JAMES HOSPITAL', carsInZone: 14, activeBookings: 0 },
      { id: '207', name: 'HAREHILLS', carsInZone: 12, activeBookings: 0 },
      { id: '208', name: 'CHAPEL ALLERTON', carsInZone: 7, activeBookings: 0 },
      { id: '209', name: 'MORLEY', carsInZone: 8, activeBookings: 0 },
      { id: '210', name: 'HORSFORTH', carsInZone: 6, activeBookings: 0 },
    ],
    landmarks: {
      'LEEDS STATION': { x: 380, y: 350, name: 'LEEDS STATION', lat: 53.7958, lng: -1.5476 },
      'TRINITY LEEDS': { x: 420, y: 300, name: 'TRINITY LEEDS', lat: 53.7972, lng: -1.5441 },
      'HEADINGLEY': { x: 250, y: 180, name: 'HEADINGLEY', lat: 53.8197, lng: -1.5794 },
      'ROUNDHAY PARK': { x: 620, y: 120, name: 'ROUNDHAY PARK', lat: 53.8378, lng: -1.5034 },
      'BEESTON': { x: 300, y: 520, name: 'BEESTON', lat: 53.7725, lng: -1.5582 },
      'ST JAMES HOSPITAL': { x: 550, y: 250, name: 'ST JAMES HOSPITAL', lat: 53.8078, lng: -1.5192 },
      'HAREHILLS': { x: 580, y: 180, name: 'HAREHILLS', lat: 53.8114, lng: -1.5122 },
      'CHAPEL ALLERTON': { x: 450, y: 100, name: 'CHAPEL ALLERTON', lat: 53.8291, lng: -1.5414 },
      'MORLEY': { x: 150, y: 580, name: 'MORLEY', lat: 53.7491, lng: -1.6031 },
      'HORSFORTH': { x: 120, y: 150, name: 'HORSFORTH', lat: 53.8398, lng: -1.6412 },
    },
    roads: [
      ['HORSFORTH', 'HEADINGLEY'],
      ['HEADINGLEY', 'LEEDS STATION'],
      ['LEEDS STATION', 'TRINITY LEEDS'],
      ['LEEDS STATION', 'BEESTON'],
      ['BEESTON', 'MORLEY'],
      ['TRINITY LEEDS', 'ST JAMES HOSPITAL'],
      ['ST JAMES HOSPITAL', 'HAREHILLS'],
      ['HAREHILLS', 'ROUNDHAY PARK'],
      ['CHAPEL ALLERTON', 'ROUNDHAY PARK'],
      ['HEADINGLEY', 'CHAPEL ALLERTON'],
    ],
    bids: [
      {
        id: 'bid-l01',
        pickupTime: '15:30',
        pickupName: 'ST JAMES HOSPITAL',
        destinationName: 'HORSFORTH',
        fareAmount: 14.50,
        distance: 6.8,
        vehicleType: 'Standard Saloon',
        status: 'PENDING'
      }
    ],
    presetBookings: [
      {
        passengerName: 'Liam',
        phone: '+44 7999 222111',
        pickup: { lat: 53.7958, lng: -1.5476, name: 'LEEDS STATION' },
        destination: { lat: 53.8197, lng: -1.5794, name: 'HEADINGLEY' },
        fareType: 'CASH',
        fareAmount: 7.20,
        distance: 3.1,
        estimatedDuration: 9,
        specialNotes: 'Cash booking. Student block dropoff.'
      }
    ]
  },
  LONDON: {
    cityName: 'London',
    fleetName: 'Autocab London Capital',
    center: { lat: 51.5074, lng: -0.1278 },
    zones: [
      { id: '301', name: 'HEATHROW AIRPORT', carsInZone: 65, activeBookings: 8, driverPosition: 1 },
      { id: '302', name: 'ST PANCRAS INTL', carsInZone: 32, activeBookings: 2 },
      { id: '303', name: 'COVENT GARDEN', carsInZone: 25, activeBookings: 1 },
      { id: '304', name: 'SOHO', carsInZone: 28, activeBookings: 2 },
      { id: '305', name: 'WESTMINSTER', carsInZone: 22, activeBookings: 0 },
      { id: '306', name: 'TOWER BRIDGE', carsInZone: 18, activeBookings: 1 },
      { id: '307', name: 'CAMDEN MARKET', carsInZone: 15, activeBookings: 0 },
      { id: '308', name: 'SHOREDITCH', carsInZone: 24, activeBookings: 2 },
      { id: '309', name: 'GREENWICH', carsInZone: 12, activeBookings: 0 },
      { id: '310', name: 'BRIXTON', carsInZone: 14, activeBookings: 0 },
    ],
    landmarks: {
      'HEATHROW AIRPORT': { x: 120, y: 550, name: 'HEATHROW AIRPORT', lat: 51.4700, lng: -0.4543 },
      'ST PANCRAS INTL': { x: 420, y: 120, name: 'ST PANCRAS INTL', lat: 51.5300, lng: -0.1253 },
      'COVENT GARDEN': { x: 400, y: 240, name: 'COVENT GARDEN', lat: 51.5117, lng: -0.1240 },
      'SOHO': { x: 320, y: 220, name: 'SOHO', lat: 51.5136, lng: -0.1365 },
      'WESTMINSTER': { x: 350, y: 350, name: 'WESTMINSTER', lat: 51.4996, lng: -0.1248 },
      'TOWER BRIDGE': { x: 580, y: 340, name: 'TOWER BRIDGE', lat: 51.5055, lng: -0.0754 },
      'CAMDEN MARKET': { x: 310, y: 80, name: 'CAMDEN MARKET', lat: 51.5415, lng: -0.1425 },
      'SHOREDITCH': { x: 550, y: 160, name: 'SHOREDITCH', lat: 51.5229, lng: -0.0778 },
      'GREENWICH': { x: 700, y: 450, name: 'GREENWICH', lat: 51.4874, lng: 0.0031 },
      'BRIXTON': { x: 380, y: 520, name: 'BRIXTON', lat: 51.4619, lng: -0.1158 },
    },
    roads: [
      ['HEATHROW AIRPORT', 'SOHO'],
      ['CAMDEN MARKET', 'ST PANCRAS INTL'],
      ['ST PANCRAS INTL', 'COVENT GARDEN'],
      ['SOHO', 'COVENT GARDEN'],
      ['COVENT GARDEN', 'WESTMINSTER'],
      ['WESTMINSTER', 'BRIXTON'],
      ['COVENT GARDEN', 'SHOREDITCH'],
      ['SHOREDITCH', 'TOWER BRIDGE'],
      ['TOWER BRIDGE', 'GREENWICH'],
    ],
    bids: [
      {
        id: 'bid-lon01',
        pickupTime: '16:30',
        pickupName: 'HEATHROW AIRPORT',
        destinationName: 'ST PANCRAS INTL',
        fareAmount: 75.00,
        distance: 18.5,
        vehicleType: 'Executive Estate',
        status: 'PENDING'
      }
    ],
    presetBookings: [
      {
        passengerName: 'Harry',
        phone: '+44 7771 555666',
        pickup: { lat: 51.5300, lng: -0.1253, name: 'ST PANCRAS INTL' },
        destination: { lat: 51.4996, lng: -0.1248, name: 'WESTMINSTER' },
        fareType: 'CARD',
        fareAmount: 16.50,
        distance: 4.2,
        estimatedDuration: 15,
        specialNotes: 'Prepaid card run. Passenger has name board.'
      }
    ]
  },
  BIRMINGHAM: {
    cityName: 'Birmingham',
    fleetName: 'Autocab West Midlands',
    center: { lat: 52.4862, lng: -1.8904 },
    zones: [
      { id: '401', name: 'NEW STREET STATION', carsInZone: 30, activeBookings: 2, driverPosition: 1 },
      { id: '402', name: 'BIRMINGHAM AIRPORT', carsInZone: 40, activeBookings: 4 },
      { id: '403', name: 'BULLRING', carsInZone: 22, activeBookings: 1 },
      { id: '404', name: 'EDGBASTON', carsInZone: 15, activeBookings: 0 },
      { id: '405', name: 'SOLIHULL', carsInZone: 12, activeBookings: 0 },
      { id: '406', name: 'DIGBETH', carsInZone: 14, activeBookings: 0 },
      { id: '407', name: 'JEWELLERY QUARTER', carsInZone: 16, activeBookings: 0 },
      { id: '408', name: 'SUTTON COLDFIELD', carsInZone: 8, activeBookings: 0 },
      { id: '409', name: 'ASTON', carsInZone: 10, activeBookings: 0 },
      { id: '410', name: 'BOURNVILLE', carsInZone: 9, activeBookings: 0 },
    ],
    landmarks: {
      'NEW STREET STATION': { x: 380, y: 320, name: 'NEW STREET STATION', lat: 52.4778, lng: -1.8988 },
      'BIRMINGHAM AIRPORT': { x: 680, y: 480, name: 'BIRMINGHAM AIRPORT', lat: 52.4539, lng: -1.7481 },
      'BULLRING': { x: 440, y: 340, name: 'BULLRING', lat: 52.4773, lng: -1.8944 },
      'EDGBASTON': { x: 240, y: 420, name: 'EDGBASTON', lat: 52.4632, lng: -1.9213 },
      'SOLIHULL': { x: 650, y: 580, name: 'SOLIHULL', lat: 52.4128, lng: -1.7781 },
      'DIGBETH': { x: 500, y: 380, name: 'DIGBETH', lat: 52.4751, lng: -1.8842 },
      'JEWELLERY QUARTER': { x: 280, y: 220, name: 'JEWELLERY QUARTER', lat: 52.4862, lng: -1.9123 },
      'SUTTON COLDFIELD': { x: 550, y: 80, name: 'SUTTON COLDFIELD', lat: 52.5631, lng: -1.8228 },
      'ASTON': { x: 460, y: 160, name: 'ASTON', lat: 52.5031, lng: -1.8823 },
      'BOURNVILLE': { x: 180, y: 550, name: 'BOURNVILLE', lat: 52.4298, lng: -1.9352 },
    },
    roads: [
      ['JEWELLERY QUARTER', 'NEW STREET STATION'],
      ['NEW STREET STATION', 'BULLRING'],
      ['NEW STREET STATION', 'EDGBASTON'],
      ['BULLRING', 'DIGBETH'],
      ['EDGBASTON', 'BOURNVILLE'],
      ['DIGBETH', 'BIRMINGHAM AIRPORT'],
      ['BIRMINGHAM AIRPORT', 'SOLIHULL'],
      ['ASTON', 'NEW STREET STATION'],
      ['ASTON', 'SUTTON COLDFIELD'],
    ],
    bids: [
      {
        id: 'bid-b01',
        pickupTime: '15:45',
        pickupName: 'JEWELLERY QUARTER',
        destinationName: 'BIRMINGHAM AIRPORT',
        fareAmount: 28.50,
        distance: 12.4,
        vehicleType: 'Standard Saloon',
        status: 'PENDING'
      }
    ],
    presetBookings: [
      {
        passengerName: 'Tom',
        phone: '+44 7888 333444',
        pickup: { lat: 52.4778, lng: -1.8988, name: 'NEW STREET STATION' },
        destination: { lat: 52.4539, lng: -1.7481, name: 'BIRMINGHAM AIRPORT' },
        fareType: 'CARD',
        fareAmount: 24.50,
        distance: 11.2,
        estimatedDuration: 22,
        specialNotes: 'Flight departure. Express terminal drop.'
      }
    ]
  }
};

// Calculate physical distance between two GPS coordinates in miles
export function calculateGpsDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8; // Radius of the Earth in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Find closest city based on physical coordinates
export function findClosestCity(lat: number, lng: number): string {
  let closestCity = 'YORK';
  let minDistance = Infinity;

  Object.entries(CITIES).forEach(([key, city]) => {
    const dist = calculateGpsDistance(lat, lng, city.center.lat, city.center.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closestCity = key;
    }
  });

  return closestCity;
}
