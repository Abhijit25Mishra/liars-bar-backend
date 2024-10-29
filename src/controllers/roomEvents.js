// roomEvents.js
import { io, users, defaultRoom, roomsList, roomPasswordMap } from "../config/global.js";
import { generateRandomPassword } from "../utils/roomUtils.js";

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
        console.log(roomPasswordMap);
        console.log(roomName, roomPassword);

        if (socket.rooms.size === 2 && [...socket.rooms].includes(defaultRoom)) {
            if (roomPassword === roomPasswordMap.get(roomName)) {
                socket.join(roomName);
                socket.leave(defaultRoom);
                const joinMessage = `${users[socket.id]} has joined the ${roomName}`;
                console.log(joinMessage);
                console.log('socket.rooms', socket.rooms);
                console.log('roomsList', roomsList);
                io.to(roomName).emit('chatMessage', joinMessage);
            }
            else {
                const notification = {
                    "title": "Cannot Join Room!",
                    "description":"You have entered incorrect password, Please try again."
                }
                io.to(socket.id).emit('notification', notification);
                io.emit('chatMessage', notification.title);
            }
        }
        else {
            const notification = {
                "title": "Cannot Join Room!",
                "description":"You are already in another room."
            }
            io.to(socket.id).emit('notification', notification);
            io.emit('chatMessage', notification.title);
        }

        console.log('chatMessage Exit');
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


    

    const clearEmptyRooms = (roomName) => {
        
    };
};
