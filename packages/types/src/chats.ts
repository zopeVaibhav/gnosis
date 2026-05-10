import { ROLE } from './enums';

export interface Chat {
    id: string;
    title: string | null;
}

export interface Message {
    id: string;
    role: ROLE;
    content: string;
    pending?: boolean;
}
