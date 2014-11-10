var sex = require('s-expression');
var esc = require('escodegen');
var ast = require('ast-types');
var b   = ast.builders;

function compile(tree) {
	return Array.isArray(tree) ? b.callExpression(compile(tree[0]), tree.slice(1).map(compile))
	                           : b.identifier(tree);
}

console.log(esc.generate(compile(sex('(a b (c 5))'))));