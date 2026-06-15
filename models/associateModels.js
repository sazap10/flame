const Category = require('./Category');
const Bookmark = require('./Bookmark');
const App = require('./App');

const associateModels = () => {
  Category.hasMany(Bookmark, {
    foreignKey: 'categoryId',
    as: 'bookmarks',
  });

  Bookmark.belongsTo(Category, {
    foreignKey: 'categoryId',
  });

  // Apps share the same categories as bookmarks. The link is optional: an app
  // with a null categoryId is "uncategorised" and rendered in a default group.
  Category.hasMany(App, {
    foreignKey: 'categoryId',
    as: 'apps',
  });

  App.belongsTo(Category, {
    foreignKey: 'categoryId',
  });
};

module.exports = associateModels;
