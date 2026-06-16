// Typescript

import { Fragment } from 'react';
import { useSelector } from 'react-redux';
import type { State } from '../../../store/reducers';
import { bookmarkTemplate, categoryTemplate } from '../../../utility';
import { ContentType } from '../Bookmarks';
import { BookmarksForm } from './BookmarksForm';
// Utils
import { CategoryForm } from './CategoryForm';

interface Props {
  modalHandler: () => void;
  contentType: ContentType;
  inUpdate?: boolean;
}

export const Form = (props: Props): JSX.Element => {
  const { categoryInEdit, bookmarkInEdit } = useSelector(
    (state: State) => state.bookmarks
  );

  const { modalHandler, contentType, inUpdate } = props;

  return (
    <Fragment>
      {!inUpdate ? (
        // form: add new
        contentType === ContentType.category ? (
          <CategoryForm modalHandler={modalHandler} />
        ) : (
          <BookmarksForm modalHandler={modalHandler} />
        )
      ) : // form: update
      contentType === ContentType.category ? (
        <CategoryForm
          modalHandler={modalHandler}
          category={categoryInEdit || categoryTemplate}
        />
      ) : (
        <BookmarksForm
          modalHandler={modalHandler}
          bookmark={bookmarkInEdit || bookmarkTemplate}
        />
      )}
    </Fragment>
  );
};
