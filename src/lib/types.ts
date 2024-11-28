export interface User {
  id: string;
  name: string;
  email: string;
  college: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: "pending" | "completed";
  priority: "low" | "medium" | "high";
  assignedTo?: string;
  createdAt: string;
}

export interface Member {
  id: string;
  user: User;
  role: "leader" | "member";
  joinedAt: string;
}

export interface Invitation {
  id: string;
  email: string;
  status: "pending" | "accepted" | "rejected";
  invitedBy: User;
  invitedAt: string;
}

export interface StudyPlan {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  tasks: Task[];
  members: Member[];
  invitations: Invitation[];
  createdBy: string;
  createdAt: string;
}
