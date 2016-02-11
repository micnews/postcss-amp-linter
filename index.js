import postcss from 'postcss';
import selectorParser from 'postcss-selector-parser';
import startsWith from 'lodash.startswith';

const validatePseudo = (nodes, warn) => {
  let pseudo = false;
  let ampTagname = false;
  let noneTag = false;

  nodes.forEach(({type, value}) => {
    pseudo = pseudo || type === 'pseudo';
    ampTagname = ampTagname || type === 'tag' && startsWith(value, 'amp-');
    noneTag = noneTag || type !== 'pseudo' && type !== 'tag' && type !== 'combinator';
  });

  if (pseudo && noneTag) {
    warn('Pseudo-selectors, pseudo-classes and pseudo-elements are only allowed in tag names.');
  }

  if (pseudo && ampTagname) {
    warn('Pseudo-selectors, pseudo-classes and pseudo-elements are not allowed in amp-tags.');
  }
};

const validateRule = (rule, warn) => {
  selectorParser(selectorAST => {
    selectorAST.eachInside(({type, value, nodes}) => {
      if (type === 'universal') {
        warn('The universal selector (*) is not allowed in AMP.');
      }

      if (type === 'pseudo' && value === ':not') {
        warn(':not() is not allowed in AMP.');
      }

      if (type === 'selector') {
        validatePseudo(nodes, warn);
      }

      if (type === 'class' && startsWith(value, '-amp-')) {
        warn('Classes may not start with "-amp-"');
      }

      if (type === 'tag' && startsWith(value, 'i-amp')) {
        warn('Tags may not start with "i-amp"');
      }
    });
  }).process(rule.selector);
};

const validateDeclaration = (declaration, warn) => {
};

const walk = (css, result) => {
  css.walk(node => {
    const warn = (msg) => node.warn(result, msg);

    if (node.type === 'rule') {
      validateRule(node, warn);
    }

    if (node.type === 'decl') {
      validateDeclaration(node, warn);
    }
  });
};

module.exports = postcss.plugin('postcss-amp-linter', () => walk);
