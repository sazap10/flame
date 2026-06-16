import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithStore } from '../../../test/test-utils';
import { WeatherWidget } from './WeatherWidget';

// The initial /api/weather request should resolve to nothing so only the
// WebSocket effect is under test.
vi.mock('axios', () => ({
  default: { get: vi.fn(() => Promise.resolve({ data: { data: [] } })) },
}));

// Records every constructed socket so the test can assert how many were opened
// and drive an incoming message.
class MockWebSocket {
  static instances: MockWebSocket[] = [];
  onmessage: ((e: { data: string }) => void) | null = null;
  close = vi.fn();

  constructor(public url: string) {
    MockWebSocket.instances.push(this);
  }
}

beforeEach(() => {
  MockWebSocket.instances = [];
  vi.stubGlobal('WebSocket', MockWebSocket as unknown as typeof WebSocket);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('WeatherWidget', () => {
  it('opens the weather socket exactly once', () => {
    renderWithStore(<WeatherWidget />);

    expect(MockWebSocket.instances).toHaveLength(1);
  });

  it('does not recreate the socket when a weather update arrives', () => {
    // Regression guard: a `weather` dependency on the socket effect tore the
    // connection down and reopened it on every incoming message.
    renderWithStore(<WeatherWidget />);
    expect(MockWebSocket.instances).toHaveLength(1);

    act(() => {
      MockWebSocket.instances[0].onmessage?.({
        data: JSON.stringify({ id: 1, temperature: 20 }),
      });
    });

    expect(MockWebSocket.instances).toHaveLength(1);
    expect(MockWebSocket.instances[0].close).not.toHaveBeenCalled();
  });
});
