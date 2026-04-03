import sql from "@/app/api/utils/sql";
import { getSession, getUserProfile } from "@/app/api/utils/accounting";

export async function GET(req) {
  const session = await getSession();
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await getUserProfile(session.user.id);
  if (!profile || !profile.mill_id)
    return Response.json({ error: "No mill associated" }, { status: 403 });

  const url = new URL(req.url);
  const ledger_id = url.searchParams.get("ledger_id");

  if (ledger_id) {
    // Detailed history for a single ledger
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = 50;
    const offset = (page - 1) * limit;

    const history = await sql`
      SELECT * FROM transactions 
      WHERE mill_id = ${profile.mill_id} AND ledger_id = ${ledger_id}
      ORDER BY date DESC, created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const totals = await sql`
      SELECT 
        SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END) as total_credits,
        SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END) as total_debits
      FROM transactions
      WHERE mill_id = ${profile.mill_id} AND ledger_id = ${ledger_id}
    `;

    return Response.json({ history, totals: totals[0] });
  } else {
    // Summary of all ledgers
    const summaries = await sql`
      SELECT 
        l.id, l.name,
        COALESCE(SUM(CASE WHEN t.type = 'credit' THEN t.amount ELSE 0 END), 0) as total_credits,
        COALESCE(SUM(CASE WHEN t.type = 'debit' THEN t.amount ELSE 0 END), 0) as total_debits
      FROM ledgers l
      LEFT JOIN transactions t ON l.id = t.ledger_id
      WHERE l.mill_id = ${profile.mill_id}
      GROUP BY l.id, l.name
      ORDER BY l.name ASC
    `;

    return Response.json(summaries);
  }
}
