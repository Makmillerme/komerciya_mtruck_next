import { redirect } from "next/navigation";

/** Розділ прибрано з навігації; старі закладки ведуть на головну. */
export default function InvoicesRedirectPage() {
  redirect("/");
}
