import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { studioAccess } from "@/server/studioAuth";

export const dynamic = "force-dynamic";

/** /studio → Developer Mode (owner credentials checked here too). */
export default async function StudioIndex() {
  if (studioAccess((await headers()).get("authorization")) !== "authorised") notFound();
  redirect("/studio/dev");
}
