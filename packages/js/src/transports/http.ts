import { ErrorEvent, Transport } from '@error-tracker/core';
import { HttpTransport as BaseHttpTransport } from '@error-tracker/core';

/**
 * Browser HTTP Transport
 */
export class BrowserHttpTransport extends BaseHttpTransport {
  protected async sendHttpRequest(url: string, data: ErrorEvent): Promise<void> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this['timeout']);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this['headers'],
        body: JSON.stringify(data),
        signal: controller.signal,
        keepalive: true, // Important for error tracking - send even if page is unloading
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

/**
 * Node.js HTTP Transport
 */
export class NodeHttpTransport extends BaseHttpTransport {
  protected async sendHttpRequest(url: string, data: ErrorEvent): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const https = require('https');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const http = require('http');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { URL } = require('url');

    const parsedUrl = new URL(url);
    const isHttps = parsedUrl.protocol === 'https:';
    const httpModule = isHttps ? https : http;

    const postData = JSON.stringify(data);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'POST',
      headers: {
        ...this['headers'],
        'Content-Length': Buffer.byteLength(postData),
      },
      timeout: this['timeout'],
    };

    return new Promise((resolve, reject) => {
      const req = httpModule.request(options, (res: any) => {
        let responseData = '';

        res.on('data', (chunk: Buffer) => {
          responseData += chunk;
        });

        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve();
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
          }
        });
      });

      req.on('error', (error: Error) => {
        reject(error);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.write(postData);
      req.end();
    });
  }
}

