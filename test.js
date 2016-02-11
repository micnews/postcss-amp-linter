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
  const input = 'div:not(span) { border: 1px}';
  const expectedText = ':not() is not allowed in AMP.';
  return process(input)
    .then(actual => {
      t.is(actual.warnings().length, 1);
      t.is(actual.warnings()[0].text, expectedText);
    });
});

test('pseudo-selectors, pseudo-classes and pseudo-elements (allowed)', t => {
  // TODO: test this more

  const input = 'a:hover, div:last-of-type, p:hover a { border: 1px }';
  return process(input)
    .then(actual => {
      t.is(actual.warnings().length, 0);
    });
});

test('pseudo-selectors, pseudo-classes and pseudo-elements (disallowed)', t => {
  // TODO: test this more

  const input = 'amp-img:hover, amp-img:last-of-type, amp-img img:hover, div:hover amp-img, .foo:hover { border: 1px }';
  return process(input)
    .then(actual => {
      t.is(actual.warnings().length, 5);
    });
});

test('disallowed class-names', t => {
  const input = '.-amp-replaced-content { background: red; }';
  const expectedText = 'Classes may not start with "-amp-"';
  return process(input)
    .then(actual => {
      t.is(actual.warnings().length, 1);
      t.is(actual.warnings()[0].text, expectedText);
    });
});
