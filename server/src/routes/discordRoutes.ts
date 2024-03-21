import {Router, Request, Response} from "express";

const router = Router();

router.post('/token', async (req: Request, res: Response) => {
  console.log('Discord TOKEN Request', req.body);
  const response = await fetch(`https://discord.com/api/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code: req.body.code,
    }),
  });

  console.log(process.env.DISCORD_CLIENT_ID)

  const {access_token} = (await response.json()) as {
    access_token: string;
  };

  res.send({access_token});
});

export default router;
