import axios, { AxiosInstance } from 'axios';
import {
  FigmaFile,
  FigmaTeamProjects,
  FigmaProjectFiles,
  FigmaComment,
  FigmaUser,
  FigmaExportSettings
} from './types.js';

export class FigmaClient {
  private client: AxiosInstance;

  constructor(accessToken: string) {
    this.client = axios.create({
      baseURL: 'https://api.figma.com/v1',
      headers: {
        'X-Figma-Token': accessToken,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Get file information
   */
  async getFile(fileKey: string): Promise<FigmaFile> {
    const response = await this.client.get(`/files/${fileKey}`);
    return response.data;
  }

  /**
   * Get file nodes by IDs
   */
  async getFileNodes(fileKey: string, nodeIds: string[]) {
    const ids = nodeIds.join(',');
    const response = await this.client.get(`/files/${fileKey}/nodes?ids=${ids}`);
    return response.data;
  }

  /**
   * Get images from file nodes
   */
  async getImages(fileKey: string, nodeIds: string[], settings?: FigmaExportSettings) {
    const ids = nodeIds.join(',');
    let url = `/images/${fileKey}?ids=${ids}`;
    
    if (settings) {
      if (settings.format) url += `&format=${settings.format}`;
      if (settings.constraint) {
        url += `&constraint=${settings.constraint.type}&scale=${settings.constraint.value}`;
      }
    }
    
    const response = await this.client.get(url);
    return response.data;
  }

  /**
   * Get team projects
   */
  async getTeamProjects(teamId: string): Promise<FigmaTeamProjects> {
    const response = await this.client.get(`/teams/${teamId}/projects`);
    return response.data;
  }

  /**
   * Get project files
   */
  async getProjectFiles(projectId: string): Promise<FigmaProjectFiles> {
    const response = await this.client.get(`/projects/${projectId}/files`);
    return response.data;
  }

  /**
   * Get comments on a file
   */
  async getComments(fileKey: string): Promise<{ comments: FigmaComment[] }> {
    const response = await this.client.get(`/files/${fileKey}/comments`);
    return response.data;
  }

  /**
   * Post a comment on a file
   */
  async postComment(fileKey: string, message: string, clientMeta: { x: number; y: number }) {
    const response = await this.client.post(`/files/${fileKey}/comments`, {
      message,
      client_meta: clientMeta
    });
    return response.data;
  }

  /**
   * Get current user information
   */
  async getMe(): Promise<FigmaUser> {
    const response = await this.client.get('/me');
    return response.data;
  }

  /**
   * Get version history of a file
   */
  async getVersions(fileKey: string) {
    const response = await this.client.get(`/files/${fileKey}/versions`);
    return response.data;
  }

  /**
   * Get components from a team library
   */
  async getTeamComponents(teamId: string) {
    const response = await this.client.get(`/teams/${teamId}/components`);
    return response.data;
  }

  /**
   * Get styles from a team library
   */
  async getTeamStyles(teamId: string) {
    const response = await this.client.get(`/teams/${teamId}/styles`);
    return response.data;
  }
}