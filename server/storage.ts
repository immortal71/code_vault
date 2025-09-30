import { type User, type InsertUser, type Snippet, type InsertSnippet, type Collection, type InsertCollection, users, snippets, collections } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, and, or, like, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import createMemoryStore from "memorystore";
import { pool } from "./db";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Snippet methods
  getSnippet(id: string): Promise<Snippet | undefined>;
  getSnippetsByUserId(userId: string): Promise<Snippet[]>;
  getRecentSnippetsForSearch(userId: string, limit: number): Promise<Snippet[]>;
  createSnippet(snippet: InsertSnippet): Promise<Snippet>;
  updateSnippet(id: string, snippet: Partial<Snippet>): Promise<Snippet | undefined>;
  deleteSnippet(id: string): Promise<boolean>;
  searchSnippets(userId: string, query: string, limit?: number): Promise<Snippet[]>;
  
  // Collection methods
  getCollection(id: string): Promise<Collection | undefined>;
  getCollectionsByUserId(userId: string): Promise<Collection[]>;
  createCollection(collection: InsertCollection): Promise<Collection>;
  updateCollection(id: string, collection: Partial<Collection>): Promise<Collection | undefined>;
  deleteCollection(id: string): Promise<boolean>;
  
  // Session store
  sessionStore: session.Store;
}

