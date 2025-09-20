export interface SecurityLogEntry {
  id: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  daouId: string;
  department: string;
  action: 'login_success' | 'login_failure' | 'login_blocked';
  reason?: string;
  sessionId?: string;
}

export interface LoginAttempt {
  ipAddress: string;
  attempts: number;
  lastAttempt: Date;
  blockedUntil?: Date;
}

export class SecurityLogger {
  private static readonly STORAGE_KEY = 'security_logs';
  private static readonly ATTEMPTS_KEY = 'login_attempts';
  private static readonly MAX_ATTEMPTS = 3;
  private static readonly LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
  private static readonly MAX_LOG_ENTRIES = 1000; // Keep last 1000 entries

  /**
   * Get user's IP address (simulated in browser environment)
   */
  private static async getClientIP(): Promise<string> {
    try {
      // In a real application, this would be handled by the backend
      // For demo purposes, we'll generate a simulated IP based on session
      const sessionIP = localStorage.getItem('demo_client_ip');
      if (sessionIP) {
        return sessionIP;
      }
      
      // Generate a demo IP address for testing
      const demoIP = `192.168.1.${Math.floor(Math.random() * 254) + 1}`;
      localStorage.setItem('demo_client_ip', demoIP);
      return demoIP;
    } catch (error) {
      // Fallback to localhost if all else fails
      return '127.0.0.1';
    }
  }

