// The slice of the Supabase client that the signup forms use, so tests can
// pass a stand-in instead of talking to a real database.
export type SignupClient = {
  from: (table: 'mentors' | 'mentees') => {
    insert: (row: Record<string, unknown>) => PromiseLike<{ error: unknown }>;
  };
  rpc: (fn: 'mentee_match_available', args: Record<string, unknown>) => PromiseLike<{ data: unknown; error: unknown }>;
};

export type Validation<T> = { ok: true; value: T } | { ok: false; error: string };
