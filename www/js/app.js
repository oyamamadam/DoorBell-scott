var gadgeonApp = angular.module('gadgeonApp', ['ngRoute','ngMessages']);

gadgeonApp.directive('script', function() { console.log('sript');
    return {
      restrict: 'E',
      scope: false,
      link: function(scope, elem, attr) 
      {
				if (cordova.platformId != 'android') {
        if (attr.type==='text/javascript-lazy') 
        {
          var s = document.createElement("script");
          s.type = "text/javascript";                
          var src = elem.attr('src');
          if(src!==undefined)
          {
              s.src = src;
          }
          else
          {
              var code = elem.text();
              s.text = code;
          }
          document.head.appendChild(s);
          elem.remove();
        }
			}
      }
    };
  });

gadgeonApp.directive('compareTo', function() { 
    return {
        require: "ngModel",
        scope: {
            otherModelValue: "=compareTo"
        },
        link: function(scope, element, attributes, ngModel) {

            ngModel.$validators.compareTo = function(modelValue) {
                return modelValue == scope.otherModelValue;
            };

            scope.$watch("otherModelValue", function() {
                ngModel.$validate();
            });
        }
    };
});


gadgeonApp.directive('onlyNumber', function() {
      return {
        require: '?ngModel',
        link: function(scope, element, attrs, ngModelCtrl) {
          if(!ngModelCtrl) {
            return; 
          }

          ngModelCtrl.$parsers.push(function(val) {
            if (angular.isUndefined(val)) {
                var val = '';
            }
            
            var clean = val.replace(/[^0-9]/g, '');
            var negativeCheck = clean.split('-');
			var decimalCheck = clean.split('.');
            if(!angular.isUndefined(negativeCheck[1])) {
                negativeCheck[1] = negativeCheck[1].slice(0, negativeCheck[1].length);
                clean =negativeCheck[0] + '-' + negativeCheck[1];
                if(negativeCheck[0].length > 0) {
                	clean =negativeCheck[0];
                }
                
            }
              
            if(!angular.isUndefined(decimalCheck[1])) {
                decimalCheck[1] = decimalCheck[1].slice(0,2);
                clean =decimalCheck[0] + '.' + decimalCheck[1];
            }

            if (val !== clean) {
              ngModelCtrl.$setViewValue(clean);
              ngModelCtrl.$render();
            }
            return clean;
          });
					
          element.bind('keypress', function(event) { 
            if(event.which === 32) {
              event.preventDefault();
            }
            
            
          });
        }
      };
    });


var app = {
    // Application Constructor
    initialize: function() {
        console.log("initializing");
        this.bindEvents();
        console.log("initializing done");
    },
    
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);   
    },
   
    onDeviceReady: function() {

    }
};

