import 'babel-core/register';
import test from 'ava';
import linter from './index';
import postcss from 'postcss';

const process = (css) => postcss()
  .use(linter())
  .process(css);

test('universal selector', t => {
  const input = '.foo *>.bar { border: 1px}';
  const expectedText = 'The universal selector (*) is not allowed in AMP.';
  return process(input)
    .then(actual => {
      t.is(actual.warnings().length, 1);
      t.is(actual.warnings()[0].text, expectedText);
    });
});

test(':not() selector', t => {
  const input = '.foo:not(.bar) { border: 1px}';
  const expectedText = ':not() is not allowed in AMP.';
  return process(input)
    .then(actual => {
      t.is(actual.warnings().length, 1);
      t.is(actual.warnings()[0].text, expectedText);
    });
});
