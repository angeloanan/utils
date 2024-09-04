import type { APIRoute } from "astro";

const resolveVanity = async (vanity: string): Promise<string | undefined> => {
  const urlQuery = new URLSearchParams({
    key: import.meta.env.STEAM_API_KEY,
    vanityurl: vanity
  })

  const req = await fetch('https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1?' + urlQuery.toString(), {
    headers: {
      'accept': 'application/json',
    }
  })
  if (req.status === 404) return undefined

  const res = await req.json()
  console.log(res)

  if (res.response?.['success'] === 1) return res.response?.steamid

  return undefined
}

export const GET: APIRoute = async ({ params }) => {
  const vanityUrl = params.vanity!;
  const steamId = await resolveVanity(vanityUrl)

  return new Response(
    steamId,
    {
      status: 200,
    }
  );
}

export const prerender = false