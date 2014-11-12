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

function dot(computed) {
	return function (obj, prop) {
		return b.memberExpression(obj, compile(prop), computed);
	};
}

function compile {
	['=', name, val]          => declare(name, val),
	[':=', name, val]         => b.assignmentExpression('=', compile(name), compile(val)),
	['cond', cond, then, els] => b.conditionalExpression(compile(cond), compile(then), compile(els)),
	['quote', ...rest]        => b.arrayExpression(rest.map(b.literal)),
	['.', obj, ...rest]       => rest.reduce(dot(false), compile(obj)),
	['@', obj, ...rest]       => rest.reduce(dot(true), compile(obj)),
	'#t'                      => b.literal(true),
	[callee,  ...rest]        => b.callExpression(compile(callee), rest.map(compile)),
	x if x instanceof String  => b.literal(String(x)),
	x                         => b.identifier(x)
}

console.log(esc.generate(compile(sex("(@ a b c)"))));