import postcss from 'postcss';
import selectorParser from 'postcss-selector-parser';
import startsWith from 'lodash.startswith';
import Set from 'es6-set';
import includes from 'lodash.includes';

const bannedProperties = new Set(['behavior', '-moz-binding', 'filter']);

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

const validateDeclaration = ({important, prop, value}, warn) => {
  if (important) {
    warn('Value can not include !important');
  }

  if (bannedProperties.has(prop)) {
    warn(`Property "${prop}" is not allowed`);
  }

  if (startsWith(prop, 'overflow') && (includes(value, 'auto') || includes(value, 'scroll'))) {
    warn(`Property "${prop}" === "${value}" is not allowed`);
  }
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
