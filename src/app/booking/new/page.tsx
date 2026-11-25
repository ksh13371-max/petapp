import { redirect, notFound } from "next/navigation";
import { getCustomerSession } from "@/lib/auth";
import { getBusinessById, listServicesByBusiness, listOptionsByBusiness, listPetsByCustomer } from "@/lib/queries";
import { BookingWizard } from "@/components/BookingWizard";

export default async function NewBookingPage({ searchParams }: PageProps<"/booking/new">) {
  const session = await getCustomerSession();
  if (!session) redirect("/login");

  const { businessId } = await searchParams;
  if (typeof businessId !== "string") notFound();

  const business = await getBusinessById(businessId);
  if (!business) notFound();

  const services = await listServicesByBusiness(businessId);
  const options = await listOptionsByBusiness(businessId);
  const pets = await listPetsByCustomer(session.sub);

  return <BookingWizard business={business} services={services} options={options} pets={pets} />;
}
