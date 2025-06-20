interface GitHubStats {
  username: string;
  publicRepos: number;
  followers: number;
  following: number;
  totalStars: number;
  topLanguages: { [key: string]: number };
  recentRepos: Array<{
    name: string;
    description: string;
    stars: number;
    language: string;
    url: string;
  }>;
}

export const fetchGitHubData = async (githubUrl: string): Promise<GitHubStats> => {
  try {
    // Extract username from GitHub URL
    const username = githubUrl.split('github.com/')[1]?.split('/')[0];
    if (!username) {
      throw new Error('Invalid GitHub URL');
    }

    // Fetch user data
    const userResponse = await fetch(`https://api.github.com/users/${username}`);
    const userData = await userResponse.json();

    // Fetch user's repositories
    const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`);
    const reposData = await reposResponse.json();

    // Calculate total stars and top languages
    const totalStars = reposData.reduce((acc: number, repo: any) => acc + repo.stargazers_count, 0);
    const languages: { [key: string]: number } = {};
    
    reposData.forEach((repo: any) => {
      if (repo.language) {
        languages[repo.language] = (languages[repo.language] || 0) + 1;
      }
    });

    // Sort languages by frequency
    const topLanguages = Object.entries(languages)
      .sort(([, a], [, b]) => b - a)
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

    // Get recent repositories with details
    const recentRepos = reposData
      .slice(0, 5)
      .map((repo: any) => ({
        name: repo.name,
        description: repo.description,
        stars: repo.stargazers_count,
        language: repo.language,
        url: repo.html_url,
      }));

    return {
      username,
      publicRepos: userData.public_repos,
      followers: userData.followers,
      following: userData.following,
      totalStars,
      topLanguages,
      recentRepos,
    };
  } catch (error) {
    console.error('Error fetching GitHub data:', error);
    throw error;
  }
}; 