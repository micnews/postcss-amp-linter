import postcss from 'postcss';
import selectorParser from 'postcss-selector-parser';

const validateRule = (rule, result) => {
  const validateSelector = selector => {
    if (selector.type === 'universal') {
      rule.warn(result, 'The universal selector (*) is not allowed in AMP.');
    }

    if (selector.type === 'pseudo' && selector.value === ':not') {
      rule.warn(result, ':not() is not allowed in AMP.');
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
