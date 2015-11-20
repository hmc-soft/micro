define('micro/$',function(){
  var Browser = require('micro/Browser');
  var _ = require('micro/_');
  var Promise = require('micro/Promise');

  var $ = function (id,root) {
    var x = (root ? root : document);
    return x.getElementById(id);
  };
  $.on = function (obj,ev,f) {
    if(obj){
      if('addEventListener' in obj) {
        obj.addEventListener(ev,f);
      } else {
        obj['on'+ev] = f;
      }
    }
    return obj;
  };
  $.off = function(obj,ev,f) {
    if(obj) {
      if('removeEventListener' in obj) {
        obj.removeEventListener(ev,f);
      } else {
        obj['on'+ev] = '';
      }
    }
    return obj;
  };
  $.attr = function (e,a,s) {
    if(s) {
      e.setAttribute(a,s);
      return s;
    } else {
      return e.getAttribute ? e.getAttribute(a) : null;
    }
  };
  $.addClass = function (el,v) {
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
  $.removeClass = function (el,v) {
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
        _.each(classes,function(item){
          if(item != v) {
            out.push(item);
          }
        });
        el.className = classes.join(' ');
      }
    }
    return el;
  };
  $.prop = function $getProp(el,n,v,d) {
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
  $.debug = function (str) {
    if(__showDebugMessages) console.log(str);
  };
  $.animate = function (el,val,startv,endv,howLong,cb,uv) {
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
  $.hide = function (el,t) {
    var howLong = 450;
    if(t !== null && t !== undefined)
      howLong = parseInt(t);
    $.animate(el,'opacity',1.0,0,howLong,function(i){
      $.toggle(i);
      i.style.opacity = '';
    });
  };
  $.show = function (el,t) {
    var howLong = 450;
    if(t !== null && t !== undefined)
      howLong = parseInt(t);
    el.style.opacity = '0';
    $.toggle(el);
    $.animate(el,'opacity',0,1.0,howLong,function(i){
      i.style.opacity = '';
    });
  };
  $.aniToggle = function (el) {
    var val2chk = "block";
    if(el.style.display === val2chk) {
      $.hide(el);
      return false;
    } else {
      $.show(el);
      return true;
    }
  };
  $.toggle = function (el,val) {
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
  $.after = function(d,f) {
    return {
      'func': clearTimeout,
      'h': setTimeout(f,d)
    };
  };
  $.every = function(d,f) {
    return {
      'func': clearInterval,
      'h': setInterval(f,d)
    };
  };
  $.stop = function(h) {
    h.func(h.h);
  };
  $.request = function (method,url,data_s,settings_r) {
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
      _.objEach(obj,function(k,v){
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
        var settings = _.objClone(settings_r);
        if(!isPost && data !== null) {
          rurl = rurl + '?' + fdata;
          data = null;
        }
        xhr.open(method,rurl,true,settings.user,settings.pass);
        if(isPost && data !== null && data !== undefined) {
          xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        }
        if(settings.headers !== null && settings.headers !== undefined) {
          _.objEach(settings.headers,function(k,v){
            xhr.setRequestHeader(k,v);
          });
        }
        if(settings.xhr !== null && settings.xhr !== undefined) {
          _.objEach(settings.xhr,function(k,v){
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
    if(Browser.Features.xhr)
      return new Promise(doRequest);
    return null;
  };
});
