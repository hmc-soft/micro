module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'bin/built.js',
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
	},
  concat: {
    dist: {
      src: ['source/**/*.js'],
      dest: 'bin/built.js',
    }
  },
  clean: {
    js: ["bin/*.js", "!bin/*.min.js"]
  }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-jsdoc');

  // Default task(s).
  grunt.registerTask('default', ['jshint','concat','uglify','clean','jsdoc']);

};
