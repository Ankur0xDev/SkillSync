export interface User {
  _id: string;
  username: string;
  email: string;
  name?: string;
  profilePicture?: string;
  backgroundPicture?: string;
  bio?: string;
  location?: string;
  country?: string;
  city?: string;
  website?: string;
  githubUrl?: string;
  linkedin?: string;
  skills?: string[];
  interests?: string[];
  languages?: string[];
  experience?: string;
  availability?: string;
  lookingFor?: string[];
  profileViews?: number;
  connections?: any[];
  createdAt: string;
  updatedAt: string;
  github?: string;
} 