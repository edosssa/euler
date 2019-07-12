module.exports = function (babel) {
  var t = babel.types;

  return {
    visitor: {
      Program: function (path) {
        /* Wrap the entire code in an IFEE */

        if (path.node.body.length === 1 &&
          path.node.body[0] &&
          path.node.body[0].type === "ExpressionStatement" &&
          path.node.body[0].expression.callee &&
          path.node.body[0].expression.callee.type === "ArrowFunctionExpression") return;

        const arrowFunction = t.ArrowFunctionExpression(
          [],
          t.BlockStatement([...path.node.body], []),
          true
        );
        const expression = t.ExpressionStatement(
          t.callExpression(arrowFunction, [])
        );

        path.replaceWith(t.Program([expression]), []);
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
            [t.stringLiteral(path.node.left.name)]
          );
        }

        let rightExpr;
        if (path.node.right.type === "Identifier") {
          rightExpr = t.callExpression(
            t.memberExpression(t.identifier("scope"), t.identifier("get")),
            [t.stringLiteral(path.node.right.name)]
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

      CallExpression: function (path) {
        if (path.node.callee.type === "Identifier") {
          const innerExpr = t.callExpression(
            t.memberExpression(t.identifier("scope"), t.identifier("get")),
            [t.stringLiteral(path.node.callee.name)]
          );

          const args = path.node.arguments.map(arg => {
            if (arg.type === "Identifier") {
              return t.callExpression(
                t.memberExpression(t.identifier("scope"), t.identifier("get")),
                [t.stringLiteral(arg.name)]
              );
            } else return arg;
          })
          path.replaceWith(
            t.callExpression(innerExpr, [...args])
          );
        }
        /* Todo: transform callee types of MemberExpression */
        // else if (path.node.callee.type === "MemberExpression") {
        // }
      },

      TemplateLiteral: function (path) {
        if (path.node.expressions.filter(n => n.type === "Identifier").length === 0)
          return;

        const clone = { ...path.node };

        clone.expressions = clone.expressions.map(node => {
          if (node.type === "Identifier") {
            return t.callExpression(
              t.memberExpression(t.identifier("scope"), t.identifier("get")),
              [t.stringLiteral(node.name)]
            );
          }
          else return node;
        });

        path.replaceWith(clone);
      },

      VariableDeclaration: function (path) {
        const declarator = path.node.declarations[0];

        path.replaceWith(
          t.callExpression(
            t.memberExpression(t.identifier("scope"), t.identifier("set")),
            [t.stringLiteral(declarator.id.name), declarator.init]
          )
        );
      },

      ExpressionStatement: function (path) { }
    }
  };
};
