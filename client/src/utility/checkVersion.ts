import axios from 'axios';
import { createNotification } from '../store/action-creators';
import type { AppDispatch } from '../store/store';
import { store } from '../store/store';

const dispatch = store.dispatch as AppDispatch;

export const checkVersion = async (isForced: boolean = false) => {
  try {
    const res = await axios.get<string>(
      'https://raw.githubusercontent.com/pawelmalak/flame/master/client/.env'
    );

    const githubVersion = res.data
      .split('\n')
      .find((line) => line.startsWith('VITE_VERSION='))
      ?.split('=')[1]
      ?.trim();

    if (githubVersion && githubVersion !== import.meta.env.VITE_VERSION) {
      dispatch(
        createNotification({
          title: 'Info',
          message: 'New version is available!',
          url: 'https://github.com/pawelmalak/flame/blob/master/CHANGELOG.md',
        })
      );
    } else if (isForced) {
      dispatch(
        createNotification({
          title: 'Info',
          message: 'You are using the latest version!',
        })
      );
    }
  } catch (err) {
    console.log(err);
  }
};
