import axios from 'axios';
import { type ChangeEvent, type FormEvent, useEffect, useState } from 'react';

// Redux
import { useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
// Typescript
import type { ApiResponse } from '../../../interfaces';
import { actionCreators } from '../../../store';
import { applyAuth } from '../../../utility';
// Other
import { Button, InputGroup } from '../../UI';

export const StyleSettings = (): JSX.Element => {
  const dispatch = useDispatch();
  const { createNotification } = bindActionCreators(actionCreators, dispatch);

  const [customStyles, setCustomStyles] = useState<string>('');

  useEffect(() => {
    axios
      .get<ApiResponse<string>>('/api/config/0/css')
      .then((data) => setCustomStyles(data.data.data))
      .catch((err) => console.log(err.response));
  }, []);

  const inputChangeHandler = (e: ChangeEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    setCustomStyles(e.target.value);
  };

  const formSubmitHandler = (e: FormEvent) => {
    e.preventDefault();

    axios
      .put<ApiResponse<unknown>>(
        '/api/config/0/css',
        { styles: customStyles },
        { headers: applyAuth() }
      )
      .then(() => {
        createNotification({
          title: 'Success',
          message: 'CSS saved. Reload page to see changes',
        });
      })
      .catch((err) => console.log(err.response));
  };

  return (
    <form onSubmit={(e) => formSubmitHandler(e)}>
      <InputGroup>
        <label htmlFor="customStyles">Custom CSS</label>
        <textarea
          id="customStyles"
          name="customStyles"
          value={customStyles}
          onChange={(e) => inputChangeHandler(e)}
          spellCheck={false}
        ></textarea>
      </InputGroup>
      <Button>Save CSS</Button>
    </form>
  );
};
