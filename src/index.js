var sex = require('s-expression');
var esc = require('escodegen');
var ast = require('ast-types');
var b   = ast.builders;

function declare(name, val) {
	return b.variableDeclaration(
		'var',
		[b.variableDeclarator(
			compile(name),
			compile(val)
		)]
	);
}

function compile {
	['=', name, val]          => declare(name, val),
	[':=', name, val]         => b.assignmentExpression('=', compile(name), compile(val)),
	['cond', cond, then, els] => b.conditionalExpression(compile(cond), compile(then), compile(els)),
	['quote', ...rest]        => b.arrayExpression(rest.map(b.literal)),
	'#t'                      => b.literal(true),
	[callee,  ...rest]        => b.callExpression(compile(callee), rest.map(compile)),
	x if x instanceof String  => b.literal(String(x)),
	x                         => b.identifier(x)
}

console.log(esc.generate(compile(sex("(cond #t 1 2)"))));