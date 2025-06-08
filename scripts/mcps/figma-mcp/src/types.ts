export interface FigmaFile {
  name: string;
  role: string;
  lastModified: string;
  editorType: string;
  thumbnailUrl: string;
  version: string;
  document: FigmaNode;
  components: Record<string, FigmaComponent>;
  componentSets: Record<string, FigmaComponentSet>;
  schemaVersion: number;
  styles: Record<string, FigmaStyle>;
}

export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
  visible?: boolean;
  locked?: boolean;
  backgroundColor?: FigmaColor;
  fills?: FigmaPaint[];
  strokes?: FigmaPaint[];
  strokeWeight?: number;
  strokeAlign?: string;
  cornerRadius?: number;
  characters?: string;
  style?: FigmaTypeStyle;
}

export interface FigmaComponent {
  key: string;
  name: string;
  description: string;
  componentSetId?: string;
  documentationLinks: FigmaDocumentationLink[];
}

export interface FigmaComponentSet {
  key: string;
  name: string;
  description: string;
  documentationLinks: FigmaDocumentationLink[];
}

export interface FigmaStyle {
  key: string;
  name: string;
  description: string;
  styleType: string;
  remote: boolean;
}

export interface FigmaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface FigmaPaint {
  type: string;
  visible?: boolean;
  opacity?: number;
  color?: FigmaColor;
  gradientHandlePositions?: FigmaVector[];
  gradientStops?: FigmaColorStop[];
}

export interface FigmaTypeStyle {
  fontFamily: string;
  fontPostScriptName?: string;
  paragraphSpacing?: number;
  paragraphIndent?: number;
  fontSize: number;
  fontWeight: number;
  textCase?: string;
  textDecoration?: string;
  textAutoResize?: string;
  textAlignHorizontal?: string;
  textAlignVertical?: string;
  letterSpacing?: number;
  lineHeightPx?: number;
  lineHeightPercent?: number;
  lineHeightUnit?: string;
}

export interface FigmaVector {
  x: number;
  y: number;
}

export interface FigmaColorStop {
  position: number;
  color: FigmaColor;
}

export interface FigmaDocumentationLink {
  uri: string;
}

export interface FigmaTeamProjects {
  name: string;
  projects: FigmaProject[];
}

export interface FigmaProject {
  id: string;
  name: string;
}

export interface FigmaProjectFiles {
  name: string;
  files: FigmaFileInfo[];
}

export interface FigmaFileInfo {
  key: string;
  name: string;
  thumbnail_url: string;
  last_modified: string;
}

export interface FigmaComment {
  id: string;
  file_key: string;
  parent_id: string;
  user: FigmaUser;
  created_at: string;
  resolved_at?: string;
  message: string;
  client_meta: FigmaVector;
  order_id: string;
}

export interface FigmaUser {
  id: string;
  handle: string;
  img_url: string;
  email?: string;
}

export interface FigmaExportSettings {
  format: 'JPG' | 'PNG' | 'SVG' | 'PDF';
  constraint?: {
    type: 'SCALE' | 'WIDTH' | 'HEIGHT';
    value: number;
  };
}