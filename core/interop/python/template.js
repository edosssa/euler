/* NOTE: Python is indentation sensitive */

function inflateTemplate(code) {
  if (!code) throw new Error("Must provide code for inflating template");
  scriptCode = `
# Import wrapper modules to implement funtionality used in main
import euler
import sys

# Main entry point
def Main():
  ${code}

if __name__ == '__main__':
  Main()
      `;
  return scriptCode;
}

module.exports = inflateTemplate;
