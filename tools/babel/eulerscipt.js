let wrapped = false;

module.exports = function(babel) {
  var t = babel.types;
  return {
    visitor: {
      Program: function (path) {
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

      BinaryExpression: function (path) {
        /* Don't apply any transforms if the left and right sides of
           the expression isn't an Identifier node */
        if (
          path.node.left.type !== "Identifier" &&
          path.node.right.type !== "Identifier"
        )
          return;

        let leftExpr;
        if (path.node.left.type === "Identifier") {
          leftExpr = t.callExpression(
            t.memberExpression(t.identifier("scope"), t.identifier("get")),
            [t.stringLiteral("left")]
          );
        }

        let rightExpr;
        if (path.node.right.type === "Identifier") {
          rightExpr = t.callExpression(
            t.memberExpression(t.identifier("scope"), t.identifier("get")),
            [t.stringLiteral("right")]
          );
        }

        leftExpr = leftExpr || path.node.left;
        rightExpr = rightExpr || path.node.right;

        const binaryExpr = t.BinaryExpression(path.node.operator, leftExpr, rightExpr);
        path.replaceWith(binaryExpr);
        path.skip();
      },

      TaggedTemplateExpression: function (path) {
        path.replaceWith(t.awaitExpression(path.node));
        path.shouldSkip = true
      },

      CallExpression: function(path) {
        if (path.node.callee.type === "Identifier") {
          const innerExpr = t.callExpression(
            t.memberExpression(t.identifier("scope"), t.identifier("get")),
            [t.stringLiteral(path.node.callee.name)]
          );

          path.replaceWith(
            t.callExpression(innerExpr, [...path.node.arguments])
          );
        }
        /* Todo: transform callee types of MemberExpression */
        // else if (path.node.callee.type === "MemberExpression") {
        // }
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

      ExpressionStatement: function(path) {}
    }
  };
};
