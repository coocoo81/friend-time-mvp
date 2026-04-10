import { CreateEventForm } from "@/components/create-event-form";
import { SiteHeader } from "@/components/site-header";

export default function CreatePage() {
  return (
    <>
      <SiteHeader />
      <main className="page-shell pt-2">
        <CreateEventForm />
      </main>
    </>
  );
}
