# Class to perform REST Requests

Usage
```javascript
RestCli = require('jd-rest-cli');

RestCli.get( "http://my.domain.com/api/test" )
.opts({timeout : 20}) 
.headers( { authorization : "Bearer 1234" } )
.query( { search : "something") } )
.send()
.then( r => { console.log(` StatusCode : ${res.statusCode}\n${res.body}\n${JSON.stringify(res.headers)}`); })

RestCli.get( "http://my.domain.com/api/test" )
.form({ input1 : 1, input2 : 2})
.send()
.then( r => { console.log(` StatusCode : ${res.statusCode}\n${res.body}\n${JSON.stringify(res.headers)}`); })

RestCli.get( "http://my.domain.com/api/test" )
.json({
    jsonBodyAttr1: 1,
    jsonBodyAttr2: "tata"
})
.send()
.then( r => { return r; })


RestCli.get( "http://my.domain.com/api/test" )
.send("Something")
.then( r => { return r; })

```

Possibility to set an external Authorization Header handler (async)
```javascript
RestCli.setAuthHandler(async function() { return "Bearer MyComputedBearer})
// and to inhibit for a specific call (for exemple the one to retrieve external AccessToken)
RestCli.post("http://localhost").noauth().send();
```

return object with 
 - statusCode : int
 - headers : object
 - body  : (mixed) : converted to JSON if response content-type contains json