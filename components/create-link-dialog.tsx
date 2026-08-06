"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";

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
import { createLink } from "@/app/dashboard/actions";

export function CreateLinkDialog() {
    const [open, setOpen] = useState(false);
    const [url, setUrl] = useState("");
    const [customSlug, setCustomSlug] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    function handleOpenChange(next: boolean) {
        if (!next) {
            setUrl("");
            setCustomSlug("");
            setError(null);
        }
        setOpen(next);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        startTransition(async () => {
            const result = await createLink({ url, customSlug });
            if (result.error) {
                setError(result.error);
            } else {
                setOpen(false);
                setUrl("");
                setCustomSlug("");
            }
        });
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="size-4" aria-hidden="true" />
                    Create Link
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create Short Link</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    <div className="space-y-2">
                        <Label htmlFor="url">Destination URL</Label>
                        <Input
                            id="url"
                            type="url"
                            placeholder="https://example.com/very/long/url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            required
                            disabled={isPending}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="customSlug">
                            Custom slug{" "}
                            <span className="text-muted-foreground font-normal">(optional)</span>
                        </Label>
                        <Input
                            id="customSlug"
                            placeholder="my-link"
                            value={customSlug}
                            onChange={(e) => setCustomSlug(e.target.value)}
                            disabled={isPending}
                        />
                        <p className="text-xs text-muted-foreground">
                            Leave blank to generate a random slug.
                        </p>
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
                            {isPending ? "Creating…" : "Create Link"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
