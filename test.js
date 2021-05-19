const express = require('express');

const RestCli = require('./index');

//----------------------------------------------
const app = express();
// app.use( express.urlencoded({ extended: false }) );
app.use((req, res, next) => {
    console.log(`url : ${req.url}`);
    console.log(`query : ${JSON.stringify(req.query || {}, null, 2)}`);
    console.log(`headers : ${JSON.stringify(req.headers || {}, null, 2)}`);
    res.status(200).json({OK : 'OK'});
})
let host = process.argv[2];

let Bearer = "Bearer ";
RestCli.setAuthHandler(function() {
    return Bearer+"test";
});

app.listen( 5719, () => {
     RestCli.get("http://localhost:5719/test?id=123").query({special : "My Special"}).send()
    // RestCli.get("http://localhost:5719/test?id=123").noauth().query({special : "My Special"}).send()
    .then((d) => {
        console.log(d);
        process.exit();
    })
})



