import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get a document by name
export const get = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("documents")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();
    return doc;
  },
});

// Save/update a document
export const save = mutation({
  args: {
    name: v.string(),
    state: v.string(), // base64 encoded Yjs state
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("documents")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        state: args.state,
        updatedAt: Date.now(),
      });
      return existing._id;
    } else {
      return await ctx.db.insert("documents", {
        name: args.name,
        state: args.state,
        updatedAt: Date.now(),
      });
    }
  },
});

// List all documents
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("documents")
      .order("desc")
      .take(100);
  },
});

// Delete a document
export const remove = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("documents")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();
    
    if (doc) {
      await ctx.db.delete(doc._id);
    }
  },
});
