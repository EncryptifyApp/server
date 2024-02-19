// rate-limit.test.ts
//@ts-ignore
import SMSService from 'src/services/SMSService';
//@ts-ignore
import { requestVerificationCode } from '../services/rateLimit';

it('should enforce rate limiting for requesting verification codes', () => {

  for (let i = 0; i < 5; i++) {
    const result = SMSService.sendVerificationCode("+31","657837991");
    if (i < 4) {
      expect(result).toBe(true);
    } else {
      expect(result).toBe(false);
    }
  }
});
