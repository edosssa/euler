let wrapped = false;

module.exports = function(babel) {
  var t = babel.types;
  return {
    visitor: {
      Program: function(path) {
        /* Wrap the entire code in an IFEE */
        if (wrapped) return;

        const arrowFunction = t.ArrowFunctionExpression(
          [],
          t.BlockStatement([...path.node.body], []),
          true
        );
        const expression = t.ExpressionStatement(
          t.callExpression(arrowFunction, [])
        );

        path.replaceWith(t.Program([expression]), []);
        /* There's currently a bug in babel where calling path.skip doesn't
         * work and causes the stack to get blown! */
        wrapped = true;
      },

      VariableDeclaration: function(path) {
        const declarator = path.node.declarations[0];

        path.replaceWith(
          t.callExpression(
            t.memberExpression(t.identifier("scope"), t.identifier("set")),
            [t.stringLiteral(declarator.id.name), declarator.init]
          )
        );
      },

          ExpressionStatement: function (path) {
          
      }
    }
  };
};
