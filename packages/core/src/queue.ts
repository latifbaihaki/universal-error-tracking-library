import { ErrorEvent } from './types';

/**
 * Queue item
 */
interface QueueItem {
  event: ErrorEvent;
  timestamp: number;
  retries: number;
}

/**
 * Queue manager for offline error storage
 */
export class QueueManager {
  private queue: QueueItem[] = [];
  private maxQueueSize: number;
  private maxRetries: number;

  constructor(maxQueueSize: number = 100, maxRetries: number = 3) {
    this.maxQueueSize = maxQueueSize;
    this.maxRetries = maxRetries;
  }

  /**
   * Add event to queue
   */
  add(event: ErrorEvent): void {
    const item: QueueItem = {
      event,
      timestamp: Date.now(),
      retries: 0,
    };

    this.queue.push(item);

    // Remove oldest items if queue is full
    if (this.queue.length > this.maxQueueSize) {
      this.queue = this.queue.slice(-this.maxQueueSize);
    }
  }

  /**
   * Get next item from queue
   */
  getNext(): QueueItem | null {
    return this.queue.length > 0 ? this.queue[0] : null;
  }

  /**
   * Remove item from queue
   */
  remove(item: QueueItem): void {
    const index = this.queue.indexOf(item);
    if (index > -1) {
      this.queue.splice(index, 1);
    }
  }

  /**
   * Increment retry count for an item
   */
  incrementRetry(item: QueueItem): boolean {
    item.retries += 1;
    if (item.retries > this.maxRetries) {
      this.remove(item);
      return false;
    }
    return true;
  }

  /**
   * Get queue size
   */
  size(): number {
    return this.queue.length;
  }

  /**
   * Check if queue is empty
   */
  isEmpty(): boolean {
    return this.queue.length === 0;
  }

  /**
   * Clear queue
   */
  clear(): void {
    this.queue = [];
  }

  /**
   * Get all items in queue
   */
  getAll(): QueueItem[] {
    return [...this.queue];
  }
}

