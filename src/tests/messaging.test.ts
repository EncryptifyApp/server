// messaging.test.ts
//@ts-ignore
import { checkIfEcrypted } from '../services/messaging';

it('should receive an encrypted message from the client', () => {
    const originalMessage = 'Hello World';
    const encryptedMessage = checkIfEcrypted(originalMessage);
  
    expect(encryptedMessage).toBe(false);
  });
