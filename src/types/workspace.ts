export type Member = {
  name: string;
  email: string;
  role: "Owner" | "Admin" | "Member";
};
export type Group = {
  description?: string;
  share?: boolean;
  enterpriseName?: string | null;
  id: string;
  name: string;
  role: Member["role"];
  members: Member[];
  files: number;
};
export type GroupSelection = Pick<Group, "id" | "name">;
export type WorkspaceOption = {
  /** Authenticated user role, supplied by the backend for this exact workspace. */
  role?: Member["role"];
  members?: Member[];
  id: string;
  name: string;
  type: "personal" | "enterprise" | "group";
  enterpriseName?: string;
};
