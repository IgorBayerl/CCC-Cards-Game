import { Room, Client } from "@colyseus/core";
import { MyRoomState } from "./schema/MyRoomState";
import { Player } from "./schema/Player";

export class MyRoom extends Room<MyRoomState> {
  maxClients = 4;

  private handlers: { [key: string]: (client: Client, data?: any) => void } = {
    'room:joinRoom': this.handleJoinRoom,
    'room:leaveRoom': this.handleLeaveRoom,
    'game:admCommand': this.handleAdmCommand,
    'game:setConfig': this.handleSetConfig,
    'game:playerSelection': this.handlePlayerSelection,
    'game:requestNextCard': this.handleRequestNextCard,
    'game:seeAllRoundAnswers': this.handleSeeAllRoundAnswers,
    'game:judgeDecision': this.handleJudgeDecision
  };
  

  /// colyseus lifecycle methods
  onCreate (options: any) {
    this.setState(new MyRoomState());

    this.roomSize = this.maxClients;

    // Bind the handler functions to this context and set up an onMessage callback for each handler
    Object.keys(this.handlers).forEach((key) => {
      const boundHandler = this.handlers[key].bind(this);
      this.handlers[key] = boundHandler;
      this.onMessage(key, boundHandler);
    });
  }

  onJoin (client: Client, options: any, isReconnection: boolean) {
    console.log(client.sessionId, "joined!", "Reconnection:", isReconnection);
    if (isReconnection) {
      this.handleReconnection(client);
    } else {
      this.handleNewConnection(client);
    }
  }
  
  onLeave (client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
    if (consented) {
      this.handleConsentedLeave(client);
    } else {
      this.handleUnintentionalDisconnection(client);
    }
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

  /// end of colyseus lifecycle methods

  private set roomSize(size: number) {
    this.state.roomSize = size;
    this.maxClients = size;
  }

  private get roomSize(): number {
    return this.state.roomSize;
  }
  
  private handleNewConnection(client: Client) {
    const newPlayer = new Player();
    // Set player properties...
    this.state.players.set(client.sessionId, newPlayer);
  }
  
  private handleReconnection(client: Client) {
    const player = this.state.players.get(client.sessionId);
    if (player && player.timeout) {
      clearTimeout(player.timeout);
    }
  }
  
  private handleConsentedLeave(client: Client) {
    this.state.players.delete(client.sessionId);
  }
  
  private handleUnintentionalDisconnection(client: Client) {
    const secondsToPlayerRemoval = 10;
    const millisecondsToPlayerRemoval = secondsToPlayerRemoval * 1000;
  
    const timeout = setTimeout(() => {
      this.state.players.delete(client.sessionId);
    }, millisecondsToPlayerRemoval); 
  
    const player = this.state.players.get(client.sessionId);
    if (player) {
      player.timeout = timeout;
    }
  }

  private handleJoinRoom(client: Client, joinRequest: any) {}
  private handleLeaveRoom(client: Client) {}

  private handleAdmCommand(client: Client, command: string) {}
  private handleSetConfig(client: Client, data: any) {
    // Only allow the room leader (the first player) to set the configurations
    const isFirstPlayer = this.state.players.entries().next().value?.[0] === client.sessionId;
    if (!isFirstPlayer) return;
  
    this.roomSize = data.roomSize || this.roomSize;
    this.state.availableDecks = data.decks || this.state.availableDecks;
    this.state.scoreToWin = data.scoreToWin || this.state.scoreToWin;
    this.state.roundTime = data.time || this.state.roundTime;
  }
  
  
  private handlePlayerSelection(client: Client, selectedCards: any) {}
  private handleRequestNextCard(client: Client) {}
  private handleSeeAllRoundAnswers(client: Client) {}
  private handleJudgeDecision(client: Client, winningPlayerId: string) {}


}
