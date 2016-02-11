import postcss from 'postcss';
import selectorParser from 'postcss-selector-parser';
import startsWith from 'lodash.startswith';

const validateRule = (rule, result) => {
  const validatePseudo = nodes => {
    let pseudo = false;
    let ampTagname = false;
    let noneTag = false;

    nodes.forEach(({type, value}) => {
      pseudo = pseudo || type === 'pseudo';
      ampTagname = ampTagname || type === 'tag' && startsWith(value, 'amp-');
      noneTag = noneTag || type !== 'pseudo' && type !== 'tag' && type !== 'combinator';
    });

    if (pseudo && noneTag) {
      rule.warn(result, 'Pseudo-selectors, pseudo-classes and pseudo-elements are only allowed in tag names.');
    }

    if (pseudo && ampTagname) {
      rule.warn(result, 'Pseudo-selectors, pseudo-classes and pseudo-elements are not allowed in amp-tags.');
    }
  };

  const validateSelector = selector => {
    if (selector.type === 'universal') {
      rule.warn(result, 'The universal selector (*) is not allowed in AMP.');
    }

    if (selector.type === 'pseudo' && selector.value === ':not') {
      rule.warn(result, ':not() is not allowed in AMP.');
    }

    if (selector.type === 'selector') {
      validatePseudo(selector.nodes);
    }
  };

  selectorParser(selectorAST => {
    selectorAST.eachInside(validateSelector);
  }).process(rule.selector);
};

const validateDeclaration = (declaration, result) => {

};

const plugin = (css, result) => {
  css.walk(node => {
    if (node.type === 'rule') {
      validateRule(node, result);
    }

    if (node.type === 'node') {
      validateDeclaration(node, result);
    }
  });
};

module.exports = postcss.plugin('postcss-amp-linter', () => plugin);
