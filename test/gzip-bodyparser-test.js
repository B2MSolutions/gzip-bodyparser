var assert = require('assert'),
bodyparser = require('../lib/gzip-bodyparser.js')(),
events = require('events'),
util = require('util'),
zlib = require('zlib');


describe('gzip-bodyparser fall back to next', function() {

	var req = {};
	var res = {};

	it('it should call next when req _body is true', function(done){
		req = {
			_body: true
		};

		bodyparser(req, res, function(){
			assert(req._body === true);
			done();
		});
	});

	it('it should call next when req has not content', function(done){
		req = {
			_body: false,
			headers: {}
		}

		bodyparser(req, res, function(){
			assert(req._body === false);
			done();
		});
	});

	it('it should call next when req is not json', function(done){
		req = {
			_body: false,
			headers: {
				"transfer-encoding": "utf-8",
				"content-length": 10
			}
		};
		
		bodyparser(req, res, function(){
			assert(req._body === false);
			done();
		});
	});

	it('it should call next when req is not gzip', function(done){
		req = {
			_body: false,
			headers: {
				"transfer-encoding": "utf-8",
				"content-length": 10,
				"content-type": "application/json"
			}
		};
		
		bodyparser(req, res, function(){
			assert(req._body === false);
			done();
		});
	});
});

describe('gzip-bodyparser should process', function() {
	var res = {};
	var req = {};

	var headers = {
		"transfer-encoding": "utf-8",
		"content-length": 10,
		"content-type": "application/json",
		"content-encoding": "gzip"
	};

	function MyReq() {
	    events.EventEmitter.call(this);
	}

	util.inherits(MyReq, events.EventEmitter);
	
	beforeEach(function() {
		req = new MyReq();
		req._body = false;
		req.headers = headers;
	});

	it('it should set _body to true', function(done){
		bodyparser(req, res, function(){
			assert(req._body);
			done();
		});

		req.emit('data', "1");
		req.emit('end');
	});

	
	it('it should unzip and return expected json', function(done){
		bodyparser(req, res, function(err){
			if (err) { 
				assert(false, 'error getting data');
			}

			assert.equal('{"key": "value"}', req.rawBody);
			assert.equal("value", req.body.key);
			assert(req._body);
			done();
		});

		var data = new Buffer('{"key": "value"}');
		zlib.gzip(data, function(err, compressed){
			if (err) {
				assert(false, 'error compress data');
			}

			req.emit('data', compressed);
			req.emit('end');
		});
	});

	it('it should return error when failed to unzip', function(done){
		bodyparser(req, res, function(err){
			assert(err);
			assert.equal(400, err.status);
			assert.deepEqual({}, req.body);
			done();
		});

		var data = new Buffer('{"key": "value"}');
		zlib.gzip(data, function(err, compressed){
			if (err) { 
				assert(false, 'error compress data');
			}
		
			compressed = compressed.slice(1, 3);	
			req.emit('data', compressed);
			req.emit('end');
		});
	});	

	it('it should return error for invalid Json', function(done){
		bodyparser(req, res, function(err){
			assert(err);
			assert.equal(400, err.status);
			assert.deepEqual({}, req.body);
			done();
		});

		var data = new Buffer('{"key": "value"');
		zlib.gzip(data, function(err, compressed){
			if (err) { 
				assert(false, 'error compress data');
			}
			
			req.emit('data', compressed);
			req.emit('end');
		});
	});	

});