export interface RoleAnchor {
  designation: string;
  company: string;
  start_date: string; // ISO format or 'YYYY-MM'
  end_date: string | null; // null if current
  location: string;
}

export interface AchievementDetail {
  tag: string;
  range_or_scale: string;
  scope_note: string | null;
}

export interface GeneratedBullet {
  id: string; // Add a local ID for tracking
  text: string;
  source_tags: string[];
  status: "pending" | "accepted" | "edited" | "discarded";
}

export interface ExperienceRoleData {
  role_id: string;
  anchor: RoleAnchor;
  role_frame: string[];
  title_clarity_flag: boolean;
  title_ai_rewrite: string | null;
  title_rewrite_approved: boolean;
  achievement_tags: string[];
  achievement_details: AchievementDetail[];
  story_line: string | null;
  generated_bullets: GeneratedBullet[];
}

export interface SkillItem {
  name: string;
  source: "suggested" | "custom";
  proficiency: "Familiar" | "Proficient" | "Expert" | null;
}
