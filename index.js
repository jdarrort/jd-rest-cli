var URL = require("url");
// Helper class to perform HTTP REST Requests;

class RestRequest {
    constructor(method, in_url) {
        this._opts =  URL.parse(in_url);
        this._opts.method = method;
        this._opts.headers={};
        this._opts.body="";
        if (this._opts.query) {
            let tmp = this._opts.query.split("&");
            this._opts.query={};
            tmp.forEach( t => {
                let tmp2 = t.split("=");
                this._opts.query[tmp2[0]] = tmp2[1];
            })
        }
        this._opts.query = this._opts.query || {};
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
    opts(in_opts){
        this._opts = Object.assign( this._opts, in_opts);
        return this;
    }

    headers(in_hdr){
        this._opts.headers = Object.assign( this._opts.headers, in_hdr);
        return this;
    }
    query(in_query_params){
        this._opts.query = Object.assign(this._opts.query, in_query_params);
        return this;
    }    
    form(in_form){
        let tmp = []
        Object.keys(in_form).forEach( k => tmp.push(k +"="+encodeURIComponent(in_form[k])));
        this._opts.body = tmp.join("&");
        this._opts.headers["Content-Type"] = "application/x-www-form-urlencoded";
        return this;
    }
    json( in_json ) {
        this._opts.body = JSON.stringify(in_json);
        this._opts.headers["Content-Type"] = "application/json";
        return this;
    }
    async send(){ 
        this._opts.headers["Content-Length"] = this._opts.body.length;
        let httx = this._opts.protocol.match(/^https/) ? require("https") : require("http");
        if (this._opts.query) {
            let tmp = []
            Object.keys(this._opts.query).forEach( k => tmp.push(k +"="+encodeURIComponent(this._opts.query[k])));
            tmp.join("&");
            this._opts.path = [this._opts.path, tmp].join("?");
        }
        return new Promise( (resolve, reject) => {
            var req = httx.request(this._opts, (res) => {
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
            if ( this._opts.body && this._opts.body.length > 0 ) {
                req.write( this._opts.body );
            } else {
                req.end();
            }
        });
    }
}
module.exports = RestRequest;
