export interface Project {
  _id: string;
  user: {
    _id: string;
    name: string;
    profilePicture?: string;
    bio?: string;
  };
  title: string;
  description: string;
  githubUrl: string;
  projectUrl?: string;
  technologies: string[];
  status: 'in-progress' | 'completed' | 'on-hold';
  isPublic: boolean;
  likes: string[];
  likeCount: number;
  comments: Comment[];
  commentCount: number;
  collaborators: string[];
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  // Team functionality
  teamRequests: TeamRequest[];
  teamMembers: TeamMember[];
  teamSettings: TeamSettings;
  pendingTeamRequestsCount: number;
  teamMemberCount: number;
}

export interface Comment {
  _id: string;
  user: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  content: string;
  createdAt: string;
}

export interface TeamRequest {
  _id: string;
  user: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  skills: string[];
  createdAt: string;
}

export interface TeamMember {
  _id: string;
  user: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
  skills: string[];
}

export interface TeamSettings {
  allowTeamRequests: boolean;
  maxTeamSize: number;
  requiredSkills: string[];
}

export interface CreateProjectData {
  title: string;
  description: string;
  githubUrl: string;
  projectUrl?: string;
  technologies: string[];
  status: 'in-progress' | 'completed' | 'on-hold';
  isPublic?: boolean;
  allowTeamRequests?: boolean;
  maxTeamSize?: number;
}

export interface UpdateProjectData extends Partial<CreateProjectData> {}

export interface TeamRequestData {
  message?: string;
  skills: string[];
} 