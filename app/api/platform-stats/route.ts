import { NextRequest } from "next/server";
import { GET as getAnalytics } from "../analytics/route";

export const dynamic = "force-dynamic";

/**
 * Proxy route for platform-stats to align with system configurations.
 * Inherits secure isAdmin checks.
 */
export async function GET(req: NextRequest) {
  return getAnalytics(req);
}
