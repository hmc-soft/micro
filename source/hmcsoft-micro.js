/**
* HMC-soft's Micro JS Library
* @module hmcsoft-micro
*/

/**
* Boolean determining if extra information is logged to the console.
*/
var __showDebugMessages = true;

/* jshint ignore:start */
if (/^u/.test(typeof define)) { // no AMD support available ? define a minimal version
  (function(def){
    var require = this['require'] = function(name) { return def[name]; };
    this['define'] = function(name, f) { def[name] = def[name] || f(require); };
  })({});
}
/* jshint ignore:end */

define("hmcsoft-micro",function() {

  "use strict";
  if (/^u/.test(typeof Function.attempt)) {
    /**
    * attempts to run a sequence of functions returning the first none failing.
    */
    Function.attempt = function(){
      for (var i = 0, l = arguments.length; i < l; i++){
        try {
          return arguments[i]();
        } catch (e){}
      }
      return null;
    };
  }
  if(!Date.now) {
    /**
    * Polyfill for older browsers without Date.now
    */
    Date.now = function now() {
      return new Date().getTime();
    };
  }
  if(!('getElementsByClassName' in document)) {
    /**
    * Polyfill for getElementsByClassName
    */
    document.getElementsByClassName = function( classname, node) {
      var a = [];
      var re = new RegExp('(^| )'+classname+'( |$)');
      var els = (node || document).getElementsByTagName("*");
      for(var i=0,j=els.length; i<j; i++)
          if(re.test(els[i].className))a.push(els[i]);
      return a;
    };
  }
  var __raf = window.requestAnimationFrame;

  if(!('requestAnimationFrame' in window)) {
    __raf = function(f) {
      setTimeout(function() {
        f(Date.now());
      },16);
    };
  }

  var microRet = {};

  /**
  * Simple *mostly* ES6 compatible Promise
  * @param runme function to run
  * @class
  */
  microRet.Promise = function (runme) {
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

  var $__getBrowserInfo = function() {
    var ua = navigator.userAgent.toLowerCase(),
      platform = navigator.platform.toLowerCase(),
      UA = ua.match(/(opera|ie|firefox|chrome|edge|version)[\s\/:]([\w\d\.]+)?.*?(safari|version[\s\/:]([\w\d\.]+)|$)/) || [null, 'unknown', 0],
      mode = UA[1] == 'ie' && document.documentMode,
      isEdge = ua.match(/(edge)[\s\/:]([\w\d\.]+)?.*?(safari|version[\s\/:]([\w\d\.]+)|$)/);

    var Browser = {
      name: (UA[1] == 'version') ? UA[3] : (isEdge ? 'edge' : UA[1]),
      version: mode || parseFloat((UA[1] == 'opera' && UA[4]) ? UA[4] : (isEdge ? isEdge[2] : UA[2])),
      Platform: {
        name: ua.match(/ip(?:ad|od|hone)/) ? 'ios' : (ua.match(/(?:webos|android)/) || platform.match(/mac|win|linux/) || ['other'])[0]
      },
      Features: {
        xpath: !!(document.evaluate),
        air: !!(window.runtime),
        query: !!(document.querySelector),
        json: !!(window.JSON)
      },
      Plugins: {}
    };

    Browser[Browser.name] = true;
    Browser[Browser.name + parseInt(Browser.version, 10)] = true;
    Browser.Platform[Browser.Platform.name] = true;

    Browser.Request = (function(){

      var XMLHTTP = function(){
        return new XMLHttpRequest();
      };

      var MSXML2 = function(){
        return new ActiveXObject('Msxml2.XMLHTTP.3.0');
      };

      var MSXML = function(){
        return new ActiveXObject('Microsoft.XMLHTTP');
      };

      return Function.attempt(function(){
        XMLHTTP();
        return XMLHTTP;
      }, function(){
        MSXML2();
        return MSXML2;
      }, function(){
        MSXML();
        return MSXML;
      });

    })();

    Browser.Features.xhr = !!(Browser.Request);

    var version = (Function.attempt(function(){
      return navigator.plugins['Shockwave Flash'].description;
    }, function(){
      return new ActiveXObject('ShockwaveFlash.ShockwaveFlash').GetVariable('$version');
    }) || '0 r0').match(/\d+/g);

    Browser.Plugins.Flash = {
      version: Number(version[0] || '0.' + version[1]) || 0,
      build: Number(version[2]) || 0
    };

    return Browser;
  };

  microRet.Browser = $__getBrowserInfo();

  if(microRet.Browser.ie && microRet.Browser.version < 8) {
    if (!document.querySelectorAll) { // IE7 querySelector hack
      document.querySelectorAll = function (selector) {
          var head = document.documentElement.firstChild; // takes <head> tag
          var styleTag = document.createElement("STYLE"); // creates a new <style> tag
          head.appendChild(styleTag);
          document.arrayOfSelectorNodes = [];

          styleTag.styleSheet.cssText = selector + "{x:expression(document.arrayOfSelectorNodes.push(this))}";
          // the next line forces DOM tree to reload and and CCS to execute
          window.scrollBy(1, 0);
          head.removeChild(styleTag);
          window.scrollBy(-1, 0);
          return document.arrayOfSelectorNodes;
      };
    }
  }

  microRet.$ = function (id,root) {
    var x = (root ? root : document);
    return x.getElementById(id);
  };
  microRet.$.on = function (obj,ev,f) {
    if(obj){
      if('addEventListener' in obj) {
        obj.addEventListener(ev,f);
      } else {
        obj['on'+ev] = f;
      }
    }
    return obj;
  };
  microRet.$.off = function(obj,ev,f) {
    if(obj) {
      if('removeEventListener' in obj) {
        obj.removeEventListener(ev,f);
      } else {
        obj['on'+ev] = '';
      }
    }
    return obj;
  };
  microRet.$.attr = function (e,a,s) {
    if(s) {
      e.setAttribute(a,s);
      return s;
    } else {
      return e.getAttribute ? e.getAttribute(a) : null;
    }
  };
  microRet.$.addClass = function (el,v) {
    if(!el) return el;
    if('classList' in el){
      if(!el.classList.contains(v)) {
        el.classList.add(v);
      }
    } else {
      //needed for IE before 10
      if(el.className == v) return el;
      if(el.className.indexOf(' '+v) == -1 || el.className.indexOf(v+' ') == -1) {
        el.className += (' ' + v);
      }
    }
    return el;
  };
  microRet.$.removeClass = function (el,v) {
    if(!el) return el;
    if('classList' in el){
      if(el.classList.contains(v)) {
        el.classList.remove(v);
      }
    } else {
      if(el.className == v) {
        el.className = '';
      } else {
        var classes = el.className.split(' ');
        var out = [];
        $each(classes,function(item){
          if(item != v) {
            out.push(item);
          }
        });
        el.className = classes.join(' ');
      }
    }
    return el;
  };
  microRet.$.prop = function $getProp(el,n,v,d) {
    if(!('properties' in el)) el.properties = {};
    if(v === undefined) {
      if(n in el.properties)
        return el.properties[n];
      return;
    } else {
      if(n in el.properties) {
        if(d === undefined || d === false) {
          el.properties[n] = v;
        } else {
          delete el.properties[n];
        }
      } else {
          el.properties[n] = v;
      }
    }
  };
  microRet.$.debug = function (str) {
    if(__showDebugMessages) console.log(str);
  };
  microRet.$.animate = function (el,val,startv,endv,howLong,cb,uv) {
    var startTime = null;
    var lastTime = 0;
    var stepF;
    var contAni = true;
    var cval = startv;
    var stepV = (Math.abs((endv - startv) /howLong));
    stepF = function(ts) {
      if(!startTime) startTime = ts;
      var p = ts - startTime;
      startTime = ts;
      if(endv > startv) {
        cval = cval + (p * stepV);
        if(cval > endv)
          cval = endv;
      } else {
        cval = cval - (p * stepV);
        if(cval < endv)
          cval = endv;
      }
      el.style[val] = cval + '' + (uv !== undefined ? uv : '');
      if(endv > startv) {
        if(cval >= endv) contAni = false;
      } else {
        if(cval <= endv) contAni = false;
      }
      if(contAni) {
        __raf(stepF);
      } else {
        if(cb !== undefined && cb !== null) {
          cb(el);
        }
      }
    };
    __raf(stepF);
  };
  microRet.$.hide = function (el,t) {
    var howLong = 450;
    if(t !== null && t !== undefined)
      howLong = parseInt(t);
    microRet.$.animate(el,'opacity',1.0,0,howLong,function(i){
      microRet.$.toggle(i);
      i.style.opacity = '';
    });
  };
  microRet.$.show = function (el,t) {
    var howLong = 450;
    if(t !== null && t !== undefined)
      howLong = parseInt(t);
    el.style.opacity = '0';
    microRet.$.toggle(el);
    microRet.$.animate(el,'opacity',0,1.0,howLong,function(i){
      i.style.opacity = '';
    });
  };
  microRet.$.aniToggle = function (el) {
    var val2chk = "block";
    if(el.style.display === val2chk) {
      microRet.$.hide(el);
      return false;
    } else {
      microRet.$.show(el);
      return true;
    }
  };
  microRet.$.toggle = function (el,val) {
    var val2chk = "block";
    if(val !== null && val !== undefined) {
      val2chk = val;
    }
    if(el.style.display === val2chk) {
      el.style.display = "none";
      return false;
    } else {
      el.style.display = val2chk;
      return true;
    }
  };
  microRet.$.after = function(d,f) {
    return {
      'func': clearTimeout,
      'h': setTimeout(f,d)
    };
  };
  microRet.$.every = function(d,f) {
    return {
      'func': clearInterval,
      'h': setInterval(f,d)
    };
  };
  microRet.$.stop = function(h) {
    h.func(h.h);
  };
  microRet.$.request = function (method,url,data_s,settings_r) {
    var $__flattenSubobj = function (arr,base,obj) {
      for (var x in obj) {
        switch(typeof obj[x]) {
          case 'object':
            $__flattenSubobj(arr,base + '['+x+']',obj[x]);
            break;
          default:
            arr.push(base+'['+encodeURIComponent(x)+']' + '=' + encodeURIComponent(obj[x]));
        }
      }
    };
    var $__flattenobj = function (obj){
      var ret = [];
      microRet._.objEach(obj,function(k,v){
        switch(typeof v) {
          case 'object':
            $__flattenSubobj(ret,encodeURIComponent(k),v);
            break;

          default:
            ret.push(encodeURIComponent(k) + '=' + encodeURIComponent(v.toString()));
        }
      });
      return ret.join('&');
    };
    var doRequest = function() {
      try {
        var isPost = (method.toLowerCase() == 'post' ? true : false);
        var xhr = Browser.Request();
        var callbackCalled = 0;
        var rurl = url;
        var data = data_s;
        var fdata = $__flattenobj(data);
        var settings = microRet._.objClone(settings_r);
        if(!isPost && data !== null) {
          rurl = rurl + '?' + fdata;
          data = null;
        }
        xhr.open(method,rurl,true,settings.user,settings.pass);
        if(isPost && data !== null && data !== undefined) {
          xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        }
        if(settings.headers !== null && settings.headers !== undefined) {
          microRet._.objEach(settings.headers,function(k,v){
            xhr.setRequestHeader(k,v);
          });
        }
        if(settings.xhr !== null && settings.xhr !== undefined) {
          microRet._.objEach(settings.xhr,function(k,v){
            xhr[k] = v;
          });
        }
        xhr.onreadystatechange = function() {
          if (xhr.readyState == 4 && !callbackCalled++) { // jshint ignore:line
            if (xhr.status >= 200 && xhr.status < 300)
              fire(true, [xhr.status,xhr.responseText, xhr]);
            else
              fire(false, [xhr.status, xhr.responseText, xhr]);
          }
        };

        xhr.send(fdata);
      } catch(e) {
        this.fire(false,[0,e.message,xhr]);
      }
    };
    if(microRet.Browser.Features.xhr)
      return new microRet.Promise(doRequest);
    return null;
  };

  microRet._ = function(q,r){
    return document.querySelectorAll(q,r);
  };
  microRet._.each = function (arr,func) {
    if(func !== null && func !== undefined) {
      if('forEach' in arr) {
        arr.forEach(func);
        return;
      }
      var a_l = arr.length;
      var con_l = true;
      var ret;
      for( var i = 0; i < a_l; i++ ) {
        if(con_l === true){
          ret = func(arr[i],i,arr);
          if(ret === false) {
            con_l = false;
          }
        }
      }
    }
  };
  microRet._.objEach = function (obj,func) {
    if(func !== null && func !== undefined) {
      for (var okey in obj) {
        func(okey,obj[okey]);
      }
    }
  };
  microRet._.objClone = function (obj) {
    var ret = {};
    microRet._.objEach(obj,function(key,value){
      ret[key] = value;
    });
    return ret;
  };

  microRet.$$ = function (className,root) {
    var x = (root ? root : document);
    if(!('getElementsByClassName' in x)) {
      return document.getElementsByClassName(className,root);
    }
    return x.getElementsByClassName(className);
  };
  microRet.$$.tags = function (tagName,root) {
    var x = (root ? root : document);
    return x.getElementsByTagName(tagName);
  };

  var $ = microRet.$, _ = microRet._, $$ = microRet.$$;
  microRet.E = function (tag,attr,children) {
    var ret = document.createElement(tag);
    _.objEach(attr,function(k,v){
      $.attr(ret,k,v);
    });
    if(children !== undefined){
      if(typeof children === 'string' || typeof children === 'number') {
        ret.innerHTML = children + '';
      } else {
        if(children instanceof Array) {
          _.each(children,function(item,index,array){
            ret.appendChild(item);
          });
        } else {
          ret.appendChild(children);
        }
      }
    }
    return ret;
  };

  var E = microRet.E;


  if(microRet.Browser.ie && microRet.Browser.version < 10) {
    //enable placeholder emulation for older ie.
    var inputs = [];
    _.each($$.tags('textarea'),function(item){
      inputs.push(item);
    });
    var r = new RegExp('radio|checkbox|submit|reset');
    _.each($$.tags('input'),function(item){
      if(!r.test($.attr(item,'type'))) inputs.push(item);
    });
    _each(inputs,function(item){
      var placeholder = $.attr(item,'placeholder');
      if(placeholder === null) return;
      if(item.value === '') item.value = placeholder;
      $.on(item,'focus',function(){
        if(item.value == placeholder) item.value = '';
      });
      $.on(item,'blur',function(){
        if(item.value === '') item.value = placeholder;
      });
    });
    _.each($tags('form'),function(item){
      $.on(item,'submit',function(){
        _.each($$.tags('input',item),function(iitem){
          if(iitem.value == $.attr(iitem,'placeholder')) iitem.value = '';
        });
        _.each($$.tags('textarea',item),function(iitem){
          if(iitem.value == $.attr(iitem,'placeholder')) iitem.value = '';
        });
      });
    });
  }

  microRet.E.carosel = function (headers,content,delay,func) {
    var hnodes = null, cnodes = null, curHnode = null, curCnode = null, stopI = null;
    var $__nextElementSibling = function (el) {
        if (el.nextElementSibling) return el.nextElementSibling;
        do { el = el.nextSibling; } while (el && el.nodeType !== 1);
        return el;
    };
    var headerClickgen = function(hnode,cnode) {
      $.on(hnode,'click',function(){

        if(stopI !== null && delay > 0){
          $.stop(stopI);
          stopI = null;
        }
        $.removeClass($$('highlighted',headers)[0],'highlighted');
        $.removeClass($$('highlighted',content)[0],'highlighted');
        $.addClass(hnode,'highlighted');
        $.addClass(cnode,'highlighted');
        if(func !== null && func !== undefined && delay === 0) {
          func();
        }
      });
    };
    if(headers !== null) {
      if(headers.children.length > 0) {
        hnodes = headers.children[0].children;
      }
    }
    if(content !== null) {
      if(content.children.length > 0) {
        cnodes = content.children[0].children;
        if(headers !== null) {
          _.each(hnodes,function(item,index,array){
            headerClickgen(item,cnodes[index]);
          });
        }
      }
    }
    var rotateC = function() {
      if(hnodes !== null && curHnode === null) {
        curHnode = hnodes[0];
      }
      if(curCnode === null) {
        curCnode = cnodes[0];
      }
      if(headers !== null) {
        if($$('highlighted',headers).length > 0) {
          $.removeClass($$('highlighted',headers)[0],'highlighted');
        }
        $.addClass(curHnode,'highlighted');
        curHnode = $__nextElementSibling(curHnode);
      }
      if(func === null || func === undefined) {
        if(content !== null) {
          if($$('highlighted',content).length > 0) {
            $.removeClass($$('highlighted',content)[0],'highlighted');
          }
          $.addClass(curCnode,'highlighted');
        }
      } else {
        if(content !== null)
          func(curCnode,($__nextElementSibling(curCnode) === null ? cnodes[0] : $__nextElementSibling(curCnode)));
      }
      curCnode = $__nextElementSibling(curCnode);
    };
    if(cnodes !== null && delay > 0) {
      stopI = $.every(delay,rotateC);
    }
    return stopI || null;
  };
  microRet.E.tabs = function (headers,content,func) {
    microRet.E.carosel(headers,content,0,func);
  };

  /**
  * @exports hmcsoft-micro
  */
  return microRet;
});
