var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var usuarios = [];
var listName = [];
var numero_usuarios = 0;
var sala_disponivel;

app.get('/', function(req, res){
	res.send("eae");
});

io.on("connection", function (client){
	
	client.on("join", function(name){
		var bool = true;	
		
		if(listName.length > 0)
			bool = verifyName(name);
		else
			listName.push(name);
		
		console.log(name);
		
		if(bool===true){
			usuarios.push({name:name,id:client.id,sala_id:-1});
			numero_usuarios++;
			client.emit("valide", "true");
			
			var id_other = salaDisponivel(client.id);
			
			usuarios[getId(client.id)].sala_id = id_other;
			console.log("Tem "+numero_usuarios+" logados");
			console.log(usuarios);
			
			if(usuarios[getId(client.id)].sala_id!=-1){
				client.emit("update", " você esta conectado com "+usuarios[id_other].name);
				usuarios[id_other].sala_id = getId(client.id);
				client.broadcast.to(usuarios[id_other].id).emit("update", " você esta conectado com "+usuarios[getId(client.id)].name);
			}else
				client.emit("update", ", bem vindo! Estamos encontrando um outro usuario para iniciar a conversa ;)");	
			
			return true;
		}else if(bool===false){
			client.emit("valide", "false");
			return false;
		}
	});
	
	
	client.on("send", function(message){	
		if(usuarios[getId(client.id)]!=undefined)
			id_other = usuarios[getId(client.id)].sala_id;
		if(id_other!=-1)
			if(usuarios[id_other]!=undefined)
			client.broadcast.to(usuarios[id_other].id).emit("chat", usuarios[getId(client.id)], message);
	});

	client.on("disconnect", function(){
		var x = getId(client.id);
		if(usuarios[x]!=undefined)
			var id_other = usuarios[x].sala_id;
		
		if(x!=-1 && id_other!=-1 && usuarios[id_other]!=undefined){
			usuarios[id_other].sala_id = -1;
			client.broadcast.to(usuarios[id_other].id).emit("update", ", o usuario "+usuarios[getId(client.id)].name+" se desconectou, mas ja estamos procurando outro.");

			var other = salaDisponivel(usuarios[id_other].id);
			usuarios[id_other].sala_id = other;

			if(usuarios[id_other].sala_id!=-1){
				client.emit("update", " você esta conectado com "+usuarios[other].name);
				usuarios[other].sala_id = id_other;
				client.broadcast.to(usuarios[other].id).emit("update", " você esta conectado com "+usuarios[id_other].name);
			}
		}
		
		if(numero_usuarios > 0 && x!=-1){
			if(numero_usuarios>0){	
				for(var i=0; i<listName.length;i++){
					if(listName[i] === usuarios[x].name){
						listName.splice(i, 1);
					}
				}
			}
			usuarios.splice(x, 1);
			numero_usuarios--;
		}
		
	});
	
	getId = function(clientId){
		if(usuarios.length > 0){ //numero_usuarios > 0
			for(var i=0; i<usuarios.length; i++){
				if(usuarios[i].id === clientId){
					return i;
				}
			}
			return -1;
		}
	};
	
	verifyName = function(nick){
		for(var i=0;i<listName.length;i++){
			if(listName[i] === nick){
				return false;				
			}
		}
		return true;
	};	
	
	salaDisponivel = function(id){
		for(var i=0; i<usuarios.length; i++){
			if(usuarios[i].sala_id === -1 && usuarios[i].id != id)
				return i;
		}
		return -1;
	};
});



http.listen(3000, function(){
	console.log('Escutando a porta 3000');
});
