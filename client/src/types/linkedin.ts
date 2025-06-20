export interface LinkedInStats {
  connections: number;
  followers: number;
  experience: number;
  skills: number;
  topSkills: string[];
  recentActivity: {
    title: string;
    date: string;
  }[];
} 