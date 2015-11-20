/**
* HMC-soft's Micro JS Library
* 
* This module is a catch all that returns an object containing each sub module.
* @module micro
*/

define("micro",function() {

  require('micro/compat');
  /**
  * @exports micro
  */
  return {
    $: require('micro/$'),
    $$: require('micro/$$'),
    _: require('micro/_'),
    E: require('micro/Element'),
    Browser: require('micro/Browser')
  };
});
