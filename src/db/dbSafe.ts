import { Platform } from "react-native";

// Safe database interface that works across platforms
export interface SafeDatabase {
  initialized: boolean;
  init(): Promise<boolean>;
  query(sql: string, params?: any[]): Promise<any[]>;
  run(sql: string, params?: any[]): Promise<void>;
}

// Web-compatible SQLite implementation using a simple in-memory store for now
class WebDatabase implements SafeDatabase {
  private storage: Map<string, any[]> = new Map();
  initialized = false;

  async init(): Promise<boolean> {
    console.log('WebDatabase: Initializing web-compatible storage');
    
    // Initialize empty tables
    this.storage.set('churches', []);
    this.storage.set('members', []);
    this.storage.set('visits', []);
    this.storage.set('followups', []);
    this.storage.set('church_profiles', []);
    this.storage.set('kpi_dashboards', []);
    this.storage.set('visit_logs', []);

    // Add default data
    this.storage.set('churches', [
      { id: 'slc-bb-main', name: 'South Leeward Conference - Barbados' }
    ]);

    this.storage.set('members', [
      { 
        id: 'member-1', 
        first_name: 'John', 
        last_name: 'Smith', 
        church_id: 'slc-bb-main',
        affiliation: 'Member',
        discipleship_status: 'Active'
      },
      { 
        id: 'member-2', 
        first_name: 'Mary', 
        last_name: 'Johnson', 
        church_id: 'slc-bb-main',
        affiliation: 'Member',
        discipleship_status: 'Active'
      }
    ]);

    this.initialized = true;
    return true;
  }

  async query(sql: string, params?: any[]): Promise<any[]> {
    // Simple query parser for basic SELECT operations
    const tableName = this.extractTableName(sql);
    if (!tableName) return [];
    
    return this.storage.get(tableName) || [];
  }

  async run(sql: string, params?: any[]): Promise<void> {
    console.log('WebDatabase: Executing SQL:', sql, params);
    // For now, just log the operations
    // In a real implementation, we'd parse and execute the SQL
  }

  private extractTableName(sql: string): string | null {
    const match = sql.match(/FROM\s+(\w+)/i);
    return match ? match[1] : null;
  }
}

// Mobile SQLite implementation (will be implemented later)
class MobileDatabase implements SafeDatabase {
  initialized = false;

  async init(): Promise<boolean> {
    console.log('MobileDatabase: Native SQLite not yet implemented');
    return false;
  }

  async query(sql: string, params?: any[]): Promise<any[]> {
    return [];
  }

  async run(sql: string, params?: any[]): Promise<void> {
    // Will implement native SQLite operations
  }
}

// Factory function to create appropriate database instance
export function createSafeDatabase(): SafeDatabase {
  if (Platform.OS === 'web') {
    return new WebDatabase();
  } else {
    return new MobileDatabase();
  }
}

// Global database instance
let globalDb: SafeDatabase | null = null;

export async function initSafeDb(): Promise<SafeDatabase> {
  if (!globalDb) {
    globalDb = createSafeDatabase();
    await globalDb.init();
  }
  return globalDb;
}

export function getSafeDb(): SafeDatabase {
  if (!globalDb) {
    throw new Error('Database not initialized. Call initSafeDb() first.');
  }
  return globalDb;
}