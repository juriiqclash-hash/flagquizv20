import { CollapsibleChat } from './CollapsibleChat';

interface FriendChatProps {
  friendshipId: string;
}

export function FriendChat({ friendshipId }: FriendChatProps) {
  return (
    <CollapsibleChat
      contextId={friendshipId}
      contextType="friend"
      tableName="friend_messages"
      filterColumn="friendship_id"
    />
  );
}
