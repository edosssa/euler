const libR = require('lib-r-math.js');
const rHelpers = libR.R;

module.exports = function (scope) {
    registerRHelpers(scope);

    /* =========== BINOMIAL DISTRIBUTION ============ */

    const { dbinom, pbinom, qbinom, rbinom } = libR.Binomial();

    scope.set("rbinom", rbinom);
    scope.set("dbinom", dbinom);
    scope.set("pbinom", pbinom);
    scope.set("qbinom", qbinom);

    /* =========== UNIFORM DISTRIBUTION ============ */

    const { runif, dunif, punif, qunif } = libR.Uniform();;

    scope.set("runif", runif);
    scope.set("dunif", dunif);
    scope.set("punif", punif);
    scope.set("qunif", qunif);

    /* =========== NORMAL DISTRIBUTION ============ */

    const { rnorm, dnorm, pnorm, qnorm } = libR.Normal();;

    scope.set("rnorm", rnorm);
    scope.set("dnorm", dnorm);
    scope.set("pnorm", pnorm);
    scope.set("qnorm", qnorm);

    const { gamma } = libR.special;

    /* =========== GAMMA FUNCTION ============ */

    scope.set("gamma", gamma);
};

function registerRHelpers(scope) {
    scope.set("seq", (start, end, step) => {
        return rHelpers.seq()()(start, end, step);
    });
}
