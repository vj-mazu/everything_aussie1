import sql from "@/app/api/utils/sql";
import {
  getSession,
  getUserProfile,
  requireManager,
} from "@/app/api/utils/accounting";

export async function GET(req) {
  const session = await getSession();
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await getUserProfile(session.user.id);
  if (!profile || !profile.mill_id)
    return Response.json({ error: "No mill associated" }, { status: 403 });

  const ledgers = await sql`
    SELECT * FROM ledgers 
    WHERE mill_id = ${profile.mill_id} 
    ORDER BY name ASC
  `;

  return Response.json(ledgers);
}

export async function POST(req) {
  const session = await getSession();
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await getUserProfile(session.user.id);
  if (!profile || !profile.mill_id)
    return Response.json({ error: "No mill associated" }, { status: 403 });

  const { name, remarks } = await req.json();

  try {
    const ledger = await sql`
      INSERT INTO ledgers (mill_id, name, remarks)
      VALUES (${profile.mill_id}, ${name}, ${remarks})
      RETURNING *
    `;
    return Response.json(ledger[0]);
  } catch (err) {
    if (err.message.includes("unique constraint")) {
      return Response.json(
        { error: "Ledger name already exists" },
        { status: 400 },
      );
    }
    throw err;
  }
}

export async function PUT(req) {
  const session = await getSession();
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await getUserProfile(session.user.id);
  requireManager(profile);

  const { id, name, remarks } = await req.json();

  const ledger = await sql`
    UPDATE ledgers 
    SET name = ${name}, remarks = ${remarks}
    WHERE id = ${id} AND mill_id = ${profile.mill_id}
    RETURNING *
  `;

  return Response.json(ledger[0]);
}

export async function DELETE(req) {
  const session = await getSession();
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await getUserProfile(session.user.id);
  requireManager(profile);

  const { id } = await req.json();

  await sql`
    DELETE FROM ledgers 
    WHERE id = ${id} AND mill_id = ${profile.mill_id}
  `;

  return Response.json({ success: true });
}
