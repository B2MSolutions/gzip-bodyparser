var assert = require('assert'),
bodyparser = require('../lib/gzip-bodyparser.js')(),
events = require('events'),
util = require('util'),
buffer = require('buffer');

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

	it('it should set body Json', function(done){
		bodyparser(req, res, function(){
			assert.equal('{"key": "value"}', req.rawBody);
			assert.equal("value", req.body.key);
			assert(req._body);
			done();
		});

		var data = new Buffer('{"key": "value"}');
		req.emit('data', data);
		req.emit('end');
	});

	it('it should set retun error for invalid Json', function(done){
		bodyparser(req, res, function(err){
			assert(err);
			assert(400, err.status);
			assert('{"key": "value"', err.body);
			
			done();
		});

		var data = new Buffer('{"key": "value"');
		req.emit('data', data);
		req.emit('end');
	});
});