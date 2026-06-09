export interface SalaryRange {
  min: number;
  max: number;
}

export const INDIAN_ROLE_SALARIES: Record<string, Record<string, SalaryRange>> = {
  software_engineer: {
    entry: { min: 4, max: 8 },      // 0-2 YoE
    mid: { min: 8, max: 18 },       // 3-5 YoE
    senior: { min: 18, max: 35 },   // 6-9 YoE
    lead: { min: 35, max: 60 }      // 10+ YoE
  },
  frontend_engineer: {
    entry: { min: 3.5, max: 7 },
    mid: { min: 7, max: 15 },
    senior: { min: 15, max: 30 },
    lead: { min: 30, max: 50 }
  },
  backend_engineer: {
    entry: { min: 4, max: 8.5 },
    mid: { min: 8.5, max: 18 },
    senior: { min: 18, max: 36 },
    lead: { min: 36, max: 58 }
  },
  product_manager: {
    entry: { min: 6, max: 10 },
    mid: { min: 10, max: 22 },
    senior: { min: 22, max: 45 },
    lead: { min: 45, max: 80 }
  },
  data_scientist: {
    entry: { min: 5, max: 9.5 },
    mid: { min: 9.5, max: 20 },
    senior: { min: 20, max: 38 },
    lead: { min: 38, max: 65 }
  },
  devops_engineer: {
    entry: { min: 4, max: 7.5 },
    mid: { min: 7.5, max: 16 },
    senior: { min: 16, max: 32 },
    lead: { min: 32, max: 52 }
  },
  uiux_designer: {
    entry: { min: 3.5, max: 7 },
    mid: { min: 7, max: 14 },
    senior: { min: 14, max: 28 },
    lead: { min: 28, max: 45 }
  }
};

export const INDIAN_CITY_MULTIPLIERS: Record<string, number> = {
  bangalore: 1.15,
  mumbai: 1.10,
  delhi: 1.05,
  hyderabad: 1.00,
  pune: 0.95,
  chennai: 0.90
};

export function getSalaryBenchmark(
  role: string,
  yoe: number,
  city: string
): { minLPA: number; maxLPA: number; roleName: string; cityName: string } {
  // Normalize input parameters
  const normalizedRole = role.toLowerCase().replace(/[^a-z0-9]/g, "_");
  
  // Find matching key or fall back to software_engineer
  let matchedRoleKey = "software_engineer";
  let displayRoleName = "Software Engineer";

  if (normalizedRole.includes("front") || normalizedRole.includes("ui")) {
    matchedRoleKey = "frontend_engineer";
    displayRoleName = "Frontend Engineer";
  } else if (normalizedRole.includes("back") || normalizedRole.includes("node") || normalizedRole.includes("api")) {
    matchedRoleKey = "backend_engineer";
    displayRoleName = "Backend Engineer";
  } else if (normalizedRole.includes("product") || normalizedRole.includes("pm")) {
    matchedRoleKey = "product_manager";
    displayRoleName = "Product Manager";
  } else if (normalizedRole.includes("data") || normalizedRole.includes("machine") || normalizedRole.includes("ai") || normalizedRole.includes("ml")) {
    matchedRoleKey = "data_scientist";
    displayRoleName = "Data Scientist";
  } else if (normalizedRole.includes("devops") || normalizedRole.includes("cloud") || normalizedRole.includes("sre") || normalizedRole.includes("infra")) {
    matchedRoleKey = "devops_engineer";
    displayRoleName = "DevOps Engineer";
  } else if (normalizedRole.includes("design") || normalizedRole.includes("ux") || normalizedRole.includes("user")) {
    matchedRoleKey = "uiux_designer";
    displayRoleName = "UI/UX Designer";
  } else if (Object.keys(INDIAN_ROLE_SALARIES).includes(normalizedRole)) {
    matchedRoleKey = normalizedRole;
    displayRoleName = role.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  }

  // Seniority bracket
  let bracket: "entry" | "mid" | "senior" | "lead" = "entry";
  if (yoe >= 10) bracket = "lead";
  else if (yoe >= 6) bracket = "senior";
  else if (yoe >= 3) bracket = "mid";

  const baseRange = INDIAN_ROLE_SALARIES[matchedRoleKey][bracket];

  // City multiplier
  const normalizedCity = city.toLowerCase().replace(/[^a-z]/g, "");
  let matchedCityKey = "hyderabad";
  let displayCityName = "Hyderabad";

  if (normalizedCity.includes("bang") || normalizedCity.includes("beng")) {
    matchedCityKey = "bangalore";
    displayCityName = "Bengaluru";
  } else if (normalizedCity.includes("mumb") || normalizedCity.includes("bomb")) {
    matchedCityKey = "mumbai";
    displayCityName = "Mumbai";
  } else if (normalizedCity.includes("delh") || normalizedCity.includes("ncr") || normalizedCity.includes("gur") || normalizedCity.includes("noid")) {
    matchedCityKey = "delhi";
    displayCityName = "Delhi / NCR";
  } else if (normalizedCity.includes("pune")) {
    matchedCityKey = "pune";
    displayCityName = "Pune";
  } else if (normalizedCity.includes("chen")) {
    matchedCityKey = "chennai";
    displayCityName = "Chennai";
  }

  const multiplier = INDIAN_CITY_MULTIPLIERS[matchedCityKey] || 1.0;

  return {
    minLPA: parseFloat((baseRange.min * multiplier).toFixed(1)),
    maxLPA: parseFloat((baseRange.max * multiplier).toFixed(1)),
    roleName: displayRoleName,
    cityName: displayCityName
  };
}
