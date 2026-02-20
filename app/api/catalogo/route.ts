export async function POST(req: Request) {
  const payload = await req.json();

  const response = await fetch(
    "https://l5243-iflmap.hcisbp.us2.hana.ondemand.com/http/catalogo_y2_prd",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  const data = await response.json();

  return Response.json(data);
}