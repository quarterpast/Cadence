var repl = require('repl');
var sex = require('s-expression');
var compile = require('./index.js');
var gen = require('escodegen').generate;
var vm = require('vm');

repl.start({
	eval: function(cmd, context, filename, callback) {
		var err, script, result;
		try {
			var code = gen(compile(sex(cmd.slice(1, -1))));
			script = vm.createScript(code, {
				filename: filename,
				displayErrors: false
			});
		} catch(e) {
			err = e;
		}
		if(!err) {
			try {
				result = script.runInContext(context, { displayErrors: false });
			} catch (e) {
				err = e;
			}
		}
		callback(err, result);
	}
});