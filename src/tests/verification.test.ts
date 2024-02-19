
import SMSService from "src/services/SMSService";

it('should send a 6-digit verification code to the client', () => {
  const verificationCode = SMSService.sendVerificationCode("+31","657837991");
  expect(verificationCode).toHaveLength(6);
});
