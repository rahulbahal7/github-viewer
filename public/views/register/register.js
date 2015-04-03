app.controller("RegisterController", function($scope, $http, $location, $rootScope){
	$scope.register = function(user){
		console.log(user);


		if(user.password == user.password2){
		$http.post("/register", user)
		.success (function(res){
			console.log(res);

			//make the user the current user and pass to profile
			$rootScope.currentUser = res;
			$location.url("/profile");
		});
	}
	}
});