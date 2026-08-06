"use client";

import { useState, useTransition } from "react";
import { Pencil } from "lucide-react";

import { type Link } from "@/db/schema";
import { updateLink } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EditLinkDialogProps {
    link: Link;
}

export function EditLinkDialog({ link }: EditLinkDialogProps) {
    const [open, setOpen] = useState(false);
    const [url, setUrl] = useState(link.url);
    const [shortCode, setShortCode] = useState(link.shortCode);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    function handleOpenChange(next: boolean) {
        if (!next) {
            setUrl(link.url);
            setShortCode(link.shortCode);
            setError(null);
        }
        setOpen(next);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        startTransition(async () => {
            const result = await updateLink({ id: link.id, url, shortCode });
            if (result.error) {
                setError(result.error);
            } else {
                setOpen(false);
            }
        });
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 shrink-0"
                    aria-label="Edit link"
                >
                    <Pencil className="size-3.5" aria-hidden="true" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Link</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    <div className="space-y-2">
                        <Label htmlFor="edit-url">Destination URL</Label>
                        <Input
                            id="edit-url"
                            type="url"
                            placeholder="https://example.com/very/long/url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            required
                            disabled={isPending}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-shortCode">Slug</Label>
                        <Input
                            id="edit-shortCode"
                            placeholder="my-link"
                            value={shortCode}
                            onChange={(e) => setShortCode(e.target.value)}
                            required
                            disabled={isPending}
                        />
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Saving…" : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
