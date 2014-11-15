#!/usr/bin/env node
var compile = require('./index.js');
var fs = require('fs');
var argv = require('minimist')(process.argv.slice(2));

function flatMap(xs, f) {
	return xs.reduce(
		function(ys, x) { return ys.concat(f(x)); },
		[]
	);
}

if(argv.i || argv._.length === 0) {
	require('./repl.js')({
		compile: argv.c
	});
} else {
	var out = argv.o ? fs.createWriteStream(argv.o, 'utf8') : process.stdout;

	var gen = require('escodegen').generate;
	var sex = require('s-expression');
	var b = require('ast-types').builders;
	var n = require('ast-types').namedTypes;


	var content  = fs.readFileSync(argv._[0], 'utf8');
	var lispAst  = sex('(' + content + ')');
	var compiler = compile({});
	var jsAst    = flatMap(lispAst.map(compiler), function(node) {
		return n.Expression.check(node)?     [b.expressionStatement(node)]
		     : n.EmptyStatement.check(node)? []
		     : /* otherwise */               [node];
	});
	var code = gen(b.program(jsAst));

	out.write(code);
	out.write('\n');
}
