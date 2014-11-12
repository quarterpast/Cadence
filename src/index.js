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

function binary(op) {
	return function (l, r) {
		return b.binaryExpression(op, l, compile(r));
	};
}

function fn(args, body) {
	return b.functionExpression(
		null, args,
		b.blockStatement([b.returnStatement(body)])
	)
}

function compile {
	['=', name, val]          => declare(name, val),
	[':=', name, val]         => b.assignmentExpression('=', compile(name), compile(val)),
	['cond', cond, then, els] => b.conditionalExpression(compile(cond), compile(then), compile(els)),
	['quote', ...rest]        => rest,
	['.', obj, ...rest]       => rest.reduce(dot(false), compile(obj)),
	['@', obj, ...rest]       => rest.reduce(dot(true), compile(obj)),
	['list', ...rest]         => b.arrayExpression(rest.map(compile)),
	['λ', args, body]         => fn(compile(args).map(b.identifier), compile(body)),
	['+', l, ...rest]            => rest.reduce(binary('+'), compile(l)),
	'#t'                      => b.literal(true),
	[callee,  ...rest]        => b.callExpression(compile(callee), rest.map(compile)),
	x if x instanceof String  => b.literal(String(x)),
	x                         => b.identifier(x)
}

eval(esc.generate(compile(sex("((. console log) ((. (list 1 2 3) map) (λ '(a) (+ a 5))))"))));