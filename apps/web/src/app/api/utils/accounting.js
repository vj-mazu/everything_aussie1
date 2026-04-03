import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export const getSession = async () => {
  const session = await auth();
  if (!session || !session.user?.id) return null;
  return session;
};

export const getUserProfile = async (userId) => {
  const profiles = await sql`
    SELECT p.*, m.name as mill_name, m.subscription_status
    FROM user_profiles p
    LEFT JOIN mills m ON p.mill_id = m.id
    WHERE p.id = ${userId}
  `;
  return profiles[0] || null;
};

export const requireAdmin = (profile) => {
  if (profile?.role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }
};

export const requireManager = (profile) => {
  if (profile?.role !== "admin" && profile?.role !== "manager") {
    throw new Error("Unauthorized: Manager access required");
  }
};

export const recalculateBalances = async (mill_id, startDate) => {
  // 1. Get the opening balance of the day before startDate
  const prevBalanceRow = await sql`
    SELECT closing_balance 
    FROM daily_balances 
    WHERE mill_id = ${mill_id} AND date < ${startDate} 
    ORDER BY date DESC LIMIT 1
  `;

  let currentOpening = prevBalanceRow[0]?.closing_balance || 0;

  // 2. Get all days from startDate onwards that have transactions or balance entries
  const affectedDates = await sql`
    SELECT DISTINCT date FROM (
      SELECT date FROM transactions WHERE mill_id = ${mill_id} AND date >= ${startDate}
      UNION
      SELECT date FROM daily_balances WHERE mill_id = ${mill_id} AND date >= ${startDate}
    ) AS dates ORDER BY date ASC
  `;

  for (const { date } of affectedDates) {
    // Get totals for this day
    const totals = await sql`
      SELECT 
        SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END) as credits,
        SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END) as debits
      FROM transactions
      WHERE mill_id = ${mill_id} AND date = ${date}
    `;

    const dailyCredits = totals[0]?.credits || 0;
    const dailyDebits = totals[0]?.debits || 0;
    const dailyClosing =
      Number(currentOpening) + Number(dailyCredits) - Number(dailyDebits);

    // Update or insert daily balance
    await sql`
      INSERT INTO daily_balances (mill_id, date, opening_balance, total_credits, total_debits, closing_balance)
      VALUES (${mill_id}, ${date}, ${currentOpening}, ${dailyCredits}, ${dailyDebits}, ${dailyClosing})
      ON CONFLICT (mill_id, date) DO UPDATE SET
        opening_balance = EXCLUDED.opening_balance,
        total_credits = EXCLUDED.total_credits,
        total_debits = EXCLUDED.total_debits,
        closing_balance = EXCLUDED.closing_balance
    `;

    currentOpening = dailyClosing;
  }
};
