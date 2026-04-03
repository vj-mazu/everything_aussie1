import sql from "@/app/api/utils/sql";
import {
  getSession,
  getUserProfile,
  requireManager,
  recalculateBalances,
} from "@/app/api/utils/accounting";

export async function GET(req) {
  const session = await getSession();
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await getUserProfile(session.user.id);
  if (!profile || !profile.mill_id)
    return Response.json({ error: "No mill associated" }, { status: 403 });

  const url = new URL(req.url);
  const date = url.searchParams.get("date");
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = 50;
  const offset = (page - 1) * limit;

  const transactions = await sql`
    SELECT t.*, l.name as ledger_name 
    FROM transactions t
    JOIN ledgers l ON t.ledger_id = l.id
    WHERE t.mill_id = ${profile.mill_id} AND t.date = ${date}
    ORDER BY t.created_at ASC
    LIMIT ${limit} OFFSET ${offset}
  `;

  // Get daily balance info for this specific date
  const balance = await sql`
    SELECT * FROM daily_balances 
    WHERE mill_id = ${profile.mill_id} AND date = ${date}
  `;

  return Response.json({
    transactions,
    balance: balance[0] || {
      opening_balance: 0,
      total_credits: 0,
      total_debits: 0,
      closing_balance: 0,
    },
  });
}

export async function POST(req) {
  const session = await getSession();
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await getUserProfile(session.user.id);
  if (!profile || !profile.mill_id)
    return Response.json({ error: "No mill associated" }, { status: 403 });

  const { type, ledger_id, amount, remarks, date, include_anamath } =
    await req.json();

  // Generate unique transaction ID: TXN + YYYYMMDD + SEQ
  const dateStr = date.replace(/-/g, "");
  const seqResult = await sql`
    SELECT count(*) FROM transactions 
    WHERE mill_id = ${profile.mill_id} AND date = ${date}
  `;
  const seq = (parseInt(seqResult[0].count) + 1).toString().padStart(3, "0");
  const txn_id = `TXN${dateStr}${seq}`;

  return await sql
    .transaction(async (txn) => {
      // 1. Insert Transaction
      const transaction = await txn`
      INSERT INTO transactions (mill_id, txn_id, type, ledger_id, amount, remarks, date)
      VALUES (${profile.mill_id}, ${txn_id}, ${type}, ${ledger_id}, ${amount}, ${remarks}, ${date})
      RETURNING *
    `;

      // 2. Insert into Anamath if requested (Credits only)
      if (include_anamath && type === "credit") {
        await txn`
        INSERT INTO anamath (mill_id, txn_id, ledger_id, amount, remarks, date, status)
        VALUES (${profile.mill_id}, ${txn_id}, ${ledger_id}, ${amount}, ${remarks}, ${date}, 'open')
      `;
      }

      // 3. Trigger recalculation (asynchronously or in transaction? Better in transaction for consistency)
      // For simplicity here, we'll do it after the transaction response to keep it fast,
      // but the system requirements say "automatic".
      return transaction[0];
    })
    .then(async (res) => {
      await recalculateBalances(profile.mill_id, date);
      return Response.json(res);
    });
}

export async function DELETE(req) {
  const session = await getSession();
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await getUserProfile(session.user.id);
  requireManager(profile);

  const { id } = await req.json();

  const deleted = await sql`
    DELETE FROM transactions 
    WHERE id = ${id} AND mill_id = ${profile.mill_id}
    RETURNING date
  `;

  if (deleted.length > 0) {
    await recalculateBalances(profile.mill_id, deleted[0].date);
  }

  return Response.json({ success: true });
}
