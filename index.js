'use strict';

const fs = require('fs');
const path = require('path');

const createFile = require('broccoli-file-creator');
const Funnel = require('broccoli-funnel');
const merge = require('broccoli-merge-trees');
const Filter = require('broccoli-persistent-filter');

const IONICON_PKG_PATH = require.resolve('ionicons/package.json');
const { dir: IONICON_ROOT } = path.parse(IONICON_PKG_PATH);
const IONICON_SVG_ROOT = path.resolve(IONICON_ROOT, 'dist/svg');

// Generate a list of all the icon names, so we can create virtual component `.js` files
const ICON_NAMES = fs
  .readdirSync(IONICON_SVG_ROOT)
  .map((path) => path.replace('.svg', ''));

class EmberIoniconSvgToHbsConverter extends Filter {
  extensions = ['svg'];
  targetExtension = 'hbs';

  processString(content /* relativePath */) {
    // TODO: inject `...attributes` into icon
    return content;
  }
}

module.exports = {
  name: require('./package').name,

  treeForAddon() {
    // Grab each `.svg` file from `ionicons`
    const rawIcons = new Funnel(IONICON_SVG_ROOT, {
      destDir: 'components/ionicons',
      include: ['*.svg'],
    });

    // Create an `.hbs` file from each `.svg` file
    const iconHbsTree = new EmberIoniconSvgToHbsConverter(rawIcons);

    // Create a "virtual" template-only JS file for each component
    const iconJsTree = merge(
      ICON_NAMES.map((name) =>
        createFile(
          `components/ionicons/${name}.js`,
          `
            import templateOnly from '@ember/component/template-only';
            export default templateOnly();
          `
        )
      )
    );

    return this._super.treeForAddon.call(
      this,
      merge([iconHbsTree, iconJsTree])
    );
  },

  treeForApp() {
    // Create a "virtual" file in the `app` tree for each icon, which re-exports the `addon` tree JS file
    const appTreeComponentReExports = ICON_NAMES.map((name) =>
      createFile(
        `components/ionicons/${name}.js`,
        `export { default } from 'ember-ionicons/components/ionicons/${name}';`
      )
    );

    return this._super.treeForApp.apply(this, [
      merge([...appTreeComponentReExports]),
    ]);
  },
};
