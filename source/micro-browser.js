/**
* HMC-soft Micro JS Library Browser module
* @module micro/Browser
*/
define('micro/Browser',function(){
  "use strict";
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

  return $__getBrowserInfo();
});
