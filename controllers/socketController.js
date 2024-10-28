// socketEvents.js
import { v4 as uuidv4 } from 'uuid';

const users = {}; // Keep users in a module-level variable
const defaultRoom = 'defaultRoom' ;
const roomsList = [defaultRoom];

export const socketController = (io) => {
    io.on('connection', (socket) => {
        const userId = uuidv4();
        users[socket.id] = userId;  // Track connected user by socket ID
        console.log(users);
        console.log(`User connected with ID: ${users[socket.id]}`);
        socket.join(defaultRoom);

        socket.on('changeName', ({ newName }) => {
            console.log('changeName Entry');    
            users[socket.id] = newName;
            console.log(users);
        });

        socket.on('chatMessage', ({ msg }) => {
            console.log('chatMessage Entry');
            console.info('inside chatMessage',socket.rooms);
            const rooms = [...socket.rooms].filter(room => room !== socket.id); 
            const fullMessage = `${users[socket.id]} said: ${msg}`;

            console.info(rooms);
            if (rooms.length > 0) {
                // User is in at least one room, emit to those rooms
                rooms.forEach(room => {
                    console.log('emiited to room ', room, fullMessage);
                    io.to(room).emit('chatMessage', fullMessage);  // Emit to the specific room
                });
            } else {
                // User is not in any room, emit to all connected clients
                console.log('emitted to all', fullMessage);
                io.emit('chatMessage', fullMessage);
            }

            console.log(fullMessage);
        });


        socket.on('createParty', () => {
            console.log('createParty Entry');
            const roomName = `room${Object.keys(roomsList).length}`;
            console.log('roomName',roomName);
            socket.join(roomName);
            socket.leave(defaultRoom);
            const joinMessage = `${users[socket.id]} has joined the ${roomName}`;
            console.log(joinMessage);
            console.log('socket.rooms', socket.rooms);
            roomsList.push(roomName);
            console.log('roomsList',roomsList);
            io.to(roomName).emit('chatMessage', joinMessage);
        })

        socket.on('joinParty', ({ roomName }) => {
            if (socket.rooms.length === 2 && [...socket.rooms].contain(defaultRoom)) {
                console.log('joinParty Entry');
                socket.join(roomName);
                socket.leave(defaultRoom);
                const joinMessage = `${users[socket.id]} has joined the ${roomName}`;
                console.log(joinMessage);
                console.log('socket.rooms', socket.rooms);
                console.log('roomsList', roomsList);
                io.to(roomName).emit('chatMessage', joinMessage);
            }
            else {
                const errorMsg = 'already in a room';
                console.log(errorMsg);
                io.to( socket.id).emit('errorMsg', errorMsg);
                io.emit('chatMessage', errorMsg);
            }
        })

        socket.on('leaveParty', (roomName) => {
            console.log('leaveParty Entry');
            socket.leave(roomName);
            if(socket.rooms.length === 1 ) socket.join(defaultRoom);
        })

        socket.on('disconnect', () => {
            console.log(`User with ID ${users[socket.id]} disconnected`);
            delete users[socket.id];
        });
    });
};
