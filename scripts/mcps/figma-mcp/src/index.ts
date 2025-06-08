#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
import { FigmaClient } from './figma-client.js';

dotenv.config();

const FIGMA_ACCESS_TOKEN = process.env.FIGMA_ACCESS_TOKEN;

if (!FIGMA_ACCESS_TOKEN) {
  console.error('FIGMA_ACCESS_TOKEN environment variable is required');
  process.exit(1);
}

const figmaClient = new FigmaClient(FIGMA_ACCESS_TOKEN);

const server = new Server(
  {
    name: 'figma-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_file',
        description: 'Get Figma file information including document structure',
        inputSchema: {
          type: 'object',
          properties: {
            fileKey: {
              type: 'string',
              description: 'The Figma file key (from the file URL)',
            },
          },
          required: ['fileKey'],
        },
      },
      {
        name: 'get_file_nodes',
        description: 'Get specific nodes from a Figma file',
        inputSchema: {
          type: 'object',
          properties: {
            fileKey: {
              type: 'string',
              description: 'The Figma file key',
            },
            nodeIds: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of node IDs to retrieve',
            },
          },
          required: ['fileKey', 'nodeIds'],
        },
      },
      {
        name: 'export_images',
        description: 'Export images from Figma file nodes',
        inputSchema: {
          type: 'object',
          properties: {
            fileKey: {
              type: 'string',
              description: 'The Figma file key',
            },
            nodeIds: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of node IDs to export',
            },
            format: {
              type: 'string',
              enum: ['JPG', 'PNG', 'SVG', 'PDF'],
              description: 'Export format',
              default: 'PNG',
            },
            scale: {
              type: 'number',
              description: 'Scale factor (1-4)',
              default: 1,
            },
          },
          required: ['fileKey', 'nodeIds'],
        },
      },
      {
        name: 'get_team_projects',
        description: 'Get projects from a Figma team',
        inputSchema: {
          type: 'object',
          properties: {
            teamId: {
              type: 'string',
              description: 'The Figma team ID',
            },
          },
          required: ['teamId'],
        },
      },
      {
        name: 'get_project_files',
        description: 'Get files from a Figma project',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: {
              type: 'string',
              description: 'The Figma project ID',
            },
          },
          required: ['projectId'],
        },
      },
      {
        name: 'get_comments',
        description: 'Get comments from a Figma file',
        inputSchema: {
          type: 'object',
          properties: {
            fileKey: {
              type: 'string',
              description: 'The Figma file key',
            },
          },
          required: ['fileKey'],
        },
      },
      {
        name: 'post_comment',
        description: 'Post a comment on a Figma file',
        inputSchema: {
          type: 'object',
          properties: {
            fileKey: {
              type: 'string',
              description: 'The Figma file key',
            },
            message: {
              type: 'string',
              description: 'The comment message',
            },
            x: {
              type: 'number',
              description: 'X coordinate for the comment',
            },
            y: {
              type: 'number',
              description: 'Y coordinate for the comment',
            },
          },
          required: ['fileKey', 'message', 'x', 'y'],
        },
      },
      {
        name: 'get_user_info',
        description: 'Get current user information',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_team_components',
        description: 'Get components from a team library',
        inputSchema: {
          type: 'object',
          properties: {
            teamId: {
              type: 'string',
              description: 'The Figma team ID',
            },
          },
          required: ['teamId'],
        },
      },
      {
        name: 'get_team_styles',
        description: 'Get styles from a team library',
        inputSchema: {
          type: 'object',
          properties: {
            teamId: {
              type: 'string',
              description: 'The Figma team ID',
            },
          },
          required: ['teamId'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'get_file': {
        const { fileKey } = args as { fileKey: string };
        const file = await figmaClient.getFile(fileKey);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(file, null, 2),
            },
          ],
        };
      }

      case 'get_file_nodes': {
        const { fileKey, nodeIds } = args as { fileKey: string; nodeIds: string[] };
        const nodes = await figmaClient.getFileNodes(fileKey, nodeIds);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(nodes, null, 2),
            },
          ],
        };
      }

      case 'export_images': {
        const { fileKey, nodeIds, format = 'PNG', scale = 1 } = args as {
          fileKey: string;
          nodeIds: string[];
          format?: 'JPG' | 'PNG' | 'SVG' | 'PDF';
          scale?: number;
        };
        const images = await figmaClient.getImages(fileKey, nodeIds, {
          format,
          constraint: { type: 'SCALE', value: scale },
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(images, null, 2),
            },
          ],
        };
      }

      case 'get_team_projects': {
        const { teamId } = args as { teamId: string };
        const projects = await figmaClient.getTeamProjects(teamId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(projects, null, 2),
            },
          ],
        };
      }

      case 'get_project_files': {
        const { projectId } = args as { projectId: string };
        const files = await figmaClient.getProjectFiles(projectId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(files, null, 2),
            },
          ],
        };
      }

      case 'get_comments': {
        const { fileKey } = args as { fileKey: string };
        const comments = await figmaClient.getComments(fileKey);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(comments, null, 2),
            },
          ],
        };
      }

      case 'post_comment': {
        const { fileKey, message, x, y } = args as {
          fileKey: string;
          message: string;
          x: number;
          y: number;
        };
        const comment = await figmaClient.postComment(fileKey, message, { x, y });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(comment, null, 2),
            },
          ],
        };
      }

      case 'get_user_info': {
        const user = await figmaClient.getMe();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(user, null, 2),
            },
          ],
        };
      }

      case 'get_team_components': {
        const { teamId } = args as { teamId: string };
        const components = await figmaClient.getTeamComponents(teamId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(components, null, 2),
            },
          ],
        };
      }

      case 'get_team_styles': {
        const { teamId } = args as { teamId: string };
        const styles = await figmaClient.getTeamStyles(teamId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(styles, null, 2),
            },
          ],
        };
      }

      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${name}`
        );
    }
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Error executing ${name}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Figma MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});