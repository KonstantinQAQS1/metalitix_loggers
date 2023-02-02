import platform from 'platform';
import MobileParser from 'device-detector-js/dist/parsers/device/mobiles';
import { createDecipheriv } from 'browser-crypto';

export function deepEqual(x: any, y: any): boolean {
  const ok = Object.keys;
  const tx = typeof x;
  const ty = typeof y;

  return x && y && tx === 'object' && tx === ty
    ? ok(x).length === ok(y).length && ok(x).every(key => deepEqual(x[key], y[key]))
    : x === y;
}

export function isObject(item: any): item is Object {
  return item && typeof item === 'object' && !Array.isArray(item);
}

export function mergeDeep(target: any, source: any) {
  let output = Object.assign({}, target);
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) Object.assign(output, { [key]: source[key] });
        else output[key] = mergeDeep(target[key], source[key]);
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

export const userAgent = window.navigator.userAgent;

export const isTablet =
  /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/i.test(
    userAgent,
  );
export const isMobile =
  /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer|Dolfin|Dolphin|Skyfire|Zune/.test(
    userAgent,
  );
const deviceType = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';
const mobileParser = new MobileParser();
const device = mobileParser.parse(window.navigator.userAgent);
export const systemInfo = {
  deviceModel: platform.product,
  deviceName: `${device.brand} ${device.model}`,
  deviceType,
  operatingSystemName: platform.os?.family,
  operatingSystemVersion: platform.os?.version,
};

export function decryptIamCredentials(text: string) {
  const [iv, encryptedData] = text.split(':');
  const encryptedText = Buffer.from(encryptedData, 'hex');

  const decipher = createDecipheriv(
    process.env.STREAM_ENCRYPTION_ALGORITHM ?? '',
    process.env.STREAM_SECRET_KEY ?? '',
    Buffer.from(iv, 'hex'),
  );

  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

export function delay(ms: number) {
  return new Promise(ok => setTimeout(ok, ms));
}
