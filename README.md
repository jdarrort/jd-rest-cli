# Class to perform REST Requests

Usage
```javascript
RestCli = require('jd-rest-cli');

RestCli.get( "http://my.domain.com/api/test" )
.headers( { authorization : "Bearer 1234" } )
.options({timeout : 20}) 
.query( { search : "something") } )
.send()
.then( r => { console.log(` StatusCode : ${res.statusCode}\n${res.body}\n${JSON.stringify(res.headers)}`); })

RestCli.get( "http://my.domain.com/api/test" )
.form({ input1 : 1, input2 : 2})
.send()
.then( r => { console.log(` StatusCode : ${res.statusCode}\n${res.body}\n${JSON.stringify(res.headers)}`); })

RestCli.get( "http://my.domain.com/api/test" )
.send({
    jsonBodyAttr1: 1,
    jsonBodyAttr2: "tata"
})
.then( r => { return r; })

```