angular.module("eae", []);

angular.module("eae").controller("maincontrol", function($scope, $window){
	
	var socket = io.connect("http://104.41.24.180:3000");
	
	var connect = false;

	$scope.mensagens = [];
	
	$scope.no_valid = false;
	$scope.isShow = true;
	
	var my_nickname;
	
	$scope.enviada="";

	$scope.start = function(nickname){
		socket.emit("join", nickname);
		$scope.nickForm.$setPristine();
		//$scope.isShow = false;
		my_nickname = nickname;
		valide();
	};
	

	valide = function(){
		socket.on("valide", function(bool){
			if(bool==="true"){
				connect = true;
				$scope.isShow = false;
				$scope.$apply();
			}else if(bool==="false"){
				$scope.no_valid = true;
				$scope.$apply();
			}	
		});
	};
	
	
	var chatmessages = document.querySelector(".chat-messages");
	

	$scope.send = function(){
		
		if($scope.enviada!=""){
			$scope.mensagens.push({user:my_nickname, data:$scope.enviada});
		
			socket.emit("send", $scope.enviada);
			$scope.enviada = "";

			setTimeout(function() {
				chatmessages.scrollTop = chatmessages.scrollHeight;
			}, 15);
		}
		
	};
	
	
	socket.on("chat", function(client, msg){
		if(connect){
			//$scope.message = "receveid-message";
			$scope.mensagens.push({user:client.name, data:msg});
			
			setTimeout(function() {
				chatmessages.scrollTop = chatmessages.scrollHeight;
			}, 15);
			$scope.$apply();
		}
	});
	
	socket.on("update", function(mensagem){
		$scope.information = mensagem;
		$scope.$apply();
	});
	
	$scope.reload = function(){
		$window.location.reload();
	};
	
});

