app.controller("LoginController", function($scope, $http, $location, $rootScope){
	$scope.login = function(user){
		console.log(user);


		//Request the server(Passport) with the POST method
		//Passport will reply with a authorized user object or 401 error
		$http.post("/login", user)
		.success (function(res){
			console.log(res);

			//then navigate to the Profile Page
			$rootScope.currentUser = res;
			$location.url("/profile");
		});
	}
});