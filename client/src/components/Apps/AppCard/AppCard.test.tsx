import { act, fireEvent, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { App } from '../../../interfaces';
import { renderWithStore } from '../../../testing/test-utils';
import { appTemplate } from '../../../utility/templateObjects/appTemplate';
import { AppCard } from './AppCard';

const { post, get } = vi.hoisted(() => ({ post: vi.fn(), get: vi.fn() }));

vi.mock('axios', () => ({
  default: { get, post, isAxiosError: () => false },
}));

const app: App = {
  ...appTemplate,
  id: 7,
  name: 'Web',
  url: 'https://web.example.com',
  icon: 'docker',
  containerName: 'web',
  dockerControl: true,
};

const preloaded = (
  containerStates: Record<number, string>,
  isAuthenticated = true
) => ({
  apps: {
    loading: false,
    apps: [app],
    errors: undefined,
    appInUpdate: null,
    containerStates,
  },
  auth: { isAuthenticated, isAnonymous: false, token: null },
});

beforeEach(() => {
  post.mockReset();
  get.mockReset();
  get.mockResolvedValue({ data: { data: [] } });
});

describe('AppCard container controls', () => {
  it('shows a Stop button and no stopped styling for a running container', () => {
    renderWithStore(<AppCard app={app} />, {
      preloadedState: preloaded({ 7: 'running' }),
    });

    expect(
      screen.getByRole('button', { name: 'Stop Web' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: 'Web is running' })
    ).toBeInTheDocument();
    expect(screen.getByRole('link').className).not.toMatch(/Stopped/);
  });

  it('shows a Start button and stopped styling for an exited container', () => {
    renderWithStore(<AppCard app={app} />, {
      preloadedState: preloaded({ 7: 'exited' }),
    });

    expect(
      screen.getByRole('button', { name: 'Start Web' })
    ).toBeInTheDocument();
    expect(screen.getByRole('link').className).toMatch(/Stopped/);
  });

  it('renders no controls when logged out, not opted in, or state unknown', () => {
    const { unmount } = renderWithStore(<AppCard app={app} />, {
      preloadedState: preloaded({ 7: 'running' }, false),
    });
    expect(screen.queryByRole('button')).toBeNull();
    unmount();

    const plain = { ...app, dockerControl: false };
    const second = renderWithStore(<AppCard app={plain} />, {
      preloadedState: preloaded({ 7: 'running' }),
    });
    expect(screen.queryByRole('button')).toBeNull();
    second.unmount();

    renderWithStore(<AppCard app={app} />, {
      preloadedState: preloaded({}),
    });
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('clicking the button controls the container without activating the tile link', async () => {
    let resolvePost: (value: unknown) => void = () => {};
    post.mockReturnValue(
      new Promise((resolve) => {
        resolvePost = resolve;
      })
    );

    renderWithStore(<AppCard app={app} />, {
      preloadedState: preloaded({ 7: 'exited' }),
    });

    const link = screen.getByRole('link');
    const linkClick = vi.fn();
    link.addEventListener('click', linkClick);

    const button = screen.getByRole('button', { name: 'Start Web' });
    // fireEvent returns false when preventDefault() was called.
    const notPrevented = fireEvent.click(button);

    expect(notPrevented).toBe(false);
    expect(linkClick).not.toHaveBeenCalled();
    expect(post).toHaveBeenCalledWith(
      '/api/apps/7/start',
      undefined,
      expect.anything()
    );

    // Pending state while the request is in flight.
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');

    await act(async () => {
      resolvePost({
        data: {
          data: { appId: 7, containerName: 'web', state: 'running' },
        },
      });
    });

    expect(screen.getByRole('button', { name: 'Stop Web' })).toBeEnabled();
    expect(
      screen.getByRole('img', { name: 'Web is running' })
    ).toBeInTheDocument();
  });
});
