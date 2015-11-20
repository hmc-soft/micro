/* jshint ignore:start */
if (/^u/.test(typeof define)) { // no AMD support available ? define a minimal version
  (function(def){
    var require = this['require'] = function(name) { return def[name]; };
    this['define'] = function(name, f) { def[name] = def[name] || f(require); };
  })({});
}
/* jshint ignore:end */
