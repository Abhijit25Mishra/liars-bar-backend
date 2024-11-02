// roomEvents.js
import { io, users, defaultRoom, roomsList, roomPasswordMap, roomUserMap, userReadyMap  } from "../config/global.js";
import { generateRandomPassword, validateJoinParty, findRoomByPassword, notifyError } from "../utils/roomUtils.js";

export const setupRoomEvents = (socket) => {
    
    socket.on('createParty', () => {
        console.log('createParty Entry');
        createPartyImpl(socket);
        console.log('createParty Exit');
    })

    socket.on('joinParty', async ({ roomName, roomPassword }) => {
        console.log('joinParty Entry');
        joinPartyImpl(roomName, roomPassword, socket);
        console.log('joinParty Exit');
    })

    socket.on('leaveParty', ({ roomName }) => {
        console.log('leaveParty Entry');
        leavePartyImpl(roomName, socket);
        console.log('leaveParty Exit');
    })

    socket.on('blockParty', ({ roomName }) => {
        console.log('blockParty Entry');
        blockPartyImpl(roomName, socket);
        console.log('blockParty Exit');
    });

    socket.on('ready', ({ roomData, userName }) => {
        console.log('ready Entry');
        readyImpl(roomData, userName);
        console.log('ready Exit');
    })
};


function createPartyImpl(socket) {
    console.log([...socket.rooms]);
    const roomName = `room${Object.keys(roomsList).length}`;

    console.log('roomName', roomName);
    if (socket.rooms.size === 2 && [...socket.rooms].includes(defaultRoom)) {
        socket.join(roomName);
        roomPasswordMap.set(roomName, { "password": generateRandomPassword(), "open": true });
        socket.leave(defaultRoom);
        const joinMessage = `${users[socket.id]} has joined the ${roomName}`;
        console.log(joinMessage);
        console.log('socket.rooms', socket.rooms);
        roomsList.push(roomName);
        console.log('roomsList', roomsList);
        console.log('roomPasswordMap', roomPasswordMap);
        console.log('roomPasswordMap for ', roomName, roomPasswordMap.get(roomName));
        const roomData = {
            roomName: roomName,
            roomPassword: roomPasswordMap.get(roomName).password,
            roomOpen: roomPasswordMap.get(roomName).open
        };

        // Initialize or update the user array for the room
        const currentUsers = roomUserMap.get(roomName) || [];
        currentUsers.push(users[socket.id]);
        roomUserMap.set(roomName, currentUsers);
        console.log(roomUserMap);

        io.to(socket.id).emit('createParty', roomData);
        io.to(roomName).emit('chatMessage', joinMessage);
    }
    else {
        const notification = {
            "title": "Cannot Create Room!",
            "description": "You are already in another room."
        };
        io.to(socket.id).emit('notification', notification);
        io.emit('chatMessage', notification.title);
    }
}

async function joinPartyImpl(roomName,roomPassword,socket) {
    let validationResult;
        if (!roomName) {
            console.log("roomName is not provided");
            validationResult = findRoomByPassword(roomPassword);
        } 
        
        if (!validationResult.success) {
            return notifyError(validationResult, socket);
        }

        roomName = validationResult.roomName;
        
        validationResult = validateJoinParty(socket, roomName, roomPassword);
        
        if (!validationResult.success) {
            return notifyError(validationResult, socket);
        }

        const currentUsers = roomUserMap.get(roomName) || [];
        currentUsers.push(users[socket.id]);
        roomUserMap.set(roomName, currentUsers);
        console.log(roomUserMap);

        socket.join(roomName);
        socket.leave(defaultRoom);
        const joinMessage = `${users[socket.id]} has joined the ${roomName}`;
        console.log(joinMessage);
        
        const roomData = {
            roomName: roomName,
            roomPassword: roomPasswordMap.get(roomName).password,
            roomOpen:roomPasswordMap.get(roomName).open
        }

        const socketsInRoom = await io.in(roomName).fetchSockets();
        const numberOfSocketsInRoom = socketsInRoom.length;
        // console.log('socketsInRoom', socketsInRoom);
        console.log('numberOfSocketsInRoom', numberOfSocketsInRoom);

        if (numberOfSocketsInRoom > 3) {
            console.log('works');
            blockPartyImpl(roomData.roomName, socket);
        }

        io.to(roomName).emit('userListUpdate', roomUserMap.get(roomName));
        io.to(roomName).emit('chatMessage', joinMessage);
        io.to(socket.id).emit('joinParty', roomData);
        
}

function leavePartyImpl(roomName, socket) {
    console.log(roomName);
    console.log('before', socket.rooms);
    socket.leave(roomName);

    if (socket.rooms.size === 1) {
        socket.join(defaultRoom);
        io.to(socket.id).emit('leaveParty');
    }
    clearEmptyRooms(roomName);
    console.log('after', socket.rooms);
}

function readyImpl(roomData, userName) {
    const updatedReadyUsersList = [];
    const currentUsers = roomUserMap.get(roomData.roomName);
    currentUsers.forEach(user => {
        userReadyMap?.get(user) ? updatedReadyUsersList.push(user) : null;
    });
    updatedReadyUsersList.push(userName);
    userReadyMap.set(userName, true);
    console.log('updatedReadyUsersList', updatedReadyUsersList);
    console.log('userReadyMap', userReadyMap);
    io.to(roomData.roomName).emit('ready', updatedReadyUsersList);
    console.log('currentUsers',currentUsers);
    if (currentUsers.length == updatedReadyUsersList.length) {
        io.to(roomData.roomName).emit('startGame');
    }
}

function blockPartyImpl(roomName, socket) {
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
            "title": "Party Full!",
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
}

