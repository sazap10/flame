import { Fragment } from 'react';

import classes from './AppCategoryGrid.module.css';

import type { App, Category } from '../../../interfaces';

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

  // Bucket apps by category in a single pass. An app whose categoryId is null —
  // or points to a category not visible in this list (e.g. a hidden category
  // for an anonymous visitor) — is treated as uncategorised so it is never
  // silently dropped.
  const byCategory = new Map<number, App[]>();
  const uncategorised: App[] = [];

  for (const app of apps) {
    if (app.categoryId && categoryIds.has(app.categoryId)) {
      const bucket = byCategory.get(app.categoryId);
      if (bucket) {
        bucket.push(app);
      } else {
        byCategory.set(app.categoryId, [app]);
      }
    } else {
      uncategorised.push(app);
    }
  }

  // Render in category order, keeping only categories that have apps.
  const groups = categories
    .filter((category) => byCategory.has(category.id))
    .map((category) => ({
      category,
      apps: byCategory.get(category.id) as App[],
    }));

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
