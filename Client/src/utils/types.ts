type Message = {
    id?: number;
    author?: string;
    createdAt: Date;
    updatedAt?: Date;
    content?: string;
    senderId?: number;
    receiverId?: number;
}

type User = {
    id?: number;
    name?: string;
    email?: string;
    image?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

type Data = {
    author?: string,
}



export interface ServerToClientEvents {
    broadcast: { emit(event: string, data: any, receiver): void },

    emit(event: string, data: object): void,

    on(event: string, func: (sender, receiver) => void): void;
}

export type {Message, User, Data}
