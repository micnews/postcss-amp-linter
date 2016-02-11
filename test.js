import 'babel-core/register';
import test from 'ava';
import linter from './index';
import postcss from 'postcss';

const process = (css, cb) =>
  postcss().use(linter()).process(css).then(value => cb(value.warnings()));

test('universal selector', t => {
  const input = '.foo *>.bar { border: 1px}';
  const expectedText = 'The universal selector (*) is not allowed in AMP.';
  return process(input, actual => {
    t.is(actual[0] && actual[0].text, expectedText);
  });
});

test(':not() selector', t => {
  const input = 'div:not(span) { border: 1px}';
  const expectedText = ':not() is not allowed in AMP.';
  return process(input, actual => {
    t.is(actual[0] && actual[0].text, expectedText);
  });
});

test('pseudo-selectors, pseudo-classes and pseudo-elements (allowed)', t => {
  // TODO: test this more

  const input = 'a:hover, div:last-of-type, p:hover a { border: 1px }';
  return process(input, actual => {
    t.is(actual.length, 0);
  });
});

test('pseudo-selectors, pseudo-classes and pseudo-elements (disallowed)', t => {
  // TODO: test this more

  const input = 'amp-img:hover, amp-img:last-of-type, amp-img img:hover, div:hover amp-img, .foo:hover { border: 1px }';
  return process(input, actual => {
    t.is(actual.length, 5);
  });
});

test('disallowed class-names', t => {
  const input = '.-amp-replaced-content { background: red; }';
  const expectedText = 'Classes may not start with "-amp-"';
  return process(input, actual => {
    t.is(actual[0] && actual[0].text, expectedText);
  });
});

test('disallowed tag-names', t => {
  const input = 'i-amp-sizer { background: red; }';
  const expectedText = 'Tags may not start with "i-amp"';
  return process(input, actual => {
    t.is(actual[0] && actual[0].text, expectedText);
  });
});

test('!important is not allowed', t => {
  const input = 'div { background: red !important; }';
  const expectedText = 'Value can not include !important';
  return process(input, actual => {
    t.is(actual[0] && actual[0].text, expectedText);
  });
});

test('"behavior" & "-moz-binding" properties are not allowed', t => {
  const input = 'div { behavior: url(http://mic.com); -moz-binding: url(http://mic.com)}';
  const expectedText1 = 'Property "behavior" is not allowed';
  const expectedText2 = 'Property "-moz-binding" is not allowed';
  return process(input, actual => {
    t.is(actual[0] && actual[0].text, expectedText1);
    t.is(actual[1] && actual[1].text, expectedText2);
  });
});
