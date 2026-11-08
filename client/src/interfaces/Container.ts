// Docker's `State` string for a container (running, exited, created, paused,
// restarting, dead, ...) or "missing" when the container no longer exists.
export type ContainerStatus = string;

export interface ContainerState {
  appId: number;
  containerName: string;
  state: ContainerStatus;
}

export type ContainerAction = 'start' | 'stop';
