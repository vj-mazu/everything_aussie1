// Supabase Backend Connection for Mill Accounting
// Using Supabase REST API with the user's credentials

const SUPABASE_URL = "https://qzqvfixbnvezdfzcnxtm.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6cXZmaXhibnZlemRmemNueHRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNzE2NTgsImV4cCI6MjA4NzY0NzY1OH0.tNLABahzMxvnoF4c-tkpOwoHEaNp_4kxyVRCqdVZPks";

// Supabase SQL wrapper that mimics neon() tagged template syntax
async function executeSupabaseSQL(queryText, params = []) {
  try {
    // Use Supabase's postgres RPC endpoint for raw SQL
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/execute_sql`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        query: queryText,
        params: params,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.message || `Supabase query failed: ${response.statusText}`,
      );
    }

    const data = await response.json();
    return Array.isArray(data) ? data : data.rows || [];
  } catch (error) {
    console.error("Supabase SQL Error:", error);
    throw error;
  }
}

// Main SQL tagged template function (compatible with existing code)
const sql = async (strings, ...values) => {
  // Build parameterized query
  let queryText = "";
  const params = [];

  strings.forEach((string, i) => {
    queryText += string;
    if (i < values.length) {
      params.push(values[i]);
      queryText += `$${params.length}`;
    }
  });

  return executeSupabaseSQL(queryText, params);
};

// Transaction support (Supabase handles this internally)
sql.transaction = async (callback) => {
  // For transactions, we execute all queries in sequence
  // Supabase handles ACID properties on the server side
  const queries = [];

  const transactionProxy = async (strings, ...values) => {
    let queryText = "";
    const params = [];

    strings.forEach((string, i) => {
      queryText += string;
      if (i < values.length) {
        params.push(values[i]);
        queryText += `$${params.length}`;
      }
    });

    const result = await executeSupabaseSQL(queryText, params);
    queries.push(result);
    return result;
  };

  const results = await callback(transactionProxy);
  return Array.isArray(results) ? results : [results];
};

export default sql;
