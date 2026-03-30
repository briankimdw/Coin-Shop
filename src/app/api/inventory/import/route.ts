import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
  }
  result.push(current.trim());
  return result;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "CSV file is required" },
        { status: 400 }
      );
    }

    const text = await file.text();
    const lines = text.split("\n").filter((line) => line.trim());

    if (lines.length < 2) {
      return NextResponse.json(
        { error: "CSV file must have a header row and at least one data row" },
        { status: 400 }
      );
    }

    const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase().trim());
    let importedCount = 0;

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      const row: Record<string, string> = {};

      headers.forEach((header, index) => {
        row[header] = values[index] || "";
      });

      const title = row["title"];
      if (!title) continue;

      const category = row["category"] || "Other";
      const askingPrice = parseFloat(row["asking price"] || row["askingprice"] || "0");
      if (isNaN(askingPrice) || askingPrice <= 0) continue;

      const slug = slugify(title);
      let finalSlug = slug;
      let counter = 1;
      while (await prisma.coinListing.findUnique({ where: { slug: finalSlug } })) {
        finalSlug = `${slug}-${counter}`;
        counter++;
      }

      await prisma.coinListing.create({
        data: {
          title,
          slug: finalSlug,
          category,
          metal: row["metal"] || null,
          year: row["year"] ? parseInt(row["year"]) || null : null,
          mintMark: row["mint mark"] || row["mintmark"] || null,
          grade: row["grade"] || null,
          certification: row["certification"] || null,
          certNumber: row["cert number"] || row["certnumber"] || null,
          description: row["description"] || null,
          costBasis: row["cost basis"] || row["costbasis"]
            ? parseFloat(row["cost basis"] || row["costbasis"]) || null
            : null,
          askingPrice,
          quantity: row["quantity"] ? parseInt(row["quantity"]) || 1 : 1,
          featured: row["featured"]?.toLowerCase() === "true",
          sold: row["sold"]?.toLowerCase() === "true",
          images: row["images"] || "[]",
        },
      });

      importedCount++;
    }

    return NextResponse.json({
      message: `Successfully imported ${importedCount} items`,
      count: importedCount,
    });
  } catch (error) {
    console.error("Error importing inventory:", error);
    return NextResponse.json(
      { error: "Failed to import inventory" },
      { status: 500 }
    );
  }
}
