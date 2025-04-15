const winston = require('winston');
const { createLogger, format, transports } = winston;
const { combine, timestamp, printf, colorize } = format;

// Security event logger
const securityLogger = createLogger({
  format: combine(
    timestamp(),
    colorize(),
    printf(({ level, message, timestamp, ...metadata }) => {
      let msg = `${timestamp} [${level}] : ${message}`;
      if (Object.keys(metadata).length > 0) {
        msg += JSON.stringify(metadata);
      }
      return msg;
    })
  ),
  transports: [
    new transports.File({ filename: 'logs/security.log', level: 'warn' }),
    new transports.Console({ level: 'info' })
  ]
});

// System health logger
const healthLogger = createLogger({
  format: combine(
    timestamp(),
    colorize(),
    printf(({ level, message, timestamp, ...metadata }) => {
      let msg = `${timestamp} [${level}] : ${message}`;
      if (Object.keys(metadata).length > 0) {
        msg += JSON.stringify(metadata);
      }
      return msg;
    })
  ),
  transports: [
    new transports.File({ filename: 'logs/health.log' }),
    new transports.Console()
  ]
});

class SecurityMonitor {
  constructor() {
    this.failedLoginAttempts = new Map();
    this.suspiciousIPs = new Map();
    this.alertThresholds = {
      failedLogins: 5,
      suspiciousRequests: 100,
      apiErrors: 50
    };
  }

  trackFailedLogin(ip, email) {
    const attempts = this.failedLoginAttempts.get(ip) || 0;
    this.failedLoginAttempts.set(ip, attempts + 1);

    if (attempts + 1 >= this.alertThresholds.failedLogins) {
      this.alert('Multiple failed login attempts', {
        ip,
        email,
        attempts: attempts + 1
      });
    }
  }

  trackSuspiciousActivity(ip, activity) {
    const count = this.suspiciousIPs.get(ip) || 0;
    this.suspiciousIPs.set(ip, count + 1);

    if (count + 1 >= this.alertThresholds.suspiciousRequests) {
      this.alert('Suspicious activity detected', {
        ip,
        activity,
        count: count + 1
      });
    }
  }

  trackApiError(error, endpoint) {
    securityLogger.error('API Error', {
      error: error.message,
      endpoint,
      stack: error.stack
    });
  }

  alert(message, metadata) {
    securityLogger.warn('Security Alert', {
      message,
      ...metadata
    });
  }

  resetFailedLogins(ip) {
    this.failedLoginAttempts.delete(ip);
  }

  resetSuspiciousIP(ip) {
    this.suspiciousIPs.delete(ip);
  }
}

class HealthMonitor {
  constructor() {
    this.metrics = {
      apiLatency: [],
      errorRates: {},
      activeUsers: 0,
      systemLoad: []
    };
  }

  trackApiLatency(endpoint, duration) {
    this.metrics.apiLatency.push({
      endpoint,
      duration,
      timestamp: new Date()
    });

    // Keep only last 1000 measurements
    if (this.metrics.apiLatency.length > 1000) {
      this.metrics.apiLatency.shift();
    }
  }

  trackError(endpoint) {
    this.metrics.errorRates[endpoint] = (this.metrics.errorRates[endpoint] || 0) + 1;
  }

  updateActiveUsers(count) {
    this.metrics.activeUsers = count;
  }

  trackSystemLoad(load) {
    this.metrics.systemLoad.push({
      load,
      timestamp: new Date()
    });

    // Keep only last 100 measurements
    if (this.metrics.systemLoad.length > 100) {
      this.metrics.systemLoad.shift();
    }
  }

  getMetrics() {
    return {
      ...this.metrics,
      averageLatency: this.calculateAverageLatency(),
      errorRate: this.calculateErrorRate(),
      systemLoad: this.calculateAverageLoad()
    };
  }

  calculateAverageLatency() {
    if (this.metrics.apiLatency.length === 0) return 0;
    const sum = this.metrics.apiLatency.reduce((acc, curr) => acc + curr.duration, 0);
    return sum / this.metrics.apiLatency.length;
  }

  calculateErrorRate() {
    const totalRequests = Object.values(this.metrics.errorRates).reduce((acc, curr) => acc + curr, 0);
    return totalRequests / 1000; // Error rate per 1000 requests
  }

  calculateAverageLoad() {
    if (this.metrics.systemLoad.length === 0) return 0;
    const sum = this.metrics.systemLoad.reduce((acc, curr) => acc + curr.load, 0);
    return sum / this.metrics.systemLoad.length;
  }
}

// Create singleton instances
const securityMonitor = new SecurityMonitor();
const healthMonitor = new HealthMonitor();

module.exports = {
  securityLogger,
  healthLogger,
  securityMonitor,
  healthMonitor
}; 