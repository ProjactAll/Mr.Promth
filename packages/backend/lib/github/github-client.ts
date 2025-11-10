/**
 * GitHub API Client
 * Handles GitHub repository operations
 */

export interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
}

export interface CommitOptions {
  message: string;
  branch?: string;
  files: Array<{
    path: string;
    content: string;
  }>;
}

export class GitHubClient {
  private config: GitHubConfig;
  private baseUrl = 'https://api.github.com';

  constructor(config: GitHubConfig) {
    this.config = config;
  }

  /**
   * Create or update a file in the repository
   */
  async createOrUpdateFile(
    path: string,
    content: string,
    message: string,
    branch: string = 'main'
  ): Promise<any> {
    // Get current file SHA if it exists
    const currentFile = await this.getFile(path, branch).catch(() => null);
    
    const url = `${this.baseUrl}/repos/${this.config.owner}/${this.config.repo}/contents/${path}`;
    
    const body: any = {
      message,
      content: Buffer.from(content).toString('base64'),
      branch,
    };

    if (currentFile) {
      body.sha = currentFile.sha;
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.config.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create/update file: ${error}`);
    }

    return response.json();
  }

  /**
   * Get file content from repository
   */
  async getFile(path: string, branch: string = 'main'): Promise<any> {
    const url = `${this.baseUrl}/repos/${this.config.owner}/${this.config.repo}/contents/${path}?ref=${branch}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.config.token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error(`File not found: ${path}`);
    }

    return response.json();
  }

  /**
   * Create a commit with multiple files
   */
  async createCommit(options: CommitOptions): Promise<any> {
    const { message, branch = 'main', files } = options;

    // Get the current commit SHA
    const refUrl = `${this.baseUrl}/repos/${this.config.owner}/${this.config.repo}/git/refs/heads/${branch}`;
    const refResponse = await fetch(refUrl, {
      headers: {
        'Authorization': `Bearer ${this.config.token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!refResponse.ok) {
      throw new Error('Failed to get branch reference');
    }

    const refData = await refResponse.json();
    const currentCommitSha = refData.object.sha;

    // Get the current commit
    const commitUrl = `${this.baseUrl}/repos/${this.config.owner}/${this.config.repo}/git/commits/${currentCommitSha}`;
    const commitResponse = await fetch(commitUrl, {
      headers: {
        'Authorization': `Bearer ${this.config.token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!commitResponse.ok) {
      throw new Error('Failed to get current commit');
    }

    const commitData = await commitResponse.json();
    const baseTreeSha = commitData.tree.sha;

    // Create blobs for each file
    const tree = await Promise.all(
      files.map(async (file) => {
        const blobUrl = `${this.baseUrl}/repos/${this.config.owner}/${this.config.repo}/git/blobs`;
        const blobResponse = await fetch(blobUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: file.content,
            encoding: 'utf-8',
          }),
        });

        if (!blobResponse.ok) {
          throw new Error(`Failed to create blob for ${file.path}`);
        }

        const blobData = await blobResponse.json();

        return {
          path: file.path,
          mode: '100644',
          type: 'blob',
          sha: blobData.sha,
        };
      })
    );

    // Create a new tree
    const treeUrl = `${this.baseUrl}/repos/${this.config.owner}/${this.config.repo}/git/trees`;
    const treeResponse = await fetch(treeUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        base_tree: baseTreeSha,
        tree,
      }),
    });

    if (!treeResponse.ok) {
      throw new Error('Failed to create tree');
    }

    const treeData = await treeResponse.json();

    // Create a new commit
    const newCommitUrl = `${this.baseUrl}/repos/${this.config.owner}/${this.config.repo}/git/commits`;
    const newCommitResponse = await fetch(newCommitUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        tree: treeData.sha,
        parents: [currentCommitSha],
      }),
    });

    if (!newCommitResponse.ok) {
      throw new Error('Failed to create commit');
    }

    const newCommitData = await newCommitResponse.json();

    // Update the reference
    const updateRefResponse = await fetch(refUrl, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${this.config.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sha: newCommitData.sha,
      }),
    });

    if (!updateRefResponse.ok) {
      throw new Error('Failed to update reference');
    }

    return newCommitData;
  }

  /**
   * Create a new repository
   */
  async createRepository(name: string, description: string, isPrivate: boolean = false): Promise<any> {
    const url = `${this.baseUrl}/user/repos`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        description,
        private: isPrivate,
        auto_init: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create repository: ${error}`);
    }

    return response.json();
  }

  /**
   * List branches
   */
  async listBranches(): Promise<any[]> {
    const url = `${this.baseUrl}/repos/${this.config.owner}/${this.config.repo}/branches`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.config.token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to list branches');
    }

    return response.json();
  }
}
