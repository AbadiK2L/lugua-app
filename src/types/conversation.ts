export type ConversationVideoCategory =
  | "interview"
  | "daily_life"
  | "culture"
  | "story";

export type ConversationVideo = {
  id: string;
  title: string;
  description: string;
  category: ConversationVideoCategory;
  level?: "A1" | "A2" | "B1" | "B2";
  durationSeconds?: number;
  speaker?: string;
  variety?: string;
  thumbnailUri?: string;
  videoUri?: string;
  transcriptStatus: "missing" | "draft" | "validated";
  rightsStatus: "unknown" | "authorized" | "owned";
  availability: "available" | "coming_soon";
};

export type ConversationVideoFilter = "all" | ConversationVideoCategory;
