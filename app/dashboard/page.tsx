import { auth } from "@clerk/nextjs/server";
import { ExternalLink, Link2 } from "lucide-react";

import { getUserLinks } from "@/data/links";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateLinkDialog } from "@/components/create-link-dialog";
import { EditLinkDialog } from "@/components/edit-link-dialog";
import { DeleteLinkDialog } from "@/components/delete-link-dialog";

export default async function DashboardPage() {
    const { userId } = await auth();
    const links = await getUserLinks(userId!);

    return (
        <main className="flex flex-1 justify-center px-6 py-10">
            <div className="w-full max-w-4xl space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight">My Links</h1>
                        <p className="text-sm text-muted-foreground">
                            {links.length} {links.length === 1 ? "link" : "links"} created
                        </p>
                    </div>
                    <CreateLinkDialog />
                </div>

                {links.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                <Link2 className="size-6 text-muted-foreground" aria-hidden="true" />
                            </div>
                            <p className="font-medium">No links yet</p>
                            <p className="text-sm text-muted-foreground">
                                Create your first short link to get started.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {links.map((link) => (
                            <Card key={link.id}>
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between gap-4">
                                        <CardTitle>
                                            <Badge variant="secondary" className="font-mono text-sm">
                                                /{link.shortCode}
                                            </Badge>
                                        </CardTitle>
                                        <div className="flex items-center gap-1">
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(link.createdAt).toLocaleDateString()}
                                            </span>
                                            <EditLinkDialog link={link} />
                                            <DeleteLinkDialog linkId={link.id} shortCode={link.shortCode} />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 truncate text-sm text-muted-foreground hover:text-foreground"
                                    >
                                        <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
                                        <span className="truncate">{link.url}</span>
                                    </a>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}

