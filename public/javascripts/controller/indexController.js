app.controller("indexController", [
  "$scope",
  "indexFactory",
  ($scope, indexFactory) => {
    $scope.messages = [];
    $scope.players = {};
    $scope.init = () => {
      const username = prompt("Please enter username");

      if (username) {
        initSocket(username);
      } else {
        return false;
      }
    };
    function scrollTop(){
      setTimeout(()=>{
        const elemant=document.getElementById('chat-area');
        elemant.scrollTop=elemant.scrollHeight;
      });
    }

    function initSocket(username) {
      const connectionOptions = {
        reconnectionAttempts: 3,
        reconnectionDelay: 600
      };
      indexFactory
        .connectSocket("http://localhost:3000", connectionOptions)
        .then(socket => {
          socket.emit("newUser", { username });

          socket.on("initPlayers", players => {
            console.log(players);
            $scope.players = players;
            $scope.$apply();
          });

          socket.on("newUser", data => {
            const messageData = {
              type: {
                code: 0,
                message: 1
              }, //info
              username: data.username
            };
            $scope.messages.push(messageData);
            $scope.players[data.id] = data;
            $scope.$apply();
          });
          socket.on("disUser", data => {
            const messageData = {
              type: {
                code: 0,
                message: 0
              }, //info
              username: data.username
            };
            console.log(data);
            $scope.messages.push(messageData);
            delete $scope.players[data.id];
            $scope.$apply();
          });

          socket.on("animate", data => {
            $("#" + data.socketId).animate(
              { left: data.x, top: data.y },
              () => {
                animate = false;
              }
            );
          });

          socket.on('newMessage',message=>{
            $scope.messages.push(message);
            $scope.$apply();
            scrollTop();
          });

          let animate = false;
          $scope.onClickPlayer = $event => {
            if (!animate) {
              let x = $event.offsetX;
              let y = $event.offsetY;

              socket.emit("animate", { x, y });
              animate = true;
              $("#" + socket.id).animate({ left: x, top: y }, () => {
                animate = false;
              });
            }
          };

          $scope.newMessage = () => {
            let message = $scope.message;

            const messageData = {
              type: {
                code: 1,
              }, 
              username: username,
              text:message
            };
            $scope.messages.push(messageData);
            $scope.message='';

            socket.emit('newMessage',messageData);
            scrollTop();
            
          };
        })
        .catch(err => {
          console.log(err);
        });
    }
  }
]);
