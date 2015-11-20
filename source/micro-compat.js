define('micro/compat',function(){
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
    window.requestAnimationFrame = function(f) {
      setTimeout(function() {
        f(Date.now());
      },16);
    };
  }

  var Browser = require('micro/Browser');

  if(Browser.ie && Browser.version < 8) {
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

  var _ = require('micro/_');
  var $ = require('micro/$');
  var $$ = require('micro/$$');

  if(Browser.ie && Browser.version < 10) {
    //enable placeholder emulation for older ie.
    var inputs = [];
    _.each($$.tags('textarea'),function(item){
      inputs.push(item);
    });
    var r = new RegExp('radio|checkbox|submit|reset');
    _.each($$.tags('input'),function(item){
      if(!r.test($.attr(item,'type'))) inputs.push(item);
    });
    _.each(inputs,function(item){
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
});
