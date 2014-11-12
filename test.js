var expect = require('expect.js');
var compile = require('./lib/index.js');

describe('compiler', function() {
	describe('quote', function() {
		it('should return the tail of the list', function() {
			expect(compile(['quote', 'a', 5, ['b']])).to.eql(['a', 5, ['b']]);
		});
	});
});