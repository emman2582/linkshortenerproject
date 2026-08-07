import { notFound } from "next/navigation";
import { NextResponse } from "next/server";

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

  return NextResponse.redirect(link.url, {
    headers: { "Referrer-Policy": "no-referrer" },
  });
}
