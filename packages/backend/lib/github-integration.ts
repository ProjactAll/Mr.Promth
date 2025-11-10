/**
 * GitHub Integration Library
 * สำหรับ Import, Edit, Push files จาก/ไปยัง GitHub
 */

interface GitHubFile {
  path: string;
  content: string;
  sha?: string;
}

export class GitHubIntegration {
  private accessToken: string;
  private owner: string;
  private repo: string;

  constructor(accessToken: string, owner: string, repo: string) {
    this.accessToken = accessToken;
    this.owner = owner;
    this.repo = repo;
  }

  /**
   * Import files from GitHub repository
   */
  async importFiles(path: string = ''): Promise<GitHubFile[]> {
    try {
      const url = `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${path}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch files: ${response.statusText}`);
      }

      const data = await response.json();
      const files: GitHubFile[] = [];

      // Handle directory
      if (Array.isArray(data)) {
        for (const item of data) {
          if (item.type === 'file') {
            const fileContent = await this.getFileContent(item.path);
            files.push({
              path: item.path,
              content: fileContent,
              sha: item.sha
            });
          } else if (item.type === 'dir') {
            // Recursively get files from subdirectory
            const subFiles = await this.importFiles(item.path);
            files.push(...subFiles);
          }
        }
      } else if (data.type === 'file') {
        // Handle single file
        const fileContent = await this.getFileContent(data.path);
        files.push({
          path: data.path,
          content: fileContent,
          sha: data.sha
        });
      }

      return files;
    } catch (error) {
      console.error('Error importing files from GitHub:', error);
      throw error;
    }
  }

  /**
   * Get file content from GitHub
   */
  private async getFileContent(path: string): Promise<string> {
    try {
      const url = `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${path}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/vnd.github.v3.raw'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch file content: ${response.statusText}`);
      }

      return await response.text();
    } catch (error) {
      console.error(`Error getting file content for ${path}:`, error);
      throw error;
    }
  }

  /**
   * Create or update file in GitHub repository
   */
  async pushFile(file: GitHubFile, message: string): Promise<void> {
    try {
      const url = `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${file.path}`;

      // Get current file SHA if it exists
      let sha: string | undefined = file.sha;
      if (!sha) {
        try {
          const response = await fetch(url, {
            headers: {
              'Authorization': `Bearer ${this.accessToken}`,
              'Accept': 'application/vnd.github.v3+json'
            }
          });
          if (response.ok) {
            const data = await response.json();
            sha = data.sha;
          }
        } catch (error) {
          // File doesn't exist, that's okay
        }
      }

      // Create or update file
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message,
          content: Buffer.from(file.content).toString('base64'),
          sha
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to push file: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Error pushing file ${file.path}:`, error);
      throw error;
    }
  }

  /**
   * Push multiple files to GitHub
   */
  async pushFiles(files: GitHubFile[], message: string): Promise<void> {
    try {
      for (const file of files) {
        await this.pushFile(file, message);
      }
    } catch (error) {
      console.error('Error pushing files to GitHub:', error);
      throw error;
    }
  }

  /**
   * Delete file from GitHub repository
   */
  async deleteFile(path: string, sha: string, message: string): Promise<void> {
    try {
      const url = `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${path}`;

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message,
          sha
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to delete file: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Error deleting file ${path}:`, error);
      throw error;
    }
  }

  /**
   * List all files in repository
   */
  async listFiles(path: string = ''): Promise<Array<{ path: string; type: 'file' | 'dir' }>> {
    try {
      const url = `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${path}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to list files: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (Array.isArray(data)) {
        return data.map(item => ({
          path: item.path,
          type: item.type as 'file' | 'dir'
        }));
      }

      return [];
    } catch (error) {
      console.error('Error listing files from GitHub:', error);
      throw error;
    }
  }
}

/**
 * Helper function to create GitHub Integration instance
 */
export async function createGitHubIntegration(
  userId: string,
  repo: string
): Promise<GitHubIntegration | null> {
  try {
    // Get GitHub connection from database
    const response = await fetch('/api/github/connection', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return null;
    }

    const { connection } = await response.json();
    
    if (!connection) {
      return null;
    }

    const [owner, repoName] = repo.split('/');
    
    return new GitHubIntegration(
      connection.access_token,
      owner || connection.github_username,
      repoName || repo
    );
  } catch (error) {
    console.error('Error creating GitHub integration:', error);
    return null;
  }
}
