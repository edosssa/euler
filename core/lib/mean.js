const mean = function(arr) {
  return arr.reduce((prev, curr) => curr + prev) / arr.length;
};

module.exports = mean;
