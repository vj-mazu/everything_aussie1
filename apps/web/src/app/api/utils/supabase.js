// Supabase REST Client for Direct Table Access
// This file provides helper methods for table-based operations

const SUPABASE_URL = "https://qzqvfixbnvezdfzcnxtm.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6cXZmaXhibnZlemRmemNueHRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNzE2NTgsImV4cCI6MjA4NzY0NzY1OH0.tNLABahzMxvnoF4c-tkpOwoHEaNp_4kxyVRCqdVZPks";

// Supabase client for direct table operations
class SupabaseClient {
  constructor(url, anonKey) {
    this.url = url;
    this.headers = {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    };
  }

  // SELECT operations
  from(table) {
    const self = this;
    return {
      select: async function (columns = "*") {
        const response = await fetch(
          `${self.url}/rest/v1/${table}?select=${columns}`,
          {
            headers: self.headers,
          },
        );
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Query failed");
        return { data, error: null };
      },

      insert: async function (values) {
        const response = await fetch(`${self.url}/rest/v1/${table}`, {
          method: "POST",
          headers: self.headers,
          body: JSON.stringify(values),
        });
        const data = await response.json();
        if (!response.ok) return { data: null, error: data };
        return { data, error: null };
      },

      update: async function (values) {
        return {
          eq: async function (column, value) {
            const response = await fetch(
              `${self.url}/rest/v1/${table}?${column}=eq.${value}`,
              {
                method: "PATCH",
                headers: self.headers,
                body: JSON.stringify(values),
              },
            );
            const data = await response.json();
            if (!response.ok) return { data: null, error: data };
            return { data, error: null };
          },
        };
      },

      delete: async function () {
        return {
          eq: async function (column, value) {
            const response = await fetch(
              `${self.url}/rest/v1/${table}?${column}=eq.${value}`,
              {
                method: "DELETE",
                headers: self.headers,
              },
            );
            if (!response.ok) {
              const error = await response.json();
              return { error };
            }
            return { error: null };
          },
        };
      },
    };
  }

  // RPC for stored procedures
  async rpc(functionName, params = {}) {
    const response = await fetch(`${this.url}/rest/v1/rpc/${functionName}`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(params),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "RPC failed");
    return { data, error: null };
  }
}

// Export singleton
const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabase;
export { SUPABASE_URL, SUPABASE_ANON_KEY };
