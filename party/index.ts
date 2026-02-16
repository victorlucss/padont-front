import type * as Party from "partykit/server";
import { onConnect } from "y-partykit";

export default class YjsParty implements Party.Server {
  constructor(readonly room: Party.Room) {}

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    // Use y-partykit for Yjs synchronization
    return onConnect(conn, this.room, {
      // Persist document to PartyKit's built-in storage
      persist: { mode: "snapshot" },
      // Optional: callback when document updates
      callback: {
        handler: async (doc) => {
          // Could save to external storage here if needed
        },
      },
    });
  }
}
