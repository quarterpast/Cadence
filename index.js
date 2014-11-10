var sex = require('s-expression');
var esc = require('escodegen');
var ast = require('ast-types');
var b   = ast.builders;

function compile(tree) {
	return Array.isArray(tree) ? tree[0] === 'quote' ? b.arrayExpression(tree.slice(1).map(b.literal))
	                                                 : b.callExpression(compile(tree[0]), tree.slice(1).map(compile))
	                           : b.identifier(tree);
}

console.log(esc.generate(compile(sex('\'(+ 5 6)'))));