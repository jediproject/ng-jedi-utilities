﻿    angular.module("jedi.utilities.directives", []).directive("jdSlimScroll", [function () {
        return {
            restrict: "A",
            link: function (scope, ele, attrs) {
                return ele.slimScroll({
                    height: attrs.scrollHeight || "100%"
                });
            }
        };
    }]).directive("jdValidateEquals", [function () {
        return {
            require: "ngModel",
            link: function (scope, ele, attrs, ngModelCtrl) {
                var me = attrs.ngModel;
                var matchTo = attrs.jdValidateEquals;

                scope.$watch(me, function (value) {
                    if (value) {
                        ngModelCtrl.$setValidity('equal', scope.$eval(me) === scope.$eval(matchTo));
                    } else {
                        ngModelCtrl.$setValidity('equal', true);
                    }
                });

                scope.$watch(matchTo, function (value) {
                    ngModelCtrl.$setValidity('equal', scope.$eval(me) === scope.$eval(matchTo));
                });
            }
        }
    }]).directive("jdFullScreenPage", function () {
        return {
            restrict: "A",
            controller: ["$scope", "$element", "$location", 'jedi.utilities.UtilitiesConfig', function ($scope, $element, $location, UtilitiesConfig) {
                var clazz = $element.attr('jd-full-screen-page-class');
                if (!clazz) {
                    clazz = UtilitiesConfig.wideClass;
                    if (!clazz) {
                        clazz = 'body-wide';
                    }
                }
                var selector = $element.attr('jd-full-screen-page-element');
                if (!selector) {
                    selector = UtilitiesConfig.wideSelectorElement;
                    if (!selector) {
                        selector = 'body';
                    }
                }

                jQuery(selector).addClass(clazz);

                $scope.$watch(function () {
                    return $location.path();
                }, function (newVal, oldVal) {
                    if (newVal !== oldVal) {
                        jQuery(selector).removeClass(clazz);
                    }
                });
            }]
        };
    }).directive('jdDynamicDirective', ['$compile', '$interpolate', function ($compile, $interpolate) {
        return {
            restrict: 'A',
            compile: function (element, attrs) {
                var appDynamicDirective = element.attr('jd-dynamic-directive');
                element.removeAttr('jd-dynamic-directive');
                if (appDynamicDirective) {
                    // remove conteúdo do elemento para aplicar as diretivas e recompilar
                    var children = element.children();
                    element.empty();
                    return {
                        pre: function (scope, element) {
                            // atribui as diretivas novas
                            if (appDynamicDirective.indexOf('{{') > -1) {
                                appDynamicDirective = $interpolate(appDynamicDirective)(scope);
                            }
                            var _attrs = appDynamicDirective.split('|');
                            angular.forEach(_attrs, function (_attr) {
                                var _attr = _attr.split('=');
                                element.attr(_attr[0], _attr.length > 1 ? _attr[1] : '');
                            });
                        },
                        post: function (scope, element) {
                            // adiciona o conteúdo do elemento novamente
                            element.append(children);
                            // recompila
                            $compile(element)(scope);
                        }
                    };
                }
            }
        }
    }]).directive('jdInterpolateFormat', ['$interpolate', function ($interpolate) {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {
                //TODO henriqueb adicionar capacidade de lidar com arrays e etc - improvement
                var appInterpolateFormat = element.attr('jd-interpolate-format');
                ngModel.$formatters.push(function (value) {
                    return $interpolate(appInterpolateFormat)(value);
                });
            }
        };
    }]).directive('jdAsyncValidate', ['$q', function ($q) {
        return {
            require: 'ngModel',
            link: function (scope, element, attrs, ctrl) {
                ctrl.$asyncValidators.jdAsyncValidate = function (modelValue, viewValue) {
                    return $q(function (resolve, reject) {
                        scope.$eval(attrs.jdAsyncValidate)(modelValue, viewValue, resolve, reject);
                    });
                };
            }
        };
    }]).directive('jdEnter', function () {
        return function (scope, element, attrs) {
            element.bind("keydown.jdEnter keypress.jdEnter", function (event) {
                if (event.which === 13) {
                    scope.$apply(function () {
                        scope.$eval(attrs.jdEnter);
                    });

                    event.preventDefault();
                }
            });

            // destroy
            // se escopo destruido remove eventos
            scope.$on('$destroy', function () {
                element.unbind('keydown.jdEnter keypress.jdEnter');
            });
        };
    }).directive('jdDependsOn', ['$log', function ($log) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.attr("disabled", "true");

                var dependsOn = attrs.jdDependsOn;
                if (dependsOn == "") {
                    $log.error("A diretiva DependsOn precisa de conteúdo válido para funcionar corretamente. Elemento não carregado.")
                    return false;
                }

                var dataListeners = [];
                angular.forEach((dependsOn.split(';')), function (value) {
                    this.push(value.trim());
                }, dataListeners);
                var checkList = {};

                angular.forEach(dataListeners, function (listener) {
                    checkList[listener] = false;

                    scope.$watch(listener, function (newValue, oldValue) {
                        scope.$eval(attrs.ngModel + '=null');
                        if (scope.$eval(listener)) {
                            checkList[listener] = true;
                        } else {
                            checkList[listener] = false;
                        }

                        if (scanCheckList(checkList)) {
                            element.removeAttr("disabled");
                        } else {
                            element.attr("disabled", "true");
                        }
                    });
                });

                function scanCheckList(list) {
                    var flag = true;
                    angular.forEach(list, function (value, key) {
                        if (!value) {
                            flag = false;
                        }
                    });
                    return flag;
                }
            }
        };
    }]).directive("jdSelectSingle", ['$timeout', function ($timeout) {
        return {
            restrict: "A",
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {
                if (element.is('select')) {
                    scope.$watch(attrs.jdSelectSingle, function singleSelectWatch(newValue, oldValue) {
                        if (newValue != oldValue && newValue && newValue.length === 1) {
                            $timeout(function () {
                                ngModel.$setViewValue(newValue[0]);
                            }, 300);
                        }
                    });
                }
            }
        }
    }]).directive("jdDisableOn", ['jedi.utilities.Utilities', '$http', function (Utilities, $http) {
        return {
            restrict: "A",
            link: function (scope, element, attrs, ngModel) {
                if (!attrs.jdDisableOn) {
                    attrs.jdDisableOn = 'click';
                }

                function eventFunc() {
                    element[0].disabled = true;
                    element.attr('disabled', true);

                    var isChrome = /chrom(e|ium)/.test(navigator.userAgent.toLowerCase());

                    if (element.is('[type="submit"]') && isChrome) {
                        element.submit();
                    }
                }

                Utilities.bindFirst(element, attrs.jdDisableOn, eventFunc);

                //element.on(attrs.jdDisableOn, function () {
                //    if ($http.pendingRequests.length == 0) {
                //        element.removeAttr('disabled');
                //    }
                //});
            }
        }
    }]).directive('autofocus', ['$timeout', function($timeout) {
        return {
            restrict: 'A',
            link : function($scope, $element) {
                $timeout(function() {
                    $element[0].focus();
                });
            }
        }
    }]).directive("jdClickDisable", ["$parse", function ($parse) {
        function disableElement(element) {
            if (element) {
                element.attr('disabled', true);
            }
        }
        function enableElement(element) {
            if (element) {
                element.attr('disabled', false);
            }
        }
        return {
            restrict: "A",
            controller: ['$scope', function ($scope) {
                // indicates if function invoked by the click is currently running
                this.running = false;
            }],
            compile: function ($element, attr) {
                var fn = $parse(attr.jdClickDisable);
                return function (scope, element, attr, controller) {
                    element.on("click", function (event) {

                        // if function is currently running don't execute it again
                        if (!controller.running) {
                            scope.$apply(function () {

                                // if invoked function returns a promise wait for it's completion
                                var func = fn(scope, { $event: event });
                                if (func && func.finally !== undefined) {
                                    controller.running = true;
                                    disableElement($element, true);
                                    func.finally(function () {
                                        controller.running = false;
                                        enableElement($element);
                                    });
                                }
                                else {
                                    throw "Click function is not a promise, disable will not work";
                                }
                            });
                        }
                    });
                };
            }
        };
    }]);
