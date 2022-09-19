import {Message} from "@/utils/messageType";

export type User = {
    id?: number;
    name: string;
    email: string;
    image: string;
    messages?: Message[];
    lastMessage?: string;
    received?: boolean;
}
