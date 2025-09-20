export interface AccessLogEntry {
  id: string;
  timestamp: Date;
  daouId: string;
  name: string;
  department: string;
  role: 'admin' | 'user';
  sessionId: string;
}

export class SimpleLogger {
  private static readonly STORAGE_KEY = 'access_logs';
  private static readonly MAX_LOG_ENTRIES = 500; // Keep last 500 entries

  /**
   * Generate unique session ID
   */
  private static generateSessionId(): string {
    return 'sess_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Record a successful login
   */
  public static recordLogin(
    daouId: string,
    name: string,
    department: string,
    role: 'admin' | 'user'
  ): string {
    const sessionId = this.generateSessionId();
    
    const entry: AccessLogEntry = {
      id: sessionId,
      timestamp: new Date(),
      daouId,
      name,
      department,
      role,
      sessionId
    };

    try {
      const logs = this.getAccessLogs();
      logs.unshift(entry); // Add to beginning for chronological order

      // Keep only the last MAX_LOG_ENTRIES
      if (logs.length > this.MAX_LOG_ENTRIES) {
        logs.splice(this.MAX_LOG_ENTRIES);
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(logs));
    } catch (error) {
      console.error('Error recording login:', error);
    }

    return sessionId;
  }

  /**
   * Get all access logs
   */
  public static getAccessLogs(): AccessLogEntry[] {
    try {
      const logs = localStorage.getItem(this.STORAGE_KEY);
      return logs ? JSON.parse(logs).map((log: any) => ({
        ...log,
        timestamp: new Date(log.timestamp)
      })) : [];
    } catch (error) {
      console.error('Error reading access logs:', error);
      return [];
    }
  }

  /**
   * Get filtered access logs
   */
  public static getFilteredLogs(
    limit?: number,
    role?: 'admin' | 'user',
    startDate?: Date,
    endDate?: Date
  ): AccessLogEntry[] {
    let logs = this.getAccessLogs();

    // Filter by role
    if (role) {
      logs = logs.filter(log => log.role === role);
    }

    // Filter by date range
    if (startDate) {
      logs = logs.filter(log => log.timestamp >= startDate);
    }
    if (endDate) {
      logs = logs.filter(log => log.timestamp <= endDate);
    }

    // Limit results
    if (limit) {
      logs = logs.slice(0, limit);
    }

    return logs;
  }

  /**
   * Clear all access logs (admin only)
   */
  public static clearLogs(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Get basic access statistics
   */
  public static getStats(): {
    totalLogins: number;
    adminLogins: number;
    userLogins: number;
    todayLogins: number;
  } {
    const logs = this.getAccessLogs();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const adminLogins = logs.filter(log => log.role === 'admin').length;
    const userLogins = logs.filter(log => log.role === 'user').length;
    const todayLogins = logs.filter(log => log.timestamp >= today).length;

    return {
      totalLogins: logs.length,
      adminLogins,
      userLogins,
      todayLogins
    };
  }
}