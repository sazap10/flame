import type { ReactNode, Ref } from 'react';
import classes from './Table.module.css';

interface Props {
  children: ReactNode;
  headers: string[];
  innerRef?: Ref<HTMLDivElement>;
}

export const Table = (props: Props): JSX.Element => {
  return (
    <div className={classes.TableContainer} ref={props.innerRef}>
      <table className={classes.Table}>
        <thead className={classes.TableHead}>
          <tr>
            {props.headers.map(
              (header: string): JSX.Element => (
                <th key={header}>{header}</th>
              )
            )}
          </tr>
        </thead>
        <tbody className={classes.TableBody}>{props.children}</tbody>
      </table>
    </div>
  );
};
