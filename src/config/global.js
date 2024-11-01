// globals.js

export const users = {}; 
export let io; 
export const defaultRoom = 'Default Room';
export const roomsList = [defaultRoom];
export const roomPasswordMap = new Map();
export const roomUserMap = new Map();

export const setIo = (socketIo) => {
    io = socketIo; 
};

