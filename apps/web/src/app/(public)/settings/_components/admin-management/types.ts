"use client";

export interface Admin {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "super_admin" | "admin";
  status: "active" | "invited";
  lastActive: string;
  has2FA: boolean;
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
  ip: string;
}

export const mockAdmins: Admin[] = [
  {
    id: "1",
    name: "Sarah Chen",
    email: "sarah.chen@asiaplex.io",
    avatar: "",
    role: "super_admin",
    status: "active",
    lastActive: "2 mins ago",
    has2FA: true,
  },
  {
    id: "2",
    name: "Marcus Johnson",
    email: "marcus.j@asiaplex.io",
    avatar: "",
    role: "admin",
    status: "active",
    lastActive: "1 hour ago",
    has2FA: true,
  },
  {
    id: "3",
    name: "Aiko Tanaka",
    email: "aiko.t@asiaplex.io",
    avatar: "",
    role: "admin",
    status: "active",
    lastActive: "3 hours ago",
    has2FA: false,
  },
  {
    id: "4",
    name: "James Wilson",
    email: "jwilson@asiaplex.io",
    avatar: "",
    role: "admin",
    status: "invited",
    lastActive: "-",
    has2FA: false,
  },
];

export const mockAuditLogs: AuditLog[] = [
  {
    id: "1",
    actor: "Sarah Chen",
    action: "Deleted",
    target: "Video: Spider-Man Trailer",
    timestamp: "2025-01-21 14:32",
    ip: "192.168.1.100",
  },
  {
    id: "2",
    actor: "Marcus Johnson",
    action: "Suspended",
    target: "User: ToxicUser42",
    timestamp: "2025-01-21 12:15",
    ip: "192.168.1.101",
  },
  {
    id: "3",
    actor: "Aiko Tanaka",
    action: "Created",
    target: "Game: Weekly Quiz Challenge",
    timestamp: "2025-01-21 10:45",
    ip: "192.168.1.102",
  },
  {
    id: "4",
    actor: "Sarah Chen",
    action: "Updated",
    target: "Settings: Referral Points",
    timestamp: "2025-01-20 18:22",
    ip: "192.168.1.100",
  },
  {
    id: "5",
    actor: "Marcus Johnson",
    action: "Approved",
    target: "Video: Batman BTS",
    timestamp: "2025-01-20 15:08",
    ip: "192.168.1.101",
  },
];
