import { Injectable, Logger } from '@nestjs/common';
import * as geoip from 'geoip-lite';

/**
 * Service for IP geolocation lookups
 * Provides country detection from IP addresses
 */
@Injectable()
export class GeoIpService {
  private readonly logger = new Logger(GeoIpService.name);

  /**
   * Get country code from IP address
   * @param ip - IP address to lookup
   * @returns ISO 3166-1 alpha-2 country code (lowercase) or null if not found
   */
  getCountryFromIp(ip: string): string | null {
    try {
      // Handle localhost and private IPs for development
      if (this.isLocalOrPrivateIp(ip)) {
        this.logger.debug(
          `Local/private IP detected: ${ip}, using default country 'us'`,
        );
        return 'us'; // Default for development
      }

      const geo = geoip.lookup(ip);
      if (geo && geo.country) {
        const country = geo.country.toLowerCase();
        this.logger.debug(`IP ${ip} resolved to country: ${country}`);
        return country;
      }

      this.logger.warn(`No country found for IP: ${ip}`);
      return null;
    } catch (error) {
      this.logger.error(`Error looking up IP ${ip}:`, error);
      return null;
    }
  }

  /**
   * Check if an IP is localhost or private
   * @param ip - IP address to check
   * @returns true if the IP is local or private
   */
  private isLocalOrPrivateIp(ip: string): boolean {
    if (!ip) return true;

    // Localhost patterns
    if (ip === '::1' || ip === '127.0.0.1' || ip === 'localhost') {
      return true;
    }

    // Private IP ranges
    const privateRanges = [
      /^10\./, // 10.0.0.0/8
      /^172\.(1[6-9]|2\d|3[01])\./, // 172.16.0.0/12
      /^192\.168\./, // 192.168.0.0/16
      /^fe80:/, // IPv6 link-local
      /^fc00:/, // IPv6 private
    ];

    return privateRanges.some((range) => range.test(ip));
  }

}
