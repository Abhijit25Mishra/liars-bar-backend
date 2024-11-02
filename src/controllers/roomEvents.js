// roomEvents.js
import * as roomImpl from "../impl/roomEventsImpl.js"

export const setupRoomEvents = (socket) => {
    
    socket.on('createParty', () => {
        console.log('createParty Entry');
        roomImpl.createPartyImpl(socket);
        console.log('createParty Exit');
    })

    socket.on('joinParty', async ({ roomName, roomPassword }) => {
        console.log('joinParty Entry');
        roomImpl.joinPartyImpl(roomName, roomPassword, socket);
        console.log('joinParty Exit');
    })

    socket.on('leaveParty', ({ roomName }) => {
        console.log('leaveParty Entry');
        roomImpl.leavePartyImpl(roomName, socket);
        console.log('leaveParty Exit');
    })

    socket.on('blockParty', ({ roomName }) => {
        console.log('blockParty Entry');
        roomImpl.blockPartyImpl(roomName, socket);
        console.log('blockParty Exit');
    });

    socket.on('ready', ({ roomData, userName }) => {
        console.log('ready Entry');
        roomImpl.readyImpl(roomData, userName);
        console.log('ready Exit');
    })
};


