export interface Mod {
  id: string;
  name: string;
  date: string;
  cost: number;
}

export interface MaintenanceLog {
  id: string;
  type: string;
  date: string;
  mileage: number;
  notes: string;
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
}

export interface Comment {
  id: string;
  authorId: string;
  authorUsername: string;
  text: string;
  createdAt: any;
}

export interface Post {
  id: string;
  authorId: string;
  authorUsername: string;
  content: string;
  photos: string[];
  likes: string[];
  comments: Comment[];
  createdAt: any;
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
  attendees: string[];
  isActive: boolean;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderUsername: string;
  text: string;
  createdAt: any;
}

export interface Chat {
  id: string;
  name: string;
  members: string[];
  isGroup: boolean;
  lastMessage: string;
  lastMessageTime: any;
}

export interface User {
  id: string;
  username: string;
  bio: string;
  profilePhoto: string;
  vehicles: string[];
  email: string;
}
