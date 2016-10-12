gadgeonApp.controller('mainController', function($scope, $route,$location){

		if (!window.openDatabase) {
		
					 alert('Databases are not supported in this browser.');
					 return;
				 }

			 db = openDatabase(shortName, version, displayName,maxSize);
			 createUserTable();

		$scope.data ={};
		$scope.dev ="Nijo Joseph";
		$scope.session={};
		$scope.template={};
		$scope.currentRoute=$location.path();
		
		if (cordova.platformId === 'android') {
			$scope.data.platform='android';
			
		}else{
			$scope.data.platform='ios';
			
		}

	
				db.transaction(function(transaction) {
					transaction.executeSql("SELECT * FROM User;", [],
					 function(transaction, result) {
						if (result != null && result.rows.length > 0) {
								var row = result.rows.item(0);
								$scope.session.userId=row.userId;
								$scope.session.userName=row.userName;	
								$scope.session.name=row.name;
								$scope.session.email=row.email;
								$scope.session.isLogin=row.isLogin;
								if($scope.session.isLogin==1){
									var bodyEL = angular.element( document.querySelector( '#app-body' ) );
									bodyEL.attr('ISLOGIN',"true");
									$scope.template.bodyclass="skin-black  fixed sidebar-mini sidebar-collapse";console.log($scope.template.bodyclass);
									$scope.$apply(); 
								}else if($scope.session.isLogin==0){
									var bodyEL = angular.element( document.querySelector( '#app-body' ) );
									bodyEL.attr('ISLOGIN',"false");
									$scope.template.bodyclass="login-page";
									$location.path("/login");
									$scope.$apply(); 
						
								}
								console.log("isLogin :"+$scope.session.isLogin);
								console.log("issignedup :true");
							
						}else{
							var bodyEL = angular.element( document.querySelector( '#app-body' ));
							bodyEL.attr('ISLOGIN',"false");
							$scope.template.bodyclass="register-page";
							$location.path("/signUp");
							$scope.$apply(); 
							console.log("issignedup :false");
					
						}
					 },errorHandler);
			 },errorHandler,nullHandler);		
	
		$scope.logout=function() {
		console.log('name :'+$scope.session.name);
		console.log('email :'+$scope.session.email);
		console.log('userid :'+$scope.session.userId);
		navigator.notification.confirm('Do you want to Logout',onConfirmQuit,'Logout','OK,Cancel');
		function onConfirmQuit(button){
			 if(button == "1"){
					db.transaction(function(transaction) {
						transaction.executeSql("UPDATE User SET isLogin=0 WHERE userId="+$scope.session.userId+";", [],
						 function(transaction, result) {
								$scope.setDefaults();
								$('body').attr("class","login-page");
								$location.path("/login");
								$scope.$apply(); 
							
						},errorHandler);
				 },errorHandler,nullHandler);	
				 
		}
		
		
		};
			
		};

		$scope.setDefaults=function(){
			$scope.data ={};
			$scope.session={};
			$scope.template={};
		};
         
});

gadgeonApp.controller('signUpController', function($scope, $route,$location){
	console.log('signUpController');
	$scope.user={};
	$scope.signUp = function() {
		
				// check to make sure the form is completely valid
				if ($scope.userForm.$valid) {
					
					if (!window.openDatabase) {
						 console.log('Databases are not supported in this browser.');
						 return;
					 }
	
			 db.transaction(function(transaction) {

						var inertQuery="INSERT INTO User (name,userName,password,email,isLogin) VALUES ('"+$scope.user.name+"','"+$scope.user.userName+"','"+$scope.user.password+"','"+$scope.user.email+"','1') ";
							console.log(inertQuery);
						 transaction.executeSql(inertQuery,[],
							 function(transaction, result) {
									$('body').attr("class","skin-black  fixed sidebar-mini sidebar-collapse");
									$location.path("/");
									$scope.$apply(); 
								
							},errorHandler);
					 	});
				}
	};

	});

gadgeonApp.controller('loginController', function($scope, $route,$location){
	$scope.loginCredentials={};
	$scope.login = function() {
		if ($scope.loginForm.$valid) {
				db.transaction(function(transaction) {
					transaction.executeSql("SELECT * FROM User WHERE userName='"+$scope.loginCredentials.userName+"' and password='"+$scope.loginCredentials.password+"';", [],
					 function(transaction, result) {
						if (result != null && result.rows.length > 0) {
								var row = result.rows.item(0);
								db.transaction(function(transaction) {
									transaction.executeSql("UPDATE User SET isLogin='1' WHERE userId="+row.userId+";", [],
									 function(transaction, result) {
										$('body').attr("class","skin-black  fixed sidebar-mini sidebar-collapse");
										$location.path("/");
										$scope.$apply(); 
									
									},errorHandler);
							 	},errorHandler,nullHandler);

						}else{
							navigator.notification.alert("Invalid Username or Password.",null,'Login Error','Ok');
							$scope.loginCredentials={};
							$scope.$apply(); 
						}		
					},errorHandler);
				},errorHandler,nullHandler);
		}
	};

});

gadgeonApp.controller('profileController', function($scope, $route,$location){
	console.log('profileController');
	$scope.user={};
	db.transaction(function(transaction) {
					transaction.executeSql("SELECT * FROM User ", [],
					 function(transaction, result) {
						if (result != null && result.rows.length > 0) {
								var row = result.rows.item(0);
									$scope.user.name=row.name;
									$scope.user.userName=row.userName;
									$scope.user.originalPassword=row.password;
									$scope.user.email=row.email;
									$scope.user.userId=row.userId;
									$scope.$apply(); 
						
						}
						});
	});
	$scope.profile = function() {
		
				// check to make sure the form is completely valid
				if ($scope.userForm.$valid) {
					
					if (!window.openDatabase) {
						 console.log('Databases are not supported in this browser.');
						 return;
					 }
	
	
					 db.transaction(function(transaction) {
						
						var updateQuery="UPDATE User SET userName='"+$scope.user.userName+"' , name='"+$scope.user.name+"' ,  email='"+$scope.user.email+"' WHERE userId="+$scope.user.userId+";"
							console.log(updateQuery);
						 transaction.executeSql(updateQuery,[],
							 function(transaction, result) {	
									navigator.notification.alert('Profile Updated Successfully.',profileUpdatedSuccess,'DoorBell','OK');
									function profileUpdatedSuccess(){
										$('body').attr("class","skin-black  fixed sidebar-mini sidebar-collapse");
										$location.path("/");
										$scope.$apply(); 
									}
								
							},errorHandler);
					 	});
				}
	};

	$scope.resetProfile = function() {
									$scope.user.name="";
									$scope.user.userName="";
									$scope.user.email="";
									
	};

	$scope.changepassword = function() {
				// check to make sure the form is completely valid
				if ($scope.changePasswordForm.$valid) {
					
					if (!window.openDatabase) {
						 console.log('Databases are not supported in this browser.');
						 return;
					 }
	
	
					 db.transaction(function(transaction) {
						
						var updateQuery="UPDATE User SET password='"+$scope.user.password+"' WHERE userId="+$scope.user.userId+";"
							console.log(updateQuery);
						 transaction.executeSql(updateQuery,[],
							 function(transaction, result) {
									navigator.notification.alert('Password Changed Successfully.',passwordChangedSuccess,'DoorBell','OK');
									function passwordChangedSuccess(){
										$('body').attr("class","skin-black  fixed sidebar-mini sidebar-collapse");
										$location.path("/");
										$scope.$apply(); 
									}
								
							},errorHandler);
					 	});
				}
	};

});

