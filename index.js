// Helper class to perform HTTP REST Requests;

class RestRequest {
    constructor(method, in_url) {
        // this._opts =  URL.parse(in_url);
        let opts = new URL(in_url);
        this._opts = {
            host : opts.hostname,
            path : opts.pathname,
            port : opts.port,
            protocol : opts.protocol,
            query: {}
        }
        this._noauth = false;
        this._opts.method = method;
        this._opts.headers={};
        this._opts.body="";
        if (opts.search) {
            let tmp = opts.search.replace(/^\?/,"").split("&");
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
    // Force NOT to exclude Authorization header handler.
    noauth( ) {
        this._noauth = true;
        return this;
    }
    headers(in_hdr){
        this._opts.headers = Object.assign( this._opts.headers, in_hdr);
        return this;
    }
    query(in_query_params = {}){
        Object.entries(in_query_params).forEach(([a,b]) => {
            this._opts.query[a] = b;
        });
        //this._opts.query = Object.assign(this._opts.query, in_query_params);
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
    async send(in_data){ 
        if ( typeof RestRequest._authFn === "function" &&  ! this._opts.headers?.Authorization && !this._noauth) {
            this._opts.headers.Authorization = await RestRequest._authFn();

        }
        if (in_data){
            if (typeof in_data === "object") {
                this._opts.body = JSON.stringify(in_data);
            } else if (typeof in_data === "string") {
                this._opts.body = in_data;
            }
        }        
        this._opts.headers["Content-Length"] = this._opts.body.length;
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
                results.body=null;
                res.on('data', (chunk) => { body_result += chunk;}); 
                res.on('end', () =>  { 
                    try {
                        if ( /json/.test(results.headers["content-type"]) ) {
                            results.body = JSON.parse(body_result);
                        } else {
                            results.body = body_result;
                        }
                    } catch(e) {}
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
RestRequest._authFn = null;
RestRequest.setAuthHandler = function(auth_fn) {
    RestRequest._authFn = auth_fn;
}

module.exports = RestRequest;
