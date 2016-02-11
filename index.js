import postcss from 'postcss';

const validateRule = (rule, result) => {
  const {selector} = rule;

  if (selector.indexOf('*') !== -1) {
    rule.warn(result, 'The universal selector (*) is not allowed in AMP.');
  }
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
