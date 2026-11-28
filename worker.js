export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Csak a /api/waitlist végpontot kezeljük itt
    if (url.pathname === "/api/waitlist") {
      if (request.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
      }

      try {
        const { email } = await request.json();

        if (!email || !email.includes("@")) {
          return Response.json(
            { error: "Kérlek, adj meg egy érvényes e-mail címet." },
            { status: 400 }
          );
        }

        const brevoResponse = await fetch("https://api.brevo.com/v3/contacts", {
          method: "POST",
          headers: {
            "accept": "application/json",
            "content-type": "application/json",
            "api-key": env.BREVO_API_KEY,
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            listIds: [2],
            updateEnabled: true,
          }),
        });

        if (!brevoResponse.ok) {
          const errorText = await brevoResponse.text();
          return Response.json(
            { error: "A Brevo elutasította a kérést.", details: errorText },
            { status: 502 }
          );
        }

        return Response.json({ ok: true }, { status: 200 });
      } catch (err) {
        return Response.json({ error: "Váratlan hiba történt." }, { status: 500 });
      }
    }

    // Minden más kérésnél (HTML, CSS, JS, képek) a statikus fájlokat szolgáljuk ki
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response("Not Found", { status: 404 });
  },
};
