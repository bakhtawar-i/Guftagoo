import type { SignupClient } from './client';

/** A stand-in for the Supabase client that records what the forms send. */
export function createFakeClient(options: { insertError?: unknown; rpcResult?: { data: unknown; error: unknown }; rpcThrows?: boolean } = {}) {
  const inserts: { table: string; row: Record<string, unknown> }[] = [];
  const rpcCalls: { fn: string; args: Record<string, unknown> }[] = [];
  const client: SignupClient = {
    from: (table) => ({
      insert: async (row) => {
        inserts.push({ table, row });
        return { error: options.insertError ?? null };
      },
    }),
    rpc: async (fn, args) => {
      rpcCalls.push({ fn, args });
      if (options.rpcThrows) throw new Error('network down');
      return options.rpcResult ?? { data: false, error: null };
    },
  };
  return { client, inserts, rpcCalls };
}
