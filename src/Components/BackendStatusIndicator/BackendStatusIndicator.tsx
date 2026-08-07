import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { apiBaseUrl } from '../../Services/Api';
import './BackendStatusIndicator.css';

export interface BackendStatus {
  status: 'online' | 'caution' | 'offline';
  responseTime?: number;
  lastCheck: Date;
  message: string;
}

const BackendStatusIndicator: React.FC = () => {
  const [backendStatus, setBackendStatus] = useState<BackendStatus>({
    status: 'offline',
    lastCheck: new Date(),
    message: 'Checking...'
  });

  const checkBackendHealth = async (): Promise<BackendStatus> => {
    const startTime = Date.now();
    
    try {
      console.log('[HEALTH CHECK] Starting backend health check...');
      // Probes the SAME backend Api.ts talks to. This used to hardcode
      // http://localhost:8080/health -- the experimental semantic engine's
      // port -- so the status light reported on a service the app never
      // called, and read "offline" whenever that local script wasn't
      // running even though the real API was fine. The Django API's `/`
      // index route is unauthenticated and returns 200, which is what
      // makes it usable as a health probe without a token.
      const response = await axios.get(`${apiBaseUrl}/`, {
        timeout: 3000, // 3 second timeout
        headers: {
          'Accept': 'application/json'
        }
      });

      const responseTime = Date.now() - startTime;
      console.log(`[HEALTH CHECK] ✅ Success: ${response.status} in ${responseTime}ms`);
      console.log('[HEALTH CHECK] Response data:', response.data);
      
      if (response.status === 200 && response.data) {
        // Green: Fast and healthy
        if (responseTime < 1000) {
          return {
            status: 'online',
            responseTime,
            lastCheck: new Date(),
            message: `✅ Backend Online (${responseTime}ms)`
          };
        } 
        // Yellow: Slow but responding
        else {
          return {
            status: 'caution',
            responseTime,
            lastCheck: new Date(),
            message: `⚠️ Backend Slow (${responseTime}ms)`
          };
        }
      } else {
        console.log('[HEALTH CHECK] ❌ Bad response:', response.status, response.data);
        // Red: Bad response
        return {
          status: 'offline',
          responseTime,
          lastCheck: new Date(),
          message: '🔴 Backend Error Response'
        };
      }
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      console.error('[HEALTH CHECK] ❌ Failed:', error);
      console.error('[HEALTH CHECK] Error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.status,
        responseTime
      });
      
      // Red: Connection failed
      return {
        status: 'offline',
        responseTime,
        lastCheck: new Date(),
        message: `🔴 Backend Offline (${error.code || 'Connection Failed'})`
      };
    }
  };

  useEffect(() => {
    // Don't poll a real backend from unit tests -- rendering <App /> would
    // otherwise fire outbound HTTP from jsdom on every test run.
    if (import.meta.env.MODE === 'test') {
      setBackendStatus({
        status: 'offline',
        lastCheck: new Date(),
        message: 'Health check disabled in tests',
      });
      return;
    }

    // Initial check
    checkBackendHealth().then(setBackendStatus);

    // Check every 10 seconds (reduced frequency to prevent backend overload)
    const interval = setInterval(() => {
      checkBackendHealth().then(setBackendStatus);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (): string => {
    switch (backendStatus.status) {
      case 'online': return '#00ff00'; // Bright Green = Go!
      case 'caution': return '#ffff00'; // Bright Yellow = Caution
      case 'offline': return '#ff0000'; // Bright Red = Stop!
      default: return '#888888'; // Gray = Unknown
    }
  };

  const getStatusIcon = (): string => {
    switch (backendStatus.status) {
      case 'online': return '●'; // Solid circle
      case 'caution': return '●'; // Solid circle
      case 'offline': return '●'; // Solid circle
      default: return '○'; // Empty circle
    }
  };

  return (
    <div className="backend-status-indicator">
      <div 
        className="status-light" 
        style={{ 
          backgroundColor: getStatusColor(),
          boxShadow: `0 0 10px ${getStatusColor()}`
        }}
        title={`${backendStatus.message}\nLast Check: ${backendStatus.lastCheck.toLocaleTimeString()}`}
      >
        {getStatusIcon()}
      </div>
      <div className="status-text">
        <span className="status-message">{backendStatus.message}</span>
        <span className="status-time">
          {backendStatus.lastCheck.toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};

export default BackendStatusIndicator;