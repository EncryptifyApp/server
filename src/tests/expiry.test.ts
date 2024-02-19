// expiry.test.ts
//@ts-ignore
import { expireVerificationCode, generateNewCode } from '../services/expiry';

it('should expire old 6-digit verification codes and generate a new one', () => {
  const oldVerificationCode = '467363';
  const isExpired = expireVerificationCode(oldVerificationCode);
  expect(isExpired).toBe(true);

  const newVerificationCode = generateNewCode();
  expect(newVerificationCode).toHaveLength(6);

});
