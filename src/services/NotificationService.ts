import fetch from 'node-fetch';

class NotificationService {
  async sendPushNotification(message: 
    {userExpoToken:string, title: string, body: string, data?: {chatId: string}}) {
    const expoMessage = {
      to: message.userExpoToken,
      sound: 'default',
      title: message.title,
      body: message.body,
      data: message.data,
    };

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer Ft-r4LIo06QhJaLzlvE3dMMZ-LbL0Vpi08NmiQtZ`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(expoMessage),
    });

    const data = await response.json();
    return data;
  }
}

export default new NotificationService();
