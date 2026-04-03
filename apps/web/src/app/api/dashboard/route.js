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
  const date =
    url.searchParams.get("date") || new Date().toISOString().split("T")[0];

  const balance = await sql`
    SELECT * FROM daily_balances 
    WHERE mill_id = ${profile.mill_id} AND date = ${date}
  `;

  const dailyStats = balance[0] || {
    opening_balance: 0,
    total_credits: 0,
    total_debits: 0,
    closing_balance: 0,
  };

  // If no balance record exists for today, we should find the most recent closing balance
  if (!balance[0]) {
    const lastBalance = await sql`
      SELECT closing_balance FROM daily_balances 
      WHERE mill_id = ${profile.mill_id} AND date < ${date}
      ORDER BY date DESC LIMIT 1
    `;
    dailyStats.opening_balance = lastBalance[0]?.closing_balance || 0;
    dailyStats.closing_balance = dailyStats.opening_balance;
  }

  return Response.json(dailyStats);
}
