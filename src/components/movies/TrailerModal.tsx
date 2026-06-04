import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TrailerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  trailerKey: string;
}

export function TrailerModal({
  open,
  onOpenChange,
  title,
  trailerKey,
}: TrailerModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 border-cinema-gold/20">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="font-display">{title} — Trailer</DialogTitle>
        </DialogHeader>
        <div className="aspect-video w-full bg-black">
          {open && (
            <iframe
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0`}
              title={`${title} trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