  /**
   * Generate unique session ID
   */
  private static generateSessionId(): string {
    return 'sess_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Get current login attempts for an IP
   */
  private static getLoginAttempts(): LoginAttempt[] {
    try {
      const attempts = localStorage.getItem(this.ATTEMPTS_KEY);
      return attempts ? JSON.parse(attempts) : [];
    } catch (error) {
      console.error('Error reading login attempts:', error);
      return [];
    }
  }

  /**
   * Save login attempts
   */
  private static saveLoginAttempts(attempts: LoginAttempt[]): void {
    try {
      localStorage.setItem(this.ATTEMPTS_KEY, JSON.stringify(attempts));
    } catch (error) {
      console.error('Error saving login attempts:', error);
    }
  }

  /**
   * Check if IP is currently blocked
   */
  public static async isBlocked(ipAddress?: string): Promise<{ blocked: boolean; remainingTime?: number }> {
    const clientIP = ipAddress || await this.getClientIP();
    const attempts = this.getLoginAttempts();
    const ipAttempt = attempts.find(attempt => attempt.ipAddress === clientIP);

    if (!ipAttempt || !ipAttempt.blockedUntil) {
      return { blocked: false };
    }

    const now = new Date();
    const blockedUntil = new Date(ipAttempt.blockedUntil);

    if (now < blockedUntil) {
      const remainingTime = Math.ceil((blockedUntil.getTime() - now.getTime()) / 1000);
      return { blocked: true, remainingTime };
    } else {
      // Block has expired, remove it
      ipAttempt.blockedUntil = undefined;
      ipAttempt.attempts = 0;
      this.saveLoginAttempts(attempts);
      return { blocked: false };
    }
  }

  /**
   * Record a login attempt
   */
  public static async recordLoginAttempt(
    daouId: string,
    department: string,
    success: boolean,
    reason?: string
  ): Promise<{ success: boolean; error?: string; remainingTime?: number }> {
    try {
      const clientIP = await this.getClientIP();
      const userAgent = navigator.userAgent;
      const timestamp = new Date();

      // Check if already blocked
      const blockStatus = await this.isBlocked(clientIP);
      if (blockStatus.blocked) {
        // Log the blocked attempt
        await this.logEntry({
          id: this.generateSessionId(),
          timestamp,
          ipAddress: clientIP,
          userAgent,
          daouId,
          department,
          action: 'login_blocked',
          reason: `IP blocked due to too many failed attempts. ${blockStatus.remainingTime} seconds remaining.`
        });

        return { 
          success: false, 
          error: `로그인이 일시적으로 제한되었습니다. ${Math.ceil((blockStatus.remainingTime || 0) / 60)}분 후 다시 시도해주세요.`,
          remainingTime: blockStatus.remainingTime
        };
      }

      // Log the attempt
      await this.logEntry({
        id: this.generateSessionId(),
        timestamp,
        ipAddress: clientIP,
        userAgent,
        daouId,
        department,
        action: success ? 'login_success' : 'login_failure',
        reason,
        sessionId: success ? this.generateSessionId() : undefined
      });

      // Handle failed attempts
      if (!success) {
        const attempts = this.getLoginAttempts();
        let ipAttempt = attempts.find(attempt => attempt.ipAddress === clientIP);

        if (!ipAttempt) {
          ipAttempt = {
            ipAddress: clientIP,
            attempts: 0,
            lastAttempt: timestamp
          };
          attempts.push(ipAttempt);
        }

        ipAttempt.attempts += 1;
        ipAttempt.lastAttempt = timestamp;

        // Check if we need to block
        if (ipAttempt.attempts >= this.MAX_ATTEMPTS) {
          ipAttempt.blockedUntil = new Date(timestamp.getTime() + this.LOCKOUT_DURATION);
          this.saveLoginAttempts(attempts);

          // Log the block
          await this.logEntry({
            id: this.generateSessionId(),
            timestamp: new Date(),
            ipAddress: clientIP,
            userAgent,
            daouId,
            department,
            action: 'login_blocked',
            reason: `IP blocked after ${this.MAX_ATTEMPTS} failed login attempts`
          });

          return { 
            success: false, 
            error: `3회 이상 로그인에 실패하여 5분간 로그인이 제한됩니다.`,
            remainingTime: this.LOCKOUT_DURATION / 1000
          };
        }

        this.saveLoginAttempts(attempts);
        return { success: false };
      } else {
        // Reset attempts on successful login
        const attempts = this.getLoginAttempts();
        const ipAttemptIndex = attempts.findIndex(attempt => attempt.ipAddress === clientIP);
        if (ipAttemptIndex >= 0) {
          attempts.splice(ipAttemptIndex, 1);
          this.saveLoginAttempts(attempts);
        }
        return { success: true };
      }
    } catch (error) {
      console.error('Error recording login attempt:', error);
      return { success: false, error: '보안 로그 기록 중 오류가 발생했습니다.' };
    }
  }

  /**
   * Log a security event
   */
  private static async logEntry(entry: SecurityLogEntry): Promise<void> {
    try {
      const logs = this.getSecurityLogs();
      logs.unshift(entry); // Add to beginning for chronological order

      // Keep only the last MAX_LOG_ENTRIES
      if (logs.length > this.MAX_LOG_ENTRIES) {
        logs.splice(this.MAX_LOG_ENTRIES);
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(logs));
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  }

  /**
   * Get all security logs
   */
  public static getSecurityLogs(): SecurityLogEntry[] {
    try {
      const logs = localStorage.getItem(this.STORAGE_KEY);
      return logs ? JSON.parse(logs).map((log: any) => ({
        ...log,
        timestamp: new Date(log.timestamp)
      })) : [];
    } catch (error) {
      console.error('Error reading security logs:', error);
      return [];
    }
  }

  /**
   * Get filtered security logs
   */
  public static getFilteredLogs(
    limit?: number,
    action?: SecurityLogEntry['action'],
    startDate?: Date,
    endDate?: Date
  ): SecurityLogEntry[] {
    let logs = this.getSecurityLogs();

    // Filter by action
    if (action) {
      logs = logs.filter(log => log.action === action);
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
   * Clear all security logs (admin only)
   */
  public static clearLogs(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.ATTEMPTS_KEY);
  }

  /**
   * Get current login attempt statistics
   */
  public static getAttemptStats(): {
    totalAttempts: number;
    blockedIPs: number;
    recentFailures: number;
  } {
    const attempts = this.getLoginAttempts();
    const logs = this.getSecurityLogs();
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const blockedIPs = attempts.filter(attempt => 
      attempt.blockedUntil && new Date(attempt.blockedUntil) > now
    ).length;

    const recentFailures = logs.filter(log => 
      log.action === 'login_failure' && log.timestamp >= oneHourAgo
    ).length;

    return {
      totalAttempts: attempts.reduce((sum, attempt) => sum + attempt.attempts, 0),
      blockedIPs,
      recentFailures
    };
  }
}