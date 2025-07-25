import { io } from "../config/global.js";
import * as config from "../config/global.js";

export const generateRandomPassword = (length = 6) => Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');

export const validateJoinParty = (socket, roomName, roomPassword) => {
    // Check if the user is already in another room
    if (socket.rooms.size !== 2 || ![...socket.rooms].includes(config.defaultRoom)) {
        return {
            success: false,
            notification: {
                title: "Cannot Join Room!",
                description: "You are already in another room."
            }
        };
    }

    // Check if the room exists and the password is correct
    const roomInfo = config.roomPasswordMap.get(roomName);
    console.log(roomInfo);
    if (!roomInfo || roomPassword !== roomInfo.password) {
        return {
            success: false,
            notification: {
                title: "Cannot Join Room!",
                description: "You have entered incorrect password, Please try again."
            }
        };
    }

    // Check if the room is open
    if (!roomInfo.open) {
        return {
            success: false,
            notification: {
                title: "Cannot Join Room!",
                description: "Party is closed."
            }
        };
    }

    // If all validations pass
    return { success: true, roomToJoin: roomName };
};
// New function to find a room by password
export const findRoomByPassword = (roomPassword) => {
    console.log("finding room by password");
    for (const [roomName, roomInfo] of config.roomPasswordMap.entries()) {
        if (roomInfo.password == roomPassword) {
            return {
                success: true,
                roomName:roomName
            };
        }
    }

    return {
        success: false,
        notification: {
            title: "Cannot Join Room!",
            description: "No room found with the provided password."
        }
    };
};

export const shareUserData = (roomName) => {
    // Get the list of users in the room
    const usersInRoom = Object.entries(config.users)
        .filter(([socketId, userId]) => {
            // Check if the socket ID is in the specified room
            const userSocketRooms = config.io.sockets.sockets.get(socketId)?.rooms;
            return userSocketRooms && userSocketRooms.has(roomName);
        })
        .map(([socketId, userId]) => ({
            id: socketId,      // Emit the socket ID
            name: userId       // Emit the user ID
        }));

    // Emit the user data to all clients in the room
    console.log(usersInRoom);

    config.io.to(roomName).emit('userListUpdate', usersInRoom);
};

export const filterUserFromRoom = (roomUserMap, nameToRemove) => {
    // Iterate over each entry in the roomUserMap
    roomUserMap.forEach((users, roomName) => {
        // Filter the users array to exclude the specified name
        const updatedUsers = users.filter(user => user !== nameToRemove);
        
        // Update the map with the filtered users array
        roomUserMap.set(roomName, updatedUsers);
    });
};

export const removeUserAndGetRoom = (roomUserMap, nameToRemove) => {
    let roomOfRemovedUser = null;

    // Iterate over each entry in the roomUserMap
    roomUserMap.forEach((users, roomName) => {
        // Check if the user exists in the current room
        if (users.includes(nameToRemove)) {
            roomOfRemovedUser = roomName; // Store the room name
            // Filter the users array to exclude the specified name
            const updatedUsers = users.filter(user => user !== nameToRemove);
            // Update the map with the filtered users array
            roomUserMap.set(roomName, updatedUsers);
        }
    });

    config.userReadyMap.delete(nameToRemove);

    return roomOfRemovedUser; // Return the room name of the removed user
};

export const notifyError = (validationResult, socket)=> {
    const { title, description } = validationResult.notification;
    io.to(socket.id).emit('notification', { title, description });
    io.to(socket.id).emit('chatMessage', title);
    console.log('joinParty Exit');
    return;
}

export const cleanUp = () => {
    console.log("CLEAN UP");
    console.log("BEFORE");
    console.log("roomUserMap", config.roomUserMap);
    console.log("roomPasswordMap", config.roomPasswordMap);
    console.log("roomsList", config.roomsList);
    config.roomUserMap.forEach((users, roomName) => {
        if (users.length === 0) {
            config.roomUserMap.delete(roomName);
            // Also remove the room from roomPasswordMap
            if (config.roomPasswordMap.has(roomName)) {
                config.roomPasswordMap.delete(roomName);
            }
            // Remove the room from roomsList
            const index = config.roomsList.indexOf(roomName);
            if (index > -1) {
                config.roomsList.splice(index, 1);
            }
        }
    });
    console.log("AFTER");
    console.log("roomUserMap", config.roomUserMap);
    console.log("roomPasswordMap", config.roomPasswordMap);
    console.log("roomsList", config.roomsList);
    console.log("ALL CLEAN");
}