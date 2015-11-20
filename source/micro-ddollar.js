define('micro/$$',function(){
  var $$ = function (className,root) {
    var x = (root ? root : document);
    if(!('getElementsByClassName' in x)) {
      return document.getElementsByClassName(className,root);
    }
    return x.getElementsByClassName(className);
  };
  $$.tags = function (tagName,root) {
    var x = (root ? root : document);
    return x.getElementsByTagName(tagName);
  };
  return $$;
});
