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
    return { success: true };
};

