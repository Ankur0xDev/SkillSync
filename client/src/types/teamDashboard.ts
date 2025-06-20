export interface TeamDiscussion {
  _id: string;
  project: string;
  author: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  title: string;
  content: string;
  hashtags: string[];
  attachments: FileAttachment[];
  likes: string[];
  replies: DiscussionReply[];
  isPinned: boolean;
  category: 'general' | 'frontend' | 'backend' | 'design' | 'bug' | 'feature' | 'question';
  createdAt: string;
  updatedAt: string;
}

export interface DiscussionReply {
  _id: string;
  author: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  content: string;
  likes: string[];
  createdAt: string;
}

export interface Task {
  _id: string;
  project: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  createdBy: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  dueDate?: string;
  attachments: FileAttachment[];
  comments: TaskComment[];
  tags: string[];
  estimatedHours?: number;
  actualHours?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskComment {
  _id: string;
  author: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  content: string;
  createdAt: string;
}

export interface FileAttachment {
  filename: string;
  originalName: string;
  url: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
}

export interface CreateDiscussionData {
  title: string;
  content: string;
  category: 'general' | 'frontend' | 'backend' | 'design' | 'bug' | 'feature' | 'question';
  hashtags?: string[];
  attachments?: FileAttachment[];
}

export interface CreateTaskData {
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: string;
  dueDate?: string;
  estimatedHours?: number;
  tags?: string[];
  attachments?: FileAttachment[];
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
  actualHours?: number;
}

export interface DashboardOverview {
  project: any; // Project type from project.ts
  recentDiscussions: TeamDiscussion[];
  recentTasks: Task[];
  taskStats: {
    todo: number;
    inProgress: number;
    review: number;
    done: number;
  };
}

export interface HashtagStats {
  _id: string;
  count: number;
} 