import { withIronSessionApiRoute } from "iron-session/next";
import type { NextApiRequest, NextApiResponse } from "next";
import { sessionOptions } from "../../lib/session";

export default withIronSessionApiRoute(handler, sessionOptions);
async function handler(req: NextApiRequest, res: NextApiResponse) {
  let { cookie, ...info } = req.headers;
  res.status(200).json(info);
}
