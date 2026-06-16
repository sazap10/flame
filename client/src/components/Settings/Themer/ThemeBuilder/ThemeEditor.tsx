import { Fragment } from 'react';

// Redux
import { useDispatch, useSelector } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { Theme } from '../../../../interfaces';
import { actionCreators } from '../../../../store';
import type { State } from '../../../../store/reducers';
import { onActivate } from '../../../../utility';

// Other
import { ActionIcons, CompactTable, Icon, ModalForm } from '../../../UI';

interface Props {
  modalHandler: () => void;
}

export const ThemeEditor = (props: Props): JSX.Element => {
  const {
    theme: { userThemes },
  } = useSelector((state: State) => state);

  const { deleteTheme, editTheme } = bindActionCreators(
    actionCreators,
    useDispatch()
  );

  const updateHandler = (theme: Theme) => {
    props.modalHandler();
    editTheme(theme);
  };

  const deleteHandler = (theme: Theme) => {
    if (window.confirm(`Are you sure you want to delete this theme?`)) {
      deleteTheme(theme.name);
    }
  };

  return (
    <ModalForm formHandler={() => {}} modalHandler={props.modalHandler}>
      <CompactTable headers={['Name', 'Actions']}>
        {userThemes.map((t) => (
          <Fragment key={t.name}>
            <span>{t.name}</span>
            <ActionIcons>
              <span
                role="button"
                tabIndex={0}
                aria-label="Edit theme"
                onClick={() => updateHandler(t)}
                onKeyDown={onActivate(() => updateHandler(t))}
              >
                <Icon icon="mdiPencil" />
              </span>
              <span
                role="button"
                tabIndex={0}
                aria-label="Delete theme"
                onClick={() => deleteHandler(t)}
                onKeyDown={onActivate(() => deleteHandler(t))}
              >
                <Icon icon="mdiDelete" />
              </span>
            </ActionIcons>
          </Fragment>
        ))}
      </CompactTable>
    </ModalForm>
  );
};
