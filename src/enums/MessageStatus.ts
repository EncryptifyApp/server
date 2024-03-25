import { registerEnumType } from "type-graphql";

export enum MessageStatus {
    SENT = 'SENT',
    DELIVERED = 'DELIVERED',
    READ = 'READ',
    PENDING = 'PENDING',
    FAILED = 'FAILED',
    DELETED = 'DELETED'
}


registerEnumType(MessageStatus, {
    name: "MessageStatus",
    description: "status of the message",
});