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

  const url = new URL(req.url);
  const status = url.searchParams.get("status") || "open";
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = 50;
  const offset = (page - 1) * limit;

  const entries = await sql`
    SELECT a.*, l.name as ledger_name 
    FROM anamath a
    JOIN ledgers l ON a.ledger_id = l.id
    WHERE a.mill_id = ${profile.mill_id} AND a.status = ${status}
    ORDER BY a.date DESC, a.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;

  return Response.json(entries);
}

export async function POST(req) {
  const session = await getSession();
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await getUserProfile(session.user.id);
  if (!profile || !profile.mill_id)
    return Response.json({ error: "No mill associated" }, { status: 403 });

  const { ledger_id, amount, remarks, date } = await req.json();

  const entry = await sql`
    INSERT INTO anamath (mill_id, ledger_id, amount, remarks, date, status)
    VALUES (${profile.mill_id}, ${ledger_id}, ${amount}, ${remarks}, ${date}, 'open')
    RETURNING *
  `;

  return Response.json(entry[0]);
}

export async function PUT(req) {
  const session = await getSession();
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await getUserProfile(session.user.id);
  requireManager(profile);

  const { id, action } = await req.json();

  if (action === "close") {
    const entry = await sql`
      UPDATE anamath 
      SET status = 'closed', closed_at = NOW()
      WHERE id = ${id} AND mill_id = ${profile.mill_id}
      RETURNING *
    `;
    return Response.json(entry[0]);
  }

  return Response.json({ error: "Invalid action" }, { status: 400 });
}

export async function DELETE(req) {
  const session = await getSession();
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await getUserProfile(session.user.id);
  requireManager(profile);

  const { id } = await req.json();

  await sql`
    DELETE FROM anamath 
    WHERE id = ${id} AND mill_id = ${profile.mill_id}
  `;

  return Response.json({ success: true });
}
