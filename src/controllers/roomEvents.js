// roomEvents.js
import { io, users, defaultRoom, roomsList, roomPasswordMap } from "../config/global.js";
import { generateRandomPassword, validateJoinParty } from "../utils/roomUtils.js";

export const setupRoomEvents = (socket) => {
    
    socket.on('createParty', () => {
        console.log('createParty Entry');
        console.log([...socket.rooms]);
        const roomName = `room${Object.keys(roomsList).length}`;
        
        console.log('roomName', roomName);
        if (socket.rooms.size === 2 && [...socket.rooms].includes(defaultRoom)) {
            socket.join(roomName);
            roomPasswordMap.set(roomName, {"password": generateRandomPassword(), "open": true });
            
            socket.leave(defaultRoom);
            const joinMessage = `${users[socket.id]} has joined the ${roomName}`;
            console.log(joinMessage);
            console.log('socket.rooms', socket.rooms);
            roomsList.push(roomName);
            console.log('roomsList', roomsList);
            console.log('roomPasswordMap',roomPasswordMap);
            io.to(socket.id).emit('createParty', roomName, roomPasswordMap.get(roomName));
            io.to(roomName).emit('chatMessage', joinMessage);
        }
        else {
            const notification = {
                "title": "Cannot Create Room!",
                "description":"You are already in another room."
            }
            io.to( socket.id).emit('notification', notification);
            io.emit('chatMessage', notification.title);
        }
        console.log('createParty Exit');
    })

    socket.on('joinParty', ({ roomName, roomPassword }) => {
        console.log('joinParty Entry');

        const validationResult = validateJoinParty(socket, roomName, roomPassword);
        if (!validationResult.success) {
            const { title, description } = validationResult.notification;
            io.to(socket.id).emit('notification', { title, description });
            io.to(socket.id).emit('chatMessage', title);
            console.log('joinParty Exit');
            return;
        }
    
        // Join the room if all checks are passed
        socket.join(roomName);
        socket.leave(defaultRoom);
        const joinMessage = `${users[socket.id]} has joined the ${roomName}`;
        console.log(joinMessage);
        io.to(roomName).emit('chatMessage', joinMessage);
        io.to(socket.id).emit('joinParty', roomName);
        
        console.log('joinParty Exit');
    })

    socket.on('leaveParty', ({ roomName }) => {
        console.log('leaveParty Entry');
        console.log(roomName);
        console.log('before',socket.rooms);
        socket.leave(roomName);

        if (socket.rooms.size === 1) {
            socket.join(defaultRoom);
            io.to(socket.id).emit('leaveParty');
        }
        clearEmptyRooms(roomName);
        console.log('after',socket.rooms);
        console.log('leaveParty Exit');
    })

    socket.on('blockParty', ({ roomName }) => {
        console.log('blockParty Entry');
        console.log(roomName);
        if (roomName == defaultRoom) {
            const notification = {
                "title": "Unauthorized",
                "description": `Cannot Block Default Room`
            };
            io.to(roomName).emit('notification', notification);
            console.log(notification.description);
        }
        // Check if the room exists in the roomPasswordMap
        else if (roomPasswordMap.has(roomName)) {
            roomPasswordMap.get(roomName).open = false; // Set the open flag to false
            const notification = {
                "title": "Party Blocked!",
                "description": `The party with ${roomName} is now closed.`
            };
            io.to(roomName).emit('notification', notification);
            console.log(notification.description);
        } else {
            const notification = {
                "title": "Room Not Found!",
                "description": `The specified room ${roomName} does not exist.`
            };
            io.to(socket.id).emit('notification', notification);
            console.log(notification.description);
        }

        console.log('blockParty Exit');
    });
};
