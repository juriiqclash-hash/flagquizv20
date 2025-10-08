import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AdminPromptProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function AdminPrompt({ open, onConfirm, onCancel }: AdminPromptProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Als Admin einloggen?</AlertDialogTitle>
          <AlertDialogDescription>
            Du hast dich mit einem Admin-Account angemeldet. Möchtest du zum Admin-Panel wechseln?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>
            Nein, normale Website
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Ja, Admin-Panel
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
