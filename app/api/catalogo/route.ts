import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const username = process.env.SAP_USER;
    const password = process.env.SAP_PASSWORD;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Faltan variables SAP_USER / SAP_PASSWORD en .env.local" },
        { status: 500 }
      );
    }

    const credentials = Buffer.from(`${username}:${password}`).toString("base64");

    const sapUrl =
      "https://l5243-iflmap.hcisbp.us2.hana.ondemand.com/http/catalogo_y2_prd?" +
      searchParams.toString();

    const sapResp = await fetch(sapUrl, {
      method: "GET",
      headers: {
        Authorization: `Basic ${credentials}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const contentType = sapResp.headers.get("content-type") || "";
    const payload = contentType.includes("application/json")
      ? await sapResp.json()
      : await sapResp.text();

    return NextResponse.json(payload, { status: sapResp.status });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error consultando SAP" }, { status: 500 });
  }
}