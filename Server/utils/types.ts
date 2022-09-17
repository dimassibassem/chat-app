export type Message = {
    id: number;
    content: string;
    createdAt: Date;
    senderId: number;
    receiverId: number;
    updatedAt?: Date;
}
