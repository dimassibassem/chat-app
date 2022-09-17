export type Message = {
    id: number;
    content: string;
    createdAt: Date;
    senderId?: number;
    receiverId?: number;
    updatedAt?: Date;
    sender?: string;
    receiver?: string;
}

export type User = {
    id?: number;
    name: string;
    email: string;
    image: string;
    messages?: Message[];

}
