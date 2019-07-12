/* util */
const addClass = (elem, klass) => {
    if (!elem) return;

    const classes = String(elem.classList).split(" ");
    const hasClass = classes.filter(x => x === klass).length > 0;

    if (!hasClass) classes.push(klass);
    elem.classList = classes.join(" ");
}

const removeClass = (elem, klass) => {
    if (!elem) return;

    const classes = String(elem.classList).split(" ");
    const index = classes.indexOf(klass);

    if (index !== -1) classes.splice(index, 1);

    elem.classList = classes;
}

module.exports = {
    addClass, removeClass
}