module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'source/<%= pkg.name %>.js',
        dest: 'bin/<%= pkg.name %>.min.js'
      }
    },
	jshint: {
		all: ['source/**/*.js']
	},
	jsdoc: {
		dist: {
			src: ['source/**/*.js'],
			options: {
				destination: 'docs'
			}
		}
	}
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-jsdoc');

  // Default task(s).
  grunt.registerTask('default', ['jshint','uglify','jsdoc']);

};