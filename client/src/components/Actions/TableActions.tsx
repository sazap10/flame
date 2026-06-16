import { onActivate } from '../../utility';
import { Icon } from '../UI';
import classes from './TableActions.module.css';

interface Entity {
  id: number;
  name: string;
  isPinned?: boolean;
  isPublic: boolean;
}

interface Props {
  entity: Entity;
  deleteHandler: (id: number, name: string) => void;
  updateHandler: (id: number) => void;
  pinHanlder?: (id: number) => void;
  changeVisibilty: (id: number) => void;
  showPin?: boolean;
}

export const TableActions = (props: Props): JSX.Element => {
  const {
    entity,
    deleteHandler,
    updateHandler,
    pinHanlder,
    changeVisibilty,
    showPin = true,
  } = props;

  const _pinHandler = pinHanlder || (() => {});

  return (
    <td className={classes.TableActions}>
      {/* DELETE */}
      <div
        className={classes.TableAction}
        role="button"
        tabIndex={0}
        onClick={() => deleteHandler(entity.id, entity.name)}
        onKeyDown={onActivate(() => deleteHandler(entity.id, entity.name))}
      >
        <Icon icon="mdiDelete" />
      </div>

      {/* UPDATE */}
      <div
        className={classes.TableAction}
        role="button"
        tabIndex={0}
        onClick={() => updateHandler(entity.id)}
        onKeyDown={onActivate(() => updateHandler(entity.id))}
      >
        <Icon icon="mdiPencil" />
      </div>

      {/* PIN */}
      {showPin && (
        <div
          className={classes.TableAction}
          role="button"
          tabIndex={0}
          onClick={() => _pinHandler(entity.id)}
          onKeyDown={onActivate(() => _pinHandler(entity.id))}
        >
          {entity.isPinned ? (
            <Icon icon="mdiPinOff" color="var(--color-accent)" />
          ) : (
            <Icon icon="mdiPin" />
          )}
        </div>
      )}

      {/* VISIBILITY */}
      <div
        className={classes.TableAction}
        role="button"
        tabIndex={0}
        onClick={() => changeVisibilty(entity.id)}
        onKeyDown={onActivate(() => changeVisibilty(entity.id))}
      >
        {entity.isPublic ? (
          <Icon icon="mdiEyeOff" color="var(--color-accent)" />
        ) : (
          <Icon icon="mdiEye" />
        )}
      </div>
    </td>
  );
};
