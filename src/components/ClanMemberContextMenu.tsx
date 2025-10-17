import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { UserMinus, ChevronUp, ChevronDown, Crown, Shield, Star, UserCheck } from "lucide-react";

interface ClanMemberContextMenuProps {
  children: React.ReactNode;
  currentUserRole: string;
  memberRole: string;
  isCurrentUser: boolean;
  onKick: () => void;
  onPromote: (role: string) => void;
  onDemote: (role: string) => void;
}

const ROLE_HIERARCHY = {
  'leader': 6,
  'vice_leader': 5,
  'elite_member': 4,
  'moderator': 3,
  'member': 2,
  'newbie': 1
};

const ROLE_LABELS = {
  'leader': '👑 Anführer',
  'vice_leader': '⭐ Vize-Anführer',
  'elite_member': '💎 Elite-Member',
  'moderator': '🛡️ Moderator',
  'member': '✅ Member',
  'newbie': '🌱 Neuling'
};

const ROLE_ICONS = {
  'leader': Crown,
  'vice_leader': Star,
  'elite_member': Star,
  'moderator': Shield,
  'member': UserCheck,
  'newbie': UserCheck
};

export function ClanMemberContextMenu({
  children,
  currentUserRole,
  memberRole,
  isCurrentUser,
  onKick,
  onPromote,
  onDemote,
}: ClanMemberContextMenuProps) {
  const currentUserLevel = ROLE_HIERARCHY[currentUserRole as keyof typeof ROLE_HIERARCHY] || 0;
  const memberLevel = ROLE_HIERARCHY[memberRole as keyof typeof ROLE_HIERARCHY] || 0;

  // Only leader and vice_leader can manage members
  const canManage = currentUserLevel >= 5;
  
  // Can only manage members with lower rank
  const canManageThisMember = canManage && currentUserLevel > memberLevel && !isCurrentUser;

  // Can't kick the leader
  const canKick = canManageThisMember && memberRole !== 'leader';

  // Get available promotion roles (only higher than current role, but not higher than current user's role)
  const availablePromotions = Object.entries(ROLE_HIERARCHY)
    .filter(([role, level]) => 
      level > memberLevel && 
      level < currentUserLevel &&
      role !== 'leader' // Can't promote to leader
    )
    .map(([role]) => role);

  // Get available demotion roles (only lower than current role)
  const availableDemotions = Object.entries(ROLE_HIERARCHY)
    .filter(([role, level]) => 
      level < memberLevel &&
      level >= 1 // At minimum newbie
    )
    .map(([role]) => role);

  if (!canManageThisMember) {
    return <>{children}</>;
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        {availablePromotions.length > 0 && (
          <>
            <ContextMenuSub>
              <ContextMenuSubTrigger>
                <ChevronUp className="mr-2 h-4 w-4" />
                Befördern
              </ContextMenuSubTrigger>
              <ContextMenuSubContent>
                {availablePromotions.map(role => {
                  const Icon = ROLE_ICONS[role as keyof typeof ROLE_ICONS];
                  return (
                    <ContextMenuItem key={role} onClick={() => onPromote(role)}>
                      <Icon className="mr-2 h-4 w-4" />
                      {ROLE_LABELS[role as keyof typeof ROLE_LABELS]}
                    </ContextMenuItem>
                  );
                })}
              </ContextMenuSubContent>
            </ContextMenuSub>
          </>
        )}

        {availableDemotions.length > 0 && (
          <>
            <ContextMenuSub>
              <ContextMenuSubTrigger>
                <ChevronDown className="mr-2 h-4 w-4" />
                Degradieren
              </ContextMenuSubTrigger>
              <ContextMenuSubContent>
                {availableDemotions.map(role => {
                  const Icon = ROLE_ICONS[role as keyof typeof ROLE_ICONS];
                  return (
                    <ContextMenuItem key={role} onClick={() => onDemote(role)}>
                      <Icon className="mr-2 h-4 w-4" />
                      {ROLE_LABELS[role as keyof typeof ROLE_LABELS]}
                    </ContextMenuItem>
                  );
                })}
              </ContextMenuSubContent>
            </ContextMenuSub>
          </>
        )}

        {(availablePromotions.length > 0 || availableDemotions.length > 0) && canKick && (
          <ContextMenuSeparator />
        )}

        {canKick && (
          <ContextMenuItem 
            onClick={onKick}
            className="text-destructive focus:text-destructive"
          >
            <UserMinus className="mr-2 h-4 w-4" />
            Kicken
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}