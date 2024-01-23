// shared/types.ts
export var MessageType;
(function (MessageType) {
    MessageType["ADMIN_START"] = "admin:start";
    MessageType["ADMIN_NEXT_ROUND"] = "admin:next-round";
    MessageType["ADMIN_END"] = "admin:end";
    MessageType["ADMIN_START_NEW_GAME"] = "admin:start-new-game";
    MessageType["ADMIN_BACK_TO_LOBBY"] = "admin:back-to-lobby";
    MessageType["ADMIN_KICK_PLAYER"] = "admin:kick-player";
    MessageType["SET_CONFIG"] = "game:setConfig";
    MessageType["PLAYER_SELECTION"] = "game:playerSelection";
    MessageType["REQUEST_NEXT_CARD"] = "game:requestNextCard";
    MessageType["JUDGE_DECISION"] = "game:judgeDecision";
    MessageType["DEV_SAVE_SNAPSHOT"] = "dev:saveSnapshot";
    MessageType["DEV_LOAD_SNAPSHOT"] = "dev:loadSnapshot";
})(MessageType || (MessageType = {}));
