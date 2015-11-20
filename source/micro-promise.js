define('micro/Promise',function(){
  "use strict";
  var Promise = function (runme) {
    this._pass = this._fail = this._always = null;
    this._runthis = runme.bind(this);

    /**
    * function to run if the promise is successful.
    * @member
    * @memberof Promise.prototype
    */
    this.prototype.then = function(f) {
      if(f !== null && f !== undefined) {
        this._pass = f.bind(this);
      }
      return this;
    };

    /**
    * function to run if the promise fails.
    */
    this.prototype.orelse = function(f) {
      if(f !== null && f !== undefined) {
        this._fail = f.bind(this);
      }
      return this;
    };

    /**
    * run this function after success or failure.
    */
    this.prototype.always = function(f) {
      if(f !== null && f !== undefined) {
        this._always = f.bind(this);
      }
      return this;
    };

    /**
    * used by the main function to report success or failure.
    */
    this.prototype.fire = function(pass,msg) {
      if(pass) {
        if(this._pass !== null)
          this._pass(msg);
      } else {
        if(this._fail !== null)
          this._fail(msg);
      }
    };

    /**
    * run the main function and process the promise.
    */
    this.prototype.go = function(p) {
      if(this._runthis !== null && this._runthis !== undefined) {
        try {
          this._runthis(p);
        } catch(e) {
          this.fire(false,e.message);
        }
      }
      if(this._always) this._always();
    };

    return this;
  };
  return Promise;
});
