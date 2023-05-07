"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const socket_io_1 = require("socket.io");
const http_1 = require("http");
const RoomManager_1 = __importDefault(require("./rooms/RoomManager"));
const roomEvents_1 = require("./roomEvents");
const gameEvents_1 = require("./gameEvents");
const cors_1 = __importDefault(require("cors"));
const decks_json_1 = __importDefault(require("./data/decks.json"));
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});
const roomManager = new RoomManager_1.default();
app.use((0, cors_1.default)());
app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.get('/decks', (req, res) => {
    const language = req.query.language;
    const filteredDecks = !language
        ? decks_json_1.default
        : decks_json_1.default.filter((deck) => deck.language.includes(language));
    const deckSummaries = filteredDecks.map((deck) => ({
        id: deck.id,
        name: deck.name,
        language: deck.language,
        description: deck.description,
    }));
    res.json(deckSummaries);
});
app.get('/decks/:id', (req, res) => {
    const deckId = req.params.id;
    const deck = decks_json_1.default.find((d) => d.id === deckId);
    if (!deck) {
        res.status(404).json({ message: 'Deck not found' });
    }
    else {
        res.json(deck);
    }
});
io.on('connection', (socket) => {
    console.log('A user connected!');
    socket.on('room:joinRoom', ({ username, roomId }) => {
        (0, roomEvents_1.handleJoinRoom)(socket, roomManager, username, roomId);
    });
    socket.on('room:leaveRoom', () => {
        (0, roomEvents_1.handleLeaveRoom)(socket, roomManager);
    });
    socket.on('game:admCommand', (command) => {
        (0, gameEvents_1.handleAdmCommand)(socket, roomManager, command);
    });
    socket.on('game:setConfig', (config) => {
        (0, gameEvents_1.handleSetConfig)(socket, roomManager, config);
    });
    socket.on('disconnect', () => {
        console.log('A user disconnected!');
        const room = roomManager.leaveRoom(socket);
        room === null || room === void 0 ? void 0 : room.notifyState(socket);
    });
});
const PORT = process.env.PORT || 3365;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
