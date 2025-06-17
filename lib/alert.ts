import { NextResponse } from 'next/server';

interface AlertPayload {
  service: string;
  severity: 'critical' | 'error' | 'warning' | 'info';
  message: string;
  timestamp?: string;
  metadata?: Record<string, any>;
}

interface SlackWebhookPayload {
  text: string;
  blocks?: Array<{
    type: string;
    text?: {
      type: string;
      text: string;
    };
    fields?: Array<{
      type: string;
      text: string;
    }>;
  }>;
}

export async function sendAlert(payload: AlertPayload): Promise<boolean> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.warn('SLACK_WEBHOOK_URL not configured, skipping alert:', payload);
    return false;
  }

  try {
    const slackPayload: SlackWebhookPayload = {
      text: `🚨 ${payload.severity.toUpperCase()}: ${payload.service}`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*${getSeverityEmoji(payload.severity)} ${payload.severity.toUpperCase()}* - ${payload.service}`
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn", 
            text: payload.message
          }
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Service:*\n${payload.service}`
            },
            {
              type: "mrkdwn",
              text: `*Time:*\n${payload.timestamp || new Date().toISOString()}`
            }
          ]
        }
      ]
    };

    // Add metadata if provided
    if (payload.metadata && Object.keys(payload.metadata).length > 0) {
      const metadataText = Object.entries(payload.metadata)
        .map(([key, value]) => `*${key}:* ${value}`)
        .join('\n');
      
      slackPayload.blocks?.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Additional Info:*\n${metadataText}`
        }
      });
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(slackPayload),
    });

    if (!response.ok) {
      console.error('Failed to send Slack alert:', response.status, response.statusText);
      return false;
    }

    console.log('Alert sent successfully to Slack');
    return true;
  } catch (error) {
    console.error('Error sending Slack alert:', error);
    return false;
  }
}

function getSeverityEmoji(severity: string): string {
  switch (severity) {
    case 'critical': return '🔥';
    case 'error': return '❌';
    case 'warning': return '⚠️';
    case 'info': return 'ℹ️';
    default: return '🔔';
  }
}

// Convenience functions for different alert types
export const alertCritical = (service: string, message: string, metadata?: Record<string, any>) =>
  sendAlert({ service, severity: 'critical', message, metadata });

export const alertError = (service: string, message: string, metadata?: Record<string, any>) =>
  sendAlert({ service, severity: 'error', message, metadata });

export const alertWarning = (service: string, message: string, metadata?: Record<string, any>) =>
  sendAlert({ service, severity: 'warning', message, metadata });

export const alertInfo = (service: string, message: string, metadata?: Record<string, any>) =>
  sendAlert({ service, severity: 'info', message, metadata });