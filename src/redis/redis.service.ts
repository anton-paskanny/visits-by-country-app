import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

/**
 * Redis service for managing Redis connections and operations
 * Handles connection lifecycle, reconnection, and error handling
 */
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: RedisClientType;

  constructor(private configService: ConfigService) {}

  /**
   * Initialize Redis connection on module startup
   */
  async onModuleInit() {
    await this.connect();
  }

  /**
   * Cleanup Redis connection on module shutdown
   */
  async onModuleDestroy() {
    await this.disconnect();
  }

  /**
   * Establish connection to Redis
   */
  private async connect(): Promise<void> {
    const password = this.configService.get<string>('redis.password');
    const commandTimeout = this.configService.get<number>(
      'redis.commandTimeout',
    );
    const maxRetries: number =
      this.configService.get<number>('redis.maxRetries') ?? 3;

    const redisConfig = {
      socket: {
        host: this.configService.get<string>('redis.host'),
        port: this.configService.get<number>('redis.port'),
        reconnectStrategy: (retries: number) => {
          // Stop retrying after maxRetries attempts
          if (retries > maxRetries) {
            this.logger.error(
              `Redis max reconnection attempts (${maxRetries}) exceeded`,
            );
            return false; // Stop reconnecting
          }
          // Exponential backoff with max delay of 3 seconds
          const delay = Math.min(retries * 50, 3000);
          this.logger.log(
            `Redis reconnection attempt ${retries}/${maxRetries}, waiting ${delay}ms`,
          );
          return delay;
        },
        connectTimeout: 10000, // 10 seconds to establish connection
      },
      database: this.configService.get<number>('redis.db'),
      commandsQueueMaxLength: 1000, // Prevent memory issues during outage
      ...(commandTimeout && { commandTimeout }), // Timeout for individual commands
      ...(password && { password }),
    };

    this.client = createClient(redisConfig);

    // Event handlers
    this.client.on('error', (err) => {
      this.logger.error('Redis Client Error:', err);
    });

    this.client.on('connect', () => {
      this.logger.log('Redis Client: Connecting...');
    });

    this.client.on('ready', () => {
      this.logger.log('Redis Client: Ready ✓');
    });

    this.client.on('reconnecting', () => {
      this.logger.log('Redis Client: Reconnecting...');
    });

    this.client.on('end', () => {
      this.logger.log('Redis Client: Connection closed');
    });

    await this.client.connect();
  }

  /**
   * Disconnect from Redis gracefully
   */
  private async disconnect(): Promise<void> {
    if (this.client?.isOpen) {
      await this.client.quit();
      this.logger.log('Redis disconnected successfully ✓');
    }
  }

  /**
   * Get the Redis client instance
   * @throws Error if client is not connected
   */
  getClient(): RedisClientType {
    if (!this.client?.isOpen) {
      throw new Error('Redis client is not connected');
    }
    return this.client;
  }

  /**
   * Check if Redis is currently connected
   */
  isConnected(): boolean {
    return this.client?.isOpen || false;
  }
}
