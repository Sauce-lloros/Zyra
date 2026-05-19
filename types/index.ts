import { Timestamp } from 'firebase/firestore';

export interface User {
  uid: string;
  username: string;
  email: string;
  bio: string;
  photoURL: string;
  createdAt: Timestamp | Date;
  followersCount?: number;
  followingCount?: number;
}

export interface UserProfileUpdate {
  username?: string;
  bio?: string;
  photoURL?: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  identifier: string;
  password: string;
}

export interface Post {
  id: string;
  content: string;
  imageURLs: string[];
  imageURL?: string;
  authorId: string;
  authorEmail: string;
  createdAt: Timestamp | Date | null;
  editedAt?: Timestamp | Date;
  likes: number;
  likedBy?: string[];
  comments: number;
}

export interface CreatePostData {
  content: string;
  imageURLs?: string[];
}

export interface UpdatePostData {
  content: string;
  imageURLs?: string[];
}

export interface Comment {
  id: string;
  postId: string;
  content: string;
  authorId: string;
  authorEmail: string;
  createdAt: Timestamp | Date | null;
}

export interface Follow {
  uid: string;
  createdAt: Timestamp | Date | null;
}

export type FollowState = 'idle' | 'loading' | 'following' | 'not_following';

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface Chat {
  id: string;
  members: string[];
  memberNames: { [uid: string]: string };
  memberPhotos: { [uid: string]: string };
  lastMessage: string;
  lastMessageAt: Timestamp | Date | null;
  lastMessageBy: string;
  unreadCount: { [uid: string]: number };
}

export interface Message {
  id: string;
  chatId: string;
  text: string;
  senderId: string;
  createdAt: Timestamp | Date | null;
  read: boolean;
}

export interface SendMessageData {
  text: string;
}

export interface Notification {
  id: string;
  recipientId: string;
  senderId: string;
  senderUsername: string;
  senderPhotoURL: string;
  type: 'follow' | 'like' | 'comment';
  postId?: string | null;
  postPreview?: string | null;
  read: boolean;
  createdAt: Timestamp | Date | null;
}