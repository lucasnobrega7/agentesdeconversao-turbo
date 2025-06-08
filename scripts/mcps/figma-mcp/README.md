# Figma MCP Server

A Model Context Protocol (MCP) server that provides access to the Figma API, allowing you to interact with Figma files, projects, and teams programmatically.

## Features

- 🎨 **File Access**: Get complete file information and document structure
- 🔍 **Node Inspection**: Retrieve specific nodes and their properties
- 📸 **Image Export**: Export nodes as images in various formats (PNG, JPG, SVG, PDF)
- 👥 **Team Management**: Access team projects and files
- 💬 **Comments**: Read and post comments on Figma files
- 📚 **Design System**: Access team components and styles
- 👤 **User Info**: Get current user information

## Installation

1. Clone this repository:
```bash
git clone https://github.com/lucasnobrega7/figma-mcp.git
cd figma-mcp
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Add your Figma access token to `.env`:
```env
FIGMA_ACCESS_TOKEN=your_figma_access_token_here
```

## Getting a Figma Access Token

1. Go to [Figma Account Settings](https://www.figma.com/developers/api#access-tokens)
2. Click "Create a new personal access token"
3. Give it a name and click "Create token"
4. Copy the token and add it to your `.env` file

## Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

## Available Tools

### `get_file`
Get complete file information including document structure.
- **Input**: `fileKey` - The Figma file key from the URL
- **Output**: Complete file data with document structure

### `get_file_nodes`
Get specific nodes from a Figma file.
- **Input**: `fileKey`, `nodeIds` - File key and array of node IDs
- **Output**: Node data for specified nodes

### `export_images`
Export nodes as images in various formats.
- **Input**: `fileKey`, `nodeIds`, `format` (PNG/JPG/SVG/PDF), `scale`
- **Output**: URLs to exported images

### `get_team_projects`
Get projects from a Figma team.
- **Input**: `teamId` - The Figma team ID
- **Output**: List of team projects

### `get_project_files`
Get files from a Figma project.
- **Input**: `projectId` - The Figma project ID
- **Output**: List of project files

### `get_comments`
Get comments from a Figma file.
- **Input**: `fileKey` - The Figma file key
- **Output**: List of comments

### `post_comment`
Post a comment on a Figma file.
- **Input**: `fileKey`, `message`, `x`, `y` - File key, message, and coordinates
- **Output**: Created comment data

### `get_user_info`
Get current user information.
- **Input**: None
- **Output**: Current user data

### `get_team_components`
Get components from a team library.
- **Input**: `teamId` - The Figma team ID
- **Output**: Team component library

### `get_team_styles`
Get styles from a team library.
- **Input**: `teamId` - The Figma team ID
- **Output**: Team style library

## Finding Figma IDs

### File Key
From a Figma URL like `https://www.figma.com/file/ABC123/My-Design`, the file key is `ABC123`.

### Node IDs
1. Right-click on any layer in Figma
2. Select "Copy/Paste as" → "Copy link"
3. The node ID is the part after `node-id=` in the URL

### Team ID
From your team URL like `https://www.figma.com/files/team/XYZ789`, the team ID is `XYZ789`.

### Project ID
From a project URL like `https://www.figma.com/files/project/456DEF`, the project ID is `456DEF`.

## Example Usage with Claude Code

Once the MCP server is running, you can use it with Claude Code:

```typescript
// Get file information
const file = await figma.get_file({ fileKey: "your-file-key" });

// Export specific nodes as images
const images = await figma.export_images({
  fileKey: "your-file-key",
  nodeIds: ["node-id-1", "node-id-2"],
  format: "PNG",
  scale: 2
});

// Get team projects
const projects = await figma.get_team_projects({ teamId: "your-team-id" });
```

## Error Handling

The server includes comprehensive error handling for:
- Invalid access tokens
- Missing file permissions
- Invalid file/node/team IDs
- API rate limits
- Network errors

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
1. Check the [Figma API documentation](https://www.figma.com/developers/api)
2. Open an issue on GitHub
3. Review error messages for API-specific guidance