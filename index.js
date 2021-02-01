var URL = require("url");
// Helper class to perform HTTP REST Requests;

class RestRequest {
    constructor(method, in_url) {
        // this._opts =  URL.parse(in_url);
        let opts = URL.parse(in_url);
        this._opts = {
            host : opts.hostname,
            path : opts.pathname,
            port : opts.port,
            protocol : opts.protocol,
            query: {}
        }
        this._opts.method = method;
        this._opts.headers={};
        this._opts.body="";
        if (opts.query) {
            let tmp = opts.query.split("&");
            tmp.forEach( t => {
                let idx = t.indexOf("=");
                if (idx > 0) {
                    this._opts.query[t.slice(0,idx)] = t.slice(idx+1);
                }
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
        this._opts.headers["Content-Type"] = "application/json; charset=utf-8";
        return this;
    }
    async send(in_data){ 
        if (in_data){
            if (typeof in_data === "object") {
                this._opts.body = JSON.stringify(in_data);
            } else if (typeof in_data === "string") {
                this._opts.body = in_data;
            }
        }        
        //Buffer.byteLength
        this._opts.headers["Content-Length"] = Buffer.byteLength(this._opts.body); // Can not use 'this._opts.body.length', cause some char uses more than 1 byte over http/utf8;
        let httx = this._opts.protocol.match(/^https/) ? require("https") : require("http");
        if (Object.keys(this._opts.query).length) {
            let tmp = Object.entries(this._opts.query).map(kv => kv.map(encodeURIComponent).join("=")).join("&")            
            this._opts.path = [this._opts.path, tmp].join("?");
        }
        return new Promise( (resolve, reject) => {
            var req = httx.request(this._opts, (res) => {
                var body_result = "";
                var results = {};
                results.statusCode = res.statusCode;
                results.headers = res.headers;
                results.body = null;
                res.on('data', (chunk) => { body_result += chunk;}); 
                res.on('end', () =>  { 
                    if (results.statusCode > 299) {return reject(results)}
                    if ( /json/.test(results.headers["content-type"]) ) {
                        results.body = JSON.parse(body_result);
                    } else {
                        results.body = body_result;
                    }
                    return resolve(results.body);
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
