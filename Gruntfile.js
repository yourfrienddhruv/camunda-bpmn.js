module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'src/<%= pkg.name %>.js',
        dest: 'build/<%= pkg.name %>.min.js'
      }
    },
    requirejs: {
      compile: {
        options: {
          name : "bpmn/Engine",
          baseUrl: "./",
          packages: [
            { name: "dojo", location: "lib/dojo/dojo" },
            { name: "dojox", location: "lib/dojo/dojox"},
            { name: "bpmn", location: "src/bpmn"}],
          out: "optimized/engine.js"
        }
      }
    }
  });

  // r.js optimizer for requirejs will not work for the renderer, because there are circular dependencie in dojo
  // we will need to use the dojo build tool to create a single file build for that
  grunt.loadNpmTasks('grunt-contrib-requirejs');

  // Default task(s).
  grunt.registerTask('default', ['requirejs']);

};
