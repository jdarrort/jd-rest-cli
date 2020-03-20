# Class to perform REST Requests

Usage
```javascript
RestCli = require('jd-rest-cli');

RestCli.get( "http://my.domain.com/api/test" )
.headers( { authorization : "Bearer 1234" } )
.query( { search : "something") } )
.send()
.then( r => { console.log(` StatusCode : ${res.statusCode}\n${res.body}\n${JSON.stringify(res.headers)}`); })
```