const MemoryStore = createMemoryStore(session);

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private snippets: Map<string, Snippet>;
  private collections: Map<string, Collection>;
  public sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.snippets = new Map();
    this.collections = new Map();
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getSnippet(id: string): Promise<Snippet | undefined> {
    return this.snippets.get(id);
  }

  async getSnippetsByUserId(userId: string): Promise<Snippet[]> {
    return Array.from(this.snippets.values())
      .filter(snippet => snippet.userId === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createSnippet(insertSnippet: InsertSnippet): Promise<Snippet> {
    const id = randomUUID();
    const now = new Date();
    const snippet: Snippet = { 
      id,
      userId: insertSnippet.userId,
      title: insertSnippet.title,
      description: insertSnippet.description ?? null,
      code: insertSnippet.code,
      language: insertSnippet.language,
      tags: insertSnippet.tags ?? null,
      embedding: insertSnippet.embedding ?? null,
      framework: insertSnippet.framework ?? null,
      complexity: insertSnippet.complexity ?? null,
      isPublic: insertSnippet.isPublic ?? false,
      isFavorite: insertSnippet.isFavorite ?? false,
      usageCount: insertSnippet.usageCount ?? 0,
      lastUsedAt: insertSnippet.lastUsedAt ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.snippets.set(id, snippet);
    return snippet;
  }

  async updateSnippet(id: string, updates: Partial<Snippet>): Promise<Snippet | undefined> {
    const snippet = this.snippets.get(id);
    if (!snippet) return undefined;
    
    const updated: Snippet = { 
      ...snippet, 
      ...updates,
      updatedAt: new Date()
    };
    this.snippets.set(id, updated);
    return updated;
  }

  async deleteSnippet(id: string): Promise<boolean> {
    return this.snippets.delete(id);
  }

  async getRecentSnippetsForSearch(userId: string, limit: number): Promise<Snippet[]> {
    return Array.from(this.snippets.values())
      .filter(snippet => snippet.userId === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, limit);
  }

  async searchSnippets(userId: string, query: string, limit?: number): Promise<Snippet[]> {
    const lowerQuery = query.toLowerCase();
    const results = Array.from(this.snippets.values())
      .filter(snippet => 
        snippet.userId === userId && (
          snippet.title.toLowerCase().includes(lowerQuery) ||
          snippet.description?.toLowerCase().includes(lowerQuery) ||
          snippet.code.toLowerCase().includes(lowerQuery) ||
          snippet.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
        )
      );
    
    return limit ? results.slice(0, limit) : results;
  }

  async getCollection(id: string): Promise<Collection | undefined> {
    return this.collections.get(id);
  }

  async getCollectionsByUserId(userId: string): Promise<Collection[]> {
    return Array.from(this.collections.values())
      .filter(collection => collection.userId === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createCollection(insertCollection: InsertCollection): Promise<Collection> {
    const id = randomUUID();
    const now = new Date();
    const collection: Collection = { 
      id,
      userId: insertCollection.userId,
      name: insertCollection.name,
      description: insertCollection.description ?? null,
      color: insertCollection.color ?? null,
      createdAt: now,
      updatedAt: now
    };
    this.collections.set(id, collection);
    return collection;
  }

  async updateCollection(id: string, updates: Partial<Collection>): Promise<Collection | undefined> {
    const collection = this.collections.get(id);
    if (!collection) return undefined;
    
    const updated: Collection = { 
      ...collection, 
      ...updates,
      updatedAt: new Date()
    };
    this.collections.set(id, updated);
    return updated;
  }

  async deleteCollection(id: string): Promise<boolean> {
    return this.collections.delete(id);
  }
}

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  public sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getSnippet(id: string): Promise<Snippet | undefined> {
    const [snippet] = await db.select().from(snippets).where(eq(snippets.id, id));
    return snippet;
  }

  async getSnippetsByUserId(userId: string): Promise<Snippet[]> {
    return await db.select()
      .from(snippets)
      .where(eq(snippets.userId, userId))
      .orderBy(sql`${snippets.createdAt} DESC`);
  }

  async getRecentSnippetsForSearch(userId: string, limit: number): Promise<Snippet[]> {
    return await db.select()
      .from(snippets)
      .where(eq(snippets.userId, userId))
      .orderBy(sql`${snippets.createdAt} DESC`)
      .limit(limit);
  }

  async createSnippet(insertSnippet: InsertSnippet): Promise<Snippet> {
    const [snippet] = await db.insert(snippets).values(insertSnippet).returning();
    return snippet;
  }

  async updateSnippet(id: string, updates: Partial<Snippet>): Promise<Snippet | undefined> {
    const [snippet] = await db.update(snippets)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(snippets.id, id))
      .returning();
    return snippet;
  }

  async deleteSnippet(id: string): Promise<boolean> {
    const result = await db.delete(snippets).where(eq(snippets.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async searchSnippets(userId: string, query: string, limit?: number): Promise<Snippet[]> {
    const lowerQuery = `%${query.toLowerCase()}%`;
    const queryBuilder = db.select()
      .from(snippets)
      .where(
        and(
          eq(snippets.userId, userId),
          or(
            sql`LOWER(${snippets.title}) LIKE ${lowerQuery}`,
            sql`LOWER(${snippets.description}) LIKE ${lowerQuery}`,
            sql`LOWER(${snippets.code}) LIKE ${lowerQuery}`
          )
        )
      )
      .orderBy(sql`${snippets.createdAt} DESC`); // Consistent ordering
    
    if (limit) {
      return await queryBuilder.limit(limit);
    }
    
    return await queryBuilder;
  }

  async getCollection(id: string): Promise<Collection | undefined> {
    const [collection] = await db.select().from(collections).where(eq(collections.id, id));
    return collection;
  }

  async getCollectionsByUserId(userId: string): Promise<Collection[]> {
    return await db.select()
      .from(collections)
      .where(eq(collections.userId, userId))
      .orderBy(sql`${collections.createdAt} DESC`);
  }

  async createCollection(insertCollection: InsertCollection): Promise<Collection> {
    const [collection] = await db.insert(collections).values(insertCollection).returning();
    return collection;
  }

  async updateCollection(id: string, updates: Partial<Collection>): Promise<Collection | undefined> {
    const [collection] = await db.update(collections)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(collections.id, id))
      .returning();
    return collection;
  }

  async deleteCollection(id: string): Promise<boolean> {
    const result = await db.delete(collections).where(eq(collections.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
}

// Use database storage instead of in-memory storage
export const storage = new DatabaseStorage();
