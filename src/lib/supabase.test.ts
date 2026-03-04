import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSupabaseClient } from './supabase';

vi.mock('@/utils/supabase/info', () => ({
  projectId: 'test-project-id',
  publicAnonKey: 'test-anon-key',
}));

describe('supabase', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('creates Supabase client with mocked config', () => {
    const client = getSupabaseClient();
    expect(client).toBeDefined();
    expect(client).not.toBeNull();
  });
});
