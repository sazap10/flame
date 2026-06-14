import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { State } from '../../store/reducers';

interface Props {
  children: JSX.Element;
}

export const ProtectedRoute = ({ children }: Props): JSX.Element => {
  const { isAuthenticated } = useSelector((state: State) => state.auth);

  if (isAuthenticated) {
    return children;
  }

  return <Navigate to="/settings/app" replace />;
};
