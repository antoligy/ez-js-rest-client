module.exports = function(grunt) {

    var qPath = {
            "q": "../node_modules/q/q"
        },
        testPaths = {
            "q": "../node_modules/q/q",
            "jasmineCAPIMatchers": "../test/jasmine/CAPIMatchers"
        },
        coveragePaths = {
            "q": "../node_modules/q/q",
            "jasmineCAPIMatchers": "../../../test/jasmine/CAPIMatchers"
        };

    grunt.initConfig({
        requirejs: {
            dist: {
                options: {
                    almond: true,
                    name : 'PromiseCAPI',
                    optimize: "none",
                    baseUrl: "src/",
                    paths: qPath,
                    out: "dist/CAPI.js",
                    wrap: {
                        startFile: 'wrap/wrap.start.js',
                        endFile: 'wrap/wrap.end.js'
                    }
                }
            },
            distmin: {
                options: {
                    almond: true,
                    name : 'PromiseCAPI',
                    optimize: "uglify",
                    baseUrl: "src/",
                    paths: qPath,
                    out: "dist/CAPI-min.js",
                    wrap: {
                        startFile: 'wrap/wrap.start.js',
                        endFile: 'wrap/wrap.end.js'
                    }
                }
            },
            testBundle: {
                options: {
                    almond: true,
                    name : 'PromiseCAPI',
                    optimize: "none",
                    baseUrl: "src/",
                    paths: qPath,
                    out: "test/manual/jsRestClientBundle/Resources/public/js/CAPI.js",
                    wrap: {
                        startFile: 'wrap/wrap.start.js',
                        endFile: 'wrap/wrap.end.js'
                    }
                }
            }
        },
        jshint: {
            options: {
                jshintrc: 'jshint.json'
            },
            all: ['src/*.js', 'src/*/*.js', 'test/*.tests.js', 'test/jasmine/*.js']
        },
        instrument : {
            files : ['src/*.js','src/*/*.js'],
            options : {
                basePath : 'test/instrument'
            }
        },
        jasmine: {
            options: {
                specs: 'test/*.tests.js',
                template: require('grunt-template-jasmine-requirejs'),
                templateOptions: {
                    requireConfig: {
                        baseUrl: 'src/',
                        paths: testPaths
                    }
                }
            },
            test: {
                //Default options
            },
            coverage: {
                options: {
                    template: require('grunt-template-jasmine-istanbul'),
                    templateOptions: {
                        coverage: 'test/coverage/coverage.json',
                        report: [{
                            type: 'text-summary'
                        }, {
                            type: 'lcov',
                            options: {
                                dir: 'test/coverage'
                            }
                        }],
                        template: require('grunt-template-jasmine-requirejs'),
                        templateOptions: {
                            requireConfig: {
                                baseUrl: 'test/instrument/src/',
                                paths: coveragePaths
                            }
                        }
                    }
                }
            }
        },
        pkg: grunt.file.readJSON('package.json'),
        yuidoc: {
            compile: {
                name: '<%= pkg.name %>',
                description: '<%= pkg.description %>',
                version: '<%= pkg.version %>',
                url: '<%= pkg.repository %>',
                logo: "http://ez.no/extension/ez_ezno/design/ezno_2011/images/ez-logo.png",
                options: {
                    paths: 'src/',
                    outdir: 'api/'
                }
            }
        },
        shell: {
            livedoc: {
                command: 'yuidoc --server 3000 --config yuidoc.json',
                options: {
                    stdout: true,
                    stderr: true
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-requirejs');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-istanbul');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-yuidoc');
    grunt.loadNpmTasks('grunt-shell');

    grunt.registerTask('hint', ['jshint']);
    grunt.registerTask('build', ['jshint', 'requirejs']);
    grunt.registerTask('test', ['jshint', 'jasmine:test'] );
    grunt.registerTask('coverage', ['jshint', 'instrument', 'jasmine:coverage'] );
    grunt.registerTask('doc', ['yuidoc'] );
    grunt.registerTask('livedoc', ['shell:livedoc'] );

};