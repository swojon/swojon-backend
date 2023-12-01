import { Listing } from "./listing.interface";
import { User } from "./users.interface";
export interface ChatRoomMember {
  userId?: number | null;
}

export interface Chat {
  id?: number | null;
  sender: User;
  content: string ;
  chatRoom: ChatRoom;
  isDeleted?: boolean | null;
  dateSent?: Date | null;
  isRead?: boolean | null;
  members?: number[] | null;
  relatedListing?: Listing | null;

}


export interface ChatRoomWithMessage {
  id?: number | null;
  chatName?: string | null;
  messages?: Chat[];
}

export interface ChatRoom {
  id?: number | null;
  chatName?: string | null;
  // context: null;

}

export interface chatRoomList{
  items: ChatRoom[];
  count: number;
}

export interface ChatMessageList{
  items: Chat[];
  count: number;
}
