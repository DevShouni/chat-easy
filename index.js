const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const PORT = process.env.PORT || 5000;
let usersList = [];



app.get('/', function(req, res) {
    res.render('index.ejs');
});



io.sockets.on('connection', function(socket) {
    
    socket.on('username', function(username) {
        socket.username = username;
        let index = usersList.indexOf(socket.username);
        if(index==-1) {
            usersList.push(username);
        }     
        io.emit('is_online', '🤟 <i>' + socket.username + ' join the chat.</i>');
    });

    socket.on('log_in', function() {
        let total =io.engine.clientsCount;
        io.emit('list_user_onconnect', 'users online: ' + total);
    });

    socket.on('disconnect', function(username) {
        io.emit('is_online', '👋 <i>' + socket.username + ' left the chat.</i>');
        let total =io.engine.clientsCount;
        io.emit('list_user_ondisconnect', 'users online: ' + total);
        let index = usersList.indexOf(socket.username);
        if (index > -1) {
            usersList.splice(index, 1);
            }             
            });

    socket.on('chat_message', function(message, room) {
        if(room=="") {
            io.emit('chat_message', '<strong style="color: green">' + socket.username + '</strong>: ' + message);
            io.emit('show_notification', socket.username);
        }
        else {
            io.to(room).emit('chat_message', '<strong style="color: red">' + socket.username + '</strong>: ' + message);
            io.emit('show_notification', socket.username);
        }
    });
    socket.on('user_list', function(user) {
        io.emit('user_array', usersList, user);
    });
    socket.on('user_list_room', function(room, user) {
        io.in(room).clients((err , clients) => {
            let roster=clients.length;
            io.emit('user_array_room', roster, user);
        });    
        
    });

    socket.on('create', function(room) {
        socket.join(room);
    });
    socket.on('join_room', function(room) {
        socket.join(room);
    });
    socket.on('leave_room', function(room) {
        socket.leave(room);
    });
    


});

const server = http.listen(3000, function() {
    console.log('listening on * ' + 3000);
});