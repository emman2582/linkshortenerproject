import { redirect, notFound } from "next/navigation";

import { getLinkByShortCode } from "@/data/links";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ shortcode: string }> },
) {
    const { shortcode } = await params;
    const link = await getLinkByShortCode(shortcode);

    if (!link) {
        notFound();
    }

    redirect(link.url);
}
