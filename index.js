const file = require("file-system");
const fs = require("fs");
const jscodeshift = require("jscodeshift");
const path = require("path");

const { commentBlock, VariableDeclaration } = jscodeshift;
const jscWithTsx = jscodeshift.withParser("tsx");

const DEPRECATION_MSG = `*
 * @deprecated Use the MUI SVG icon instead! See https://github.com/tocktix/admin/wiki/Svg-Icons-Components for details.
 *`;
const SVG_FOLDER = path.resolve(
  __dirname,
  "../",
  "admin",
  "dashboard",
  "src/js/components/icons/svgr",
);

// First get all SVG files paths + contents
file.recurseSync(
  SVG_FOLDER,
  ["**/*.tsx", "!**/index.tsx"],
  function (filepath, relative, isFile) {
    if (!isFile) {
      return;
    }

    // console.log(`file found: ${filepath}. relative: ${relative}`);
    // filepath returns absolute file path to file (ex: /Users/kaitock/Documents/git/tock/admin/dashboard/src/js/components/icons/svgr/tag-icons/IconTagPlate.tsx)
    // relative returns just the portion after "svgr/" (ex: tag-icons/IconTagPlate.tsx)

    const fileContents = fs.readFileSync(filepath, "utf-8");

    // Convert the file contents to AST
    const ast = jscWithTsx(fileContents);
    const code = ast.find(VariableDeclaration).get();

    // Add the deprecation message
    code.value.comments = [commentBlock(DEPRECATION_MSG, true)];

    fs.writeFileSync(filepath, ast.toSource(), 'utf8')
  },
);
