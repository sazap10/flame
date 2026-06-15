import { Fragment } from 'react';

import classes from './AppCategoryGrid.module.css';

import { App, Category } from '../../../interfaces';

import { AppGrid } from './AppGrid';

interface Props {
  apps: App[];
  categories: Category[];
  totalApps?: number;
  searching: boolean;
}

// Renders apps grouped by their (optional) shared category. Uncategorised apps
// are shown first without a heading — the page already has an "Applications"
// headline above — and each non-empty category follows under its own name.
// While searching, grouping is skipped and a single flat grid is rendered.
export const AppCategoryGrid = (props: Props): JSX.Element => {
  const { apps, categories, totalApps, searching } = props;

  if (searching || !apps.length) {
    return <AppGrid apps={apps} totalApps={totalApps} searching={searching} />;
  }

  const categoryIds = new Set(categories.map((c) => c.id));

  // An app whose categoryId is null — or points to a category not visible in
  // this list (e.g. a hidden category for an anonymous visitor) — is treated
  // as uncategorised so it is never silently dropped.
  const uncategorised = apps.filter(
    (app) => !app.categoryId || !categoryIds.has(app.categoryId)
  );

  const groups = categories
    .map((category) => ({
      category,
      apps: apps.filter((app) => app.categoryId === category.id),
    }))
    .filter((group) => group.apps.length);

  return (
    <Fragment>
      {uncategorised.length > 0 && (
        <div className={classes.AppCategory}>
          <AppGrid apps={uncategorised} searching={false} />
        </div>
      )}

      {groups.map(({ category, apps: categoryApps }) => (
        <div className={classes.AppCategory} key={category.id}>
          <h3 className={classes.CategoryName}>{category.name}</h3>
          <AppGrid apps={categoryApps} searching={false} />
        </div>
      ))}
    </Fragment>
  );
};
