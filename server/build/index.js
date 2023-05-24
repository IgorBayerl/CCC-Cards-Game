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
// import decks from './data/decks.json'
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Read and parse all deck JSON files
const decksDirectory = path_1.default.join(__dirname, './data/decks');
const deckFiles = fs_1.default.readdirSync(decksDirectory);
const decks = deckFiles.map((file) => {
    const deck = JSON.parse(fs_1.default.readFileSync(path_1.default.join(decksDirectory, file), 'utf-8'));
    const [language, _rest, id] = file.split('_');
    deck.id = id.split('.')[0]; // remove .json extension
    deck.language = language;
    return deck;
});
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});
app.use((0, cors_1.default)());
app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.get('/decks', (req, res) => {
    const language = req.query.language;
    const filteredDecks = !language
        ? decks
        : decks.filter((deck) => deck.language.includes(language));
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
    const deck = decks.find((d) => d.id === deckId);
    if (!deck) {
        res.status(404).json({ message: 'Deck not found' });
    }
    else {
        res.json(deck);
    }
});
const roomManager = new RoomManager_1.default(io);
io.on('connection', (socket) => {
    console.log('A user connected!');
    socket.on('room:joinRoom', (joinRequest) => {
        (0, roomEvents_1.handleJoinRoom)(socket, roomManager, joinRequest);
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
    socket.on('game:playerSelection', (selectedCards) => {
        (0, gameEvents_1.handlePlayerSelection)(socket, roomManager, selectedCards);
    });
    socket.on('game:requestNextCard', () => {
        (0, gameEvents_1.handleRequestNextCard)(socket, roomManager);
    });
    socket.on('game:seeAllRoundAnswers', () => {
        (0, gameEvents_1.handleSeeAllRoundAnswers)(socket, roomManager);
    });
    socket.on('game:judgeDecision', (winningPlayerId) => {
        (0, gameEvents_1.handleJudgeDecision)(socket, roomManager, winningPlayerId);
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
