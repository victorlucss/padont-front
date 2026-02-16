import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  documents: defineTable({
    name: v.string(),
    // Yjs state stored as base64 string
    state: v.string(),
    updatedAt: v.number(),
  }).index("by_name", ["name"]),
});
