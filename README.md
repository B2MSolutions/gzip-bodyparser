# gzip-bodyparser

![Travis build status](https://api.travis-ci.org/B2MSolutions/gzip-bodyparser.png)

Connect middleware for gunzipping json

Installation
------------

Get it on [npm][1]

Usage
-----

```
var connect = require('connect'),
  http = require('http'),
  bodyparser = require('gzip-bodyparser');

var app = connect()
  app.use(connect.favicon())
  app.use(bodyparser());

http.createServer(app).listen(3000);
```

Licence
-------

[MIT][2]

[1]: https://npmjs.org/package/gzip-bodyparser
[2]: https://github.com/B2MSolutions/gzip-bodyparser/blob/master/LICENSE
