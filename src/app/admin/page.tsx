import { isAdminAuthenticated } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import AdminLoginForm from "@/components/AdminLoginForm";
import AdminLogoutButton from "@/components/AdminLogoutButton";
import { getAllServices } from "@/lib/services";
import { getAllClasses } from "@/lib/classSchedule";
import AdminTabs from "@/components/AdminTabs";

export const metadata = { title: "Admin — Gompa Porto" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const authed = await isAdminAuthenticated();

  if (!authed) {
    return (
      <div className="px-4">
        <AdminLoginForm />
      </div>
    );
  }

  const [bookings, orders, reservations, classes, teachers, rooms, therapySlots, windows, settingsRow, allServices] =
    await Promise.all([
      prisma.booking.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
      prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
      prisma.seatReservation.findMany({
        where: { classDate: { gte: new Date() } },
        orderBy: { classDate: "asc" },
        take: 100,
      }),
      getAllClasses(),
      prisma.teacher.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.room.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.therapySlot.findMany({
        where: { date: { gte: new Date() } },
        orderBy: { date: "asc" },
        include: { teacher: true, room: true },
        take: 100,
      }),
      prisma.availabilityWindow.findMany({
        include: { teacher: true, room: true },
        orderBy: [{ weekday: "asc" }, { startTime: "asc" }],
      }),
      prisma.therapySettings.findUnique({ where: { id: "singleton" } }),
      getAllServices(),
    ]);

  const settings = settingsRow ?? { breakMinutes: 15, lunchStart: null, lunchEnd: null };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-maroon">Painel Administrativo</h1>
        <AdminLogoutButton />
      </div>

      <AdminTabs
        bookings={bookings}
        orders={orders}
        reservations={reservations}
        classes={classes}
        teachers={teachers}
        rooms={rooms}
        therapySlots={therapySlots}
        windows={windows}
        settings={settings}
        allServices={allServices}
      />
    </div>
  );
}
