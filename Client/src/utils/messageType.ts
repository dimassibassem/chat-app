import {User} from "@/utils/userType";

export type Message = {
    id: number;
    content: string;
    createdAt: Date;
    senderId?: number;
    receiverId?: number;
    updatedAt?: Date;
    sender?: User;
    receiver?: User;
}
