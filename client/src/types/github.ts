export interface GitHubStats {
  publicRepos: number;
  totalStars: number;
  followers: number;
  following: number;
  topLanguages: Record<string, number>;
  recentRepos: Array<{
    name: string;
    description?: string;
    url: string;
    language?: string;
    stars: number;
  }>;
} 