/* global module:false, require:true, __dirname:true */
var fs = require('fs');
var path = require('path');
var util = require('util');

module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    config: {
      folder: 'temp',
      port: 8888,
      livereload: 35740
    },

    banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',

    clean: {
      dev: ['<%= config.folder %>']
    },

    imagemin: { // Task
      dynamic: { // Another target
        files: [{
          expand: true, // Enable dynamic expansion
          cwd: 'src/images', // Src matches are relative to this path
          src: ['**/*.{png,jpg,gif,ico,bmp}'], // Actual patterns to match
          dest: 'src/images' // Destination path prefix
        }]
      }
    },

    jshint: {
      options: {
        jshintrc: true
      }
    },

    concat: {
      options: {
        stripBanners: true
      },
      css: {
        src: ['vendor/swiper/swiper.css', 'src/css/base.css', 'src/css/icons.css'],
        dest: '<%= config.folder %>/css/base.css'
      },
      js: {
        src: ['vendor/zepto/zepto.js', 'vendor/swiper/swiper.js', 'src/js/base.js'],
        dest: '<%= config.folder %>/js/base.js'
      }
    },

    cssmin: {
      dev: {
        files: [{
          expand: true, // Enable dynamic expansion
          cwd: '<%= config.folder %>/css', // Src matches are relative to this path
          src: ['**/*.css'], // Actual patterns to match
          dest: '<%= config.folder %>/css' // Destination path prefix
        }]
      }
    },

    uglify: {
      options: {
        banner: '<%= banner %>',
        enclose: {}
      },
      js: {
        files: [{
          expand: true, // Enable dynamic expansion
          cwd: '<%= config.folder %>/js', // Src matches are relative to this path
          src: ['**/*.js'], // Actual patterns to match
          dest: '<%= config.folder %>/js' // Destination path prefix
        }]
      }
    },

    px2rem: {
      options: {
        ignore0: false,
        ignore0: false,
      },
      css: {
        files: [{
          expand: true, // Enable dynamic expansion
          cwd: '<%= config.folder %>/css', // Src matches are relative to this path
          src: ['**/*.css'], // Actual patterns to match
          dest: '<%= config.folder %>/css' // Destination path prefix
        }]
      }
    },

    watch: {
      options: {
        livereload: '<%= config.livereload%>'
      },
      sync: {
        files: ['src/**/*'],
        tasks: ['sync']
      },
      css: {
        files: ['src/css/**/*.css', '!src/css/icons.css'],
        tasks: ['px2rem']
      },
      icons: {
        files: ['src/images/icons/*.png'],
        tasks: ['autoicons']
      },
      combineCss: {
        files: '<%= concat.css.src%>',
        tasks: ['concat:css', 'px2rem']
      },
      combineJs: {
        files: '<%= concat.js.src%>',
        tasks: ['concat:js']
      }
    },

    connect: {
      dev: {
        options: {
          // 经过测试 connect插件会依照base的定义顺序检索文件
          // 这意味着如果存在相同文件，定义在前面的会优先返回
          base: ['.', '<%= config.folder %>'],
          port: '<%= config.port %>',
          // open: 'http://127.0.0.1:<%= config.port %>',
          livereload: '<%= config.livereload%>',
          hostname: '*'
        }
      }
    },

    sync: {
      src2dest: {
        files: [{
          expand: true,
          cwd: 'src',
          src: ['**'],
          dest: '<%= config.folder %>'
        }]
      }
    },

    autoicons: {
      options: {
        rename: function (name) {
          if (name.indexOf('-active') !== -1) {
            var base = name.replace('-active', '');
            name = name + ', :active > .icon-' + base + ', .active > .icon-' + base;
          }
          return name;
        },
        repath: function (path) {
          return path.replace('src/', '../');
        }
      },
      icons: {
        src: 'src/images/icons/*.png',
        dest: 'src/css/icons.css'
      }
    }
  });

  // 开发
  grunt.registerTask('default', function () {
    grunt.config('config.folder', 'temp');
    grunt.task.run([
      'autoicons',
      'clean:dev',
      'sync',
      'concat',
      'px2rem',
      'connect',
      'watch'
    ]);
  });

  // 打包
  grunt.registerTask('dist', function () {
    grunt.config('config.folder', 'dist');
    grunt.task.run([
      'autoicons',
      'clean:dev',
      'sync',
      'concat',
      'px2rem',
      'cssmin',
      'uglify'
    ]);
  });

  // 语法检查
  grunt.registerTask('hint', function () {
    grunt.config('config.folder', 'temp');
    grunt.task.run(['clean:dev', 'html2js:dev', 'concat:alljs', 'jshint:dev']);
  });

};
