export type UserRole = "STUDENT" | "ADMIN";

export type CyberTheme = "cyan" | "emerald" | "violet" | "amber" | "red" | "stealth" | "light";

export type NoteCategory =
  | "Web Security"
  | "Linux"
  | "Active Directory"
  | "SOC"
  | "Networking"
  | "Pentesting"
  | "General";

export type BlockType =
  | "paragraph"
  | "heading1"
  | "heading2"
  | "heading3"
  | "bullet"
  | "checklist"
  | "quote"
  | "code"
  | "cmd"
  | "vuln"
  | "concept"
  | "divider";

export interface NoteBlock {
  id: string;
  type: BlockType;
  content: string;
  checked?: boolean; // For checklist
  language?: string; // For code block
  // For vuln card (cve / vuln)
  cveId?: string;
  severity?: "Low" | "Medium" | "High" | "Critical";
  vulnerabilityDescription?: string;
}

export interface UserSessionData {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  theme: CyberTheme;
}
