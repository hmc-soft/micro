define('micro/Element',function(){
  var _ = require('micro/_');
  var $ = require('micro/$');
  var $$ = require('micro/$$');
  
  var E = function (tag,attr,children) {
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

  E.carosel = function (headers,content,delay,func) {
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

  E.tabs = function (headers,content,func) {
    E.carosel(headers,content,0,func);
  };

  return E;
});
