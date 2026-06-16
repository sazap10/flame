import { Fragment, useState } from 'react';

// Redux
import { useDispatch, useSelector } from 'react-redux';
import { bindActionCreators } from 'redux';
// Typescript
import type { Query } from '../../../../interfaces';
import { actionCreators } from '../../../../store';
import type { State } from '../../../../store/reducers';
import { onActivate } from '../../../../utility';

// UI
import { ActionIcons, Button, CompactTable, Icon, Modal } from '../../../UI';

// Components
import { QueriesForm } from './QueriesForm';

export const CustomQueries = (): JSX.Element => {
  const { customQueries, config } = useSelector((state: State) => state.config);

  const dispatch = useDispatch();
  const { deleteQuery, createNotification } = bindActionCreators(
    actionCreators,
    dispatch
  );

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editableQuery, setEditableQuery] = useState<Query | null>(null);

  const updateHandler = (query: Query) => {
    setEditableQuery(query);
    setModalIsOpen(true);
  };

  const deleteHandler = (query: Query) => {
    const currentProvider = config.defaultSearchProvider;
    const isCurrent = currentProvider === query.prefix;

    if (isCurrent) {
      createNotification({
        title: 'Error',
        message: 'Cannot delete active provider',
      });
    } else if (
      window.confirm(`Are you sure you want to delete this provider?`)
    ) {
      deleteQuery(query.prefix);
    }
  };

  return (
    <Fragment>
      <Modal
        isOpen={modalIsOpen}
        setIsOpen={() => setModalIsOpen(!modalIsOpen)}
      >
        {editableQuery ? (
          <QueriesForm
            modalHandler={() => setModalIsOpen(!modalIsOpen)}
            query={editableQuery}
          />
        ) : (
          <QueriesForm modalHandler={() => setModalIsOpen(!modalIsOpen)} />
        )}
      </Modal>

      <section>
        {customQueries.length ? (
          <CompactTable headers={['Name', 'Prefix', 'Actions']}>
            {customQueries.map((q: Query) => (
              <Fragment key={q.prefix}>
                <span>{q.name}</span>
                <span>{q.prefix}</span>
                <ActionIcons>
                  <span
                    role="button"
                    tabIndex={0}
                    aria-label="Edit query"
                    onClick={() => updateHandler(q)}
                    onKeyDown={onActivate(() => updateHandler(q))}
                  >
                    <Icon icon="mdiPencil" />
                  </span>
                  <span
                    role="button"
                    tabIndex={0}
                    aria-label="Delete query"
                    onClick={() => deleteHandler(q)}
                    onKeyDown={onActivate(() => deleteHandler(q))}
                  >
                    <Icon icon="mdiDelete" />
                  </span>
                </ActionIcons>
              </Fragment>
            ))}
          </CompactTable>
        ) : null}

        <Button
          click={() => {
            setEditableQuery(null);
            setModalIsOpen(true);
          }}
        >
          Add new search provider
        </Button>
      </section>
    </Fragment>
  );
};
