// roomEvents.js
const defaultRoom = 'defaultRoom' ;
const roomsList = [defaultRoom];

export const setupRoomEvents = (io,socket) => {
    
    socket.on('createParty', () => {
        console.log('createParty Entry');
        const roomName = `room${Object.keys(roomsList).length}`;
        console.log('roomName', roomName);
        if (socket.rooms.size === 2 && [...socket.rooms].includes(defaultRoom)) {            socket.join(roomName);
            socket.leave(defaultRoom);
            const joinMessage = `${users[socket.id]} has joined the ${roomName}`;
            console.log(joinMessage);
            console.log('socket.rooms', socket.rooms);
            roomsList.push(roomName);
            console.log('roomsList', roomsList);
            io.to(socket.id).emit('createParty', roomName);
            io.to(roomName).emit('chatMessage', joinMessage);
        }
        else {
            const errorMsg = 'already in a party';
            console.log(errorMsg);
            io.to( socket.id).emit('errorMsg', errorMsg);
            io.emit('chatMessage', errorMsg);
        }
        console.log('createParty Exit');
    })

    socket.on('joinParty', ({ roomName }) => {
        console.log('joinParty Entry');
        if (socket.rooms.size === 2 && [...socket.rooms].contain(defaultRoom)) {
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
