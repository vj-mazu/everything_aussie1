import sql from "@/app/api/utils/sql";
import { getSession, getUserProfile } from "@/app/api/utils/accounting";

export async function GET() {
  const session = await getSession();
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await getUserProfile(session.user.id);
  if (!profile) return Response.json({ profile: null });

  return Response.json({ profile });
}

export async function POST(req) {
  const session = await getSession();
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { name, role, millName, millId } = await req.json();

  // If creating a new mill (Admin)
  let targetMillId = millId;
  if (!targetMillId && millName && role === "admin") {
    const mill = await sql`
      INSERT INTO mills (name) VALUES (${millName}) RETURNING id
    `;
    targetMillId = mill[0].id;
  }

  const profile = await sql`
    INSERT INTO user_profiles (id, mill_id, role, name)
    VALUES (${session.user.id}, ${targetMillId}, ${role}, ${name})
    ON CONFLICT (id) DO UPDATE SET
      mill_id = EXCLUDED.mill_id,
      role = EXCLUDED.role,
      name = EXCLUDED.name
    RETURNING *
  `;

  return Response.json({ profile: profile[0] });
}
