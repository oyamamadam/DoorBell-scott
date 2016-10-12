gadgeonApp.config(['$routeProvider','$locationProvider', 
  function($routeProvider,$locationProvider) {
		var h5m = (typeof html5Mode !== 'undefined') ? html5Mode : true;
		$locationProvider.html5Mode(h5m);

    $routeProvider.
      when('/login', {
        templateUrl: 'views/BeforeLogin/login.html'
      }).
			when('/signUp', {
        templateUrl: 'views/BeforeLogin/signUp.html'
      }).
			when('/', {
        templateUrl: 'views/AfterLogin/home.html',
        controller:  'mainController'
      }).
      when('/account', {
        templateUrl: 'views/AfterLogin/account.html',
				controller:  'mainController'
				
      }).
      when('/settings', {
        templateUrl: 'views/AfterLogin/settings.html',
				controller:  'mainController'
      }).
      when('/timer', {
        templateUrl: 'views/AfterLogin/timer.html',
				controller:  'mainController'
      }).
      when('/deviceinfo', {
        templateUrl: 'views/AfterLogin/deviceinfo.html',
				controller:  'mainController'
      }).
      when('/devicelogs', {
        templateUrl: 'views/AfterLogin/devicelogs.html',
				controller:  'mainController'
      }).
      otherwise({
        redirectTo: '/'
      });
  }]);
