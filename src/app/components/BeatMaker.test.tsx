import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BeatMaker from './BeatMaker';

vi.mock('@/utils/supabase/info', () => ({
  projectId: 'test-project-id',
  publicAnonKey: 'test-anon-key',
}));

vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
  },
}));

vi.mock('../../imports/svg-2blbi7adm0', () => ({
  default: {},
}));

describe('BeatMaker', () => {
  it('renders without crashing', () => {
    render(<BeatMaker />);
    expect(document.body).toBeInTheDocument();
  });
});
