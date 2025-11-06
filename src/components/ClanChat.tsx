import { CollapsibleChat } from './CollapsibleChat';

interface ClanChatProps {
  clanId: string;
}

export function ClanChat({ clanId }: ClanChatProps) {
  return (
    <CollapsibleChat
      contextId={clanId}
      contextType="clan"
      tableName="clan_messages"
      filterColumn="clan_id"
    />
  );
}
