angular.module('cgross.soft-forms',[]);

angular.module('cgross.soft-forms').directive('cgSoft',['$timeout','$parse',
	function($timeout,$parse){
		return {
			restrict: 'A',
            require:'?ngModel',
			link: function(scope, element, attrs, ngModel) {
                
                if (!ngModel){
                    throw new Error('cg-soft requires an ng-model.');
                }
        
                element.addClass('cg-soft');

                var options = scope.$eval(attrs.cgSoft);
                        console.log(options);
                if (options && options.resize){
                    element.addClass('cg-soft-resize');
                }

                var change;
                if (attrs.cgChange){
                    change = $parse(attrs.cgChange);
                }

                var dirty = false;
                var update = function(){
                    if (dirty && change){
                        scope.$apply(function(){
                            change(scope,{$ngModel:attrs.ngModel,$value:ngModel.$modelValue});
                        });
                    }
                    dirty = false;
                    ngModel.$setPristine();
                };
                
                var valueOnFocus;
                var valueUpdatedWhileFocused = false;
                element.on('focus',function(){
                    valueOnFocus = ngModel.$viewValue;
                    valueUpdatedWhileFocused = false;
                });
                
                element.on('blur',function(){
                    update();
                });

                element.on('keyup',function(e){
                    if (e.keyCode === 27){ //esc
                        $(element).val(valueOnFocus);
                        scope.$apply(ngModel.$setViewValue(valueOnFocus));
                        dirty = valueUpdatedWhileFocused;
                        $(element).blur();
                        resize();
                    } else if (e.keyCode === 13){ //return
                        $(element).blur();
                    }
                });
                
                var resize = function(){

                    if (attrs.type !== 'text' || !element.hasClass('cg-soft-resize')){
                        return;
                    }

                    var testElement = $('<div style="position:absolute;display:none;left:-10000px;top:-10000px"></div>');
                    $('body').append(testElement);
                    
                    var copyProperties = [
                        'font-size',
                        'font-weight',
                        'font-size',
                        'font-family',
                        'letter-spacing',
                        'border',
                        'margin',
                        'padding'
                    ];
                    
                    $.each(copyProperties,function(i,prop){
                        testElement.css(prop, element.css(prop));
                    });
                    
                    testElement.css('white-space','pre');
                    
                    var text = element.val();
                    
                    if (text.length === 0 && element.attr('placeholder')){
                        text = element.attr('placeholder');
                    }

                    testElement.text(text);
    
                    var width = testElement.width();
                    testElement.remove();

                    var extra = 1;
                    
                    element.css('width',width + extra);
                };
                
                var timeoutPromise;
                scope.$watch(attrs.ngModel,function(){
                    dirty = dirty || ngModel.$dirty;
                    resize();

                    if (timeoutPromise){
                        $timeout.cancel(timeoutPromise);
                    }

                    timeoutPromise = $timeout(function(){
                        if (dirty){
                            valueUpdatedWhileFocused = true;
                        }
                        update();
                        timeoutPromise = undefined;
                    },3000);
                });

                //readme
                //tests
                //verify bower
            
			}
		};
	}
]);

