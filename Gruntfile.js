/* global module:false, require:true, __dirname:true */

module.exports = function (grunt) {
  // load all grunt tasks matching the `grunt-*` pattern
  require('load-grunt-tasks')(grunt);

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),

    config: {
      folder: 'temp',
      port: 8080,
      livereload: 35741
    },

    banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',

    jshint: {
      options: {
        jshintrc: true
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      dev: {
        src: ['src/**/*.html', 'src/**/*.css', 'src/**/*.js']
      }
    },

    html2js: {
      options: {
        module: 'templates',
        rename: function (name) {
          return name.replace('../app/', '');
        }
      },
      dev: {
        src: ['app/**/templates/**/*.html'],
        dest: 'app/templates.js'
      }
    },
    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>',
        enclose: {}
      }
    },
    cssmin: {
      dev: {
        options: {
          banner: '<%= banner %>'
        },
        files: {
          '<%= config.folder %>/app.min.css': ['app/app.css']
        }
      }
    },
    watch: {
      options: {
        livereload: '<%= config.livereload%>'
      },
      js: {
        files: ['<%= jshint.dev.src %>'],
        tasks: []
      }
    },
    connect: {
      dev: {
        options: {
          base: ['<%= config.folder %>'],
          port: '<%= config.port %>',
          open: 'http://127.0.0.1:<%= config.port %>/works/participants.html',
          // keepalive: true,
          // livereload: '<%= config.livereload%>',
          hostname: '*',
          middleware: function (connect, options, middlewares) {
            var ssInclude = require("connect-include");

            middlewares.unshift(function (req, res, next) {
              req.url = req.url.replace(/assets/, '/');
              return next();
            });

            return middlewares;
          }
        }
      }
    },
    copy: {
      dev: {
        files: [{
          expand: true,
          cwd: 'app',
          src: ['index.html', '**/*.{ico,png,txt,gif,jpg,jpeg,css,svg,eot,ttf,woff,json}'],
          dest: '<%= config.folder %>'
        }]
      },
      css: {
        files: [{
          expand: true,
          cwd: 'app',
          src: '**/*.css',
          dest: '<%= config.folder %>'
        }]
      },
      images: {
        files: [{
          expand: true,
          cwd: 'app/images',
          src: '**/*',
          dest: '<%= config.folder %>/images'
        }]
      }
    },
    clean: {
      dev: ['<%= config.folder %>']
    },
    imagemin: { // Task
      dynamic: { // Another target
        files: [{
          expand: true, // Enable dynamic expansion
          cwd: 'app/images', // Src matches are relative to this path
          src: ['**/*.{png,jpg,gif}'], // Actual patterns to match
          dest: 'dist/images' // Destination path prefix
        }]
      }
    }
  });

  // 开发
  grunt.registerTask('default', function () {
    grunt.config('config.folder', 'src');
    grunt.task.run(['connect:dev', 'watch']);
  });

};