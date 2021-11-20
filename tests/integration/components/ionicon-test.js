import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | ionicon', function (hooks) {
  setupRenderingTest(hooks);

  test('rendering an Ionicon', async function (assert) {
    await render(hbs`<Ionicons::Add class="fill-red" />`);

    assert.dom('svg').hasClass('ionicon');
    assert.dom('svg').hasClass('fill-red');
  });
});
