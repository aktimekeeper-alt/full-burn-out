export interface User {
  id: string;
  username: string;
  bio: string;
  profilePhoto: string;
  vehicles: string[]; // vehicle IDs
  createdAt: Date;
}

export interface MaintenanceLog {
  id: string;
  type: string;
  date: string;
  mileage: number;
  notes: string;
}

export interface Mod {
  id: string;
  name: string;
  date: string;
  cost: number;
}

export interface Vehicle {
  id: string;
  ownerId: string;
  make: string;
  model: string;
  year: number;
  color: string;
  mods: Mod[];
  photos: string[];
  maintenanceLogs: MaintenanceLog[];
  createdAt: Date;
}

export interface Comment {
  id: string;
  authorId: string;
  authorUsername: string;
  text: string;
  createdAt: Date;
}

export interface Post {
  id: string;
  authorId: string;
  authorUsername: string;
  authorPhoto: string;
  content: string;
  photos: string[];
  likes: string[]; // user IDs
  comments: Comment[];
  createdAt: Date;
}

export interface AttendeeLocation {
  userId: string;
  lat: number;
  lng: number;
  updatedAt: Date;
}

export interface Meet {
  id: string;
  title: string;
  description: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  date: string;
  hostId: string;
  attendees: string[]; // user IDs
  isActive: boolean;
  createdAt: Date;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderUsername: string;
  text: string;
  createdAt: Date;
}

export interface Chat {
  id: string;
  name: string;
  members: string[]; // user IDs
  isGroup: boolean;
  lastMessage: string;
  lastMessageTime: Date | null;
  createdAt: Date;
}
