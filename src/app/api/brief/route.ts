import { db } from "@/db";
import { projectBriefs } from "@/db/schema";

export const dynamic = "force-dynamic";

const projectTypes = new Set(["brand", "website", "platform", "commerce", "ai", "other"]);
const budgets = new Set(["10-25", "25-50", "50-100", "100+"]);

function readText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const name = readText(payload.name, 120);
    const email = readText(payload.email, 180).toLowerCase();
    const company = readText(payload.company, 160);
    const projectType = readText(payload.projectType, 80);
    const budget = readText(payload.budget, 80);
    const details = readText(payload.details, 4000);

    if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email) || details.length < 12) {
      return Response.json(
        { ok: false, message: "تحقق من الاسم والبريد ووصف المشروع." },
        { status: 400 },
      );
    }

    if (!projectTypes.has(projectType) || !budgets.has(budget)) {
      return Response.json(
        { ok: false, message: "اختر نوع المشروع والميزانية من الخيارات المتاحة." },
        { status: 400 },
      );
    }

    const [brief] = await db
      .insert(projectBriefs)
      .values({ name, email, company: company || null, projectType, budget, details })
      .returning({ id: projectBriefs.id });

    return Response.json({ ok: true, id: brief.id }, { status: 201 });
  } catch {
    return Response.json(
      { ok: false, message: "تعذر إرسال الطلب الآن. حاول مرة أخرى خلال لحظات." },
      { status: 500 },
    );
  }
}
