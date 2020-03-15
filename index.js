var URL = require("url");
// Helper class to perform HTTP REST Requests;

class RestRequest {
    constructor(method, in_url) {
        this.opts =  URL.parse(in_url);
        this.opts.method = method;
        this.opts.headers={};
        this.opts.body=null;
        this.opts.query;
    }
    static get(url) {
        return new RestRequest("GET", url);
    }
    static put(url) {
        return new RestRequest("PUT", url);
    }
    static post(url) {
        return new RestRequest("POST", url);
    }
    static patch(url) {
        return new RestRequest("PATCH", url);
    }
    static delete(url) {
        return new RestRequest("DELETE", url);
    }
    headers(in_hdr){
        this.opts.headers = Object.assign( this.opts.headers, in_hdr);
        return this;
    }
    query(in_query_params){
        this.opts.query = in_query_params ;
        return this;
    }    
    form(in_form){
        let tmp = []
        Object.keys(in_form).forEach( k => tmp.push(k +"="+encodeURIComponent(in_form[k])));
        this.opts.body = tmp.join("&");
        this.opts.headers["Content-Type"] = "application/x-www-form-urlencoded";
        this.opts.headers["Content-Length"] = this.opts.body.length;
        return this;
    }
    json( in_json ) {
        this.opts.body = JSON.stringify(in_json);
        this.opts.headers["Content-Type"] = "application/json";
        this.opts.headers["Content-Length"] = this.opts.body.length;
        return this;
    }
    async send(){ 
        let httx = this.opts.protocol.match(/^https/) ? require("https") : require("http");
        if (this.opts.query) {
            let tmp = []
            Object.keys(this.opts.query).forEach( k => tmp.push(k +"="+encodeURIComponent(this.opts.query[k])));
            tmp.join("&");
            this.opts.path = [this.opts.path, tmp].join("?");
        }
        return new Promise( (resolve, reject) => {
            var req = httx.request(this.opts, (res) => {
                var body_result = "";
                var results = {};
                results.statusCode = res.statusCode;
                results.headers = res.headers;
                results.body=null;
                res.on('data', (chunk) => { body_result += chunk;}); 
                res.on('end', () =>  { 
                    if (results.statusCode == 200) {
                        if ( /json/.test(results.headers["content-type"]) ) {
                            results.body = JSON.parse(body_result);
                        } else {
                            results.body = body_result;
                        }
                    }
                    resolve(results);
                });
            });
            req.on("error", e => {
                reject(e);
            });
            if ( this.opts.body && this.opts.body.length > 0 ) {
                req.write( this.opts.body );
            } else {
                req.end();
            }
        });
    }
}
module.exports = RestRequest;
