import { getDb } from "../../../db";
import { subscribers } from "../../../db/schema";
export async function POST(request: Request) {
  const data = await request.json().catch(() => null);
  const email = typeof data?.email === "string" ? data.email.trim().toLowerCase() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || data?.consent !== true)
    return Response.json({error:"Enter a valid email address and confirm your choice."},{status:400});
  await getDb().insert(subscribers).values({email,joinedAt:new Date().toISOString(),consent:"PEAK launch and beta invitations v1"}).onConflictDoNothing();
  return Response.json({ok:true});
}
