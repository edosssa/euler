let printTap;

module.exports = {
    configurePrintTap: (tap) => {
        printTap = tap;
    },
    print: (value) => {
        printTap(`${value}`);
    }
}