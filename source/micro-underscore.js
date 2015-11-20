define('micro/_',function(){
  var _ = function(q,r){
    return document.querySelectorAll(q,r);
  };
  _.each = function (arr,func) {
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
  _.objEach = function (obj,func) {
    if(func !== null && func !== undefined) {
      for (var okey in obj) {
        func(okey,obj[okey]);
      }
    }
  };
  _.objClone = function (obj) {
    var ret = {};
    _.objEach(obj,function(key,value){
      ret[key] = value;
    });
    return ret;
  };
  return _;
});
