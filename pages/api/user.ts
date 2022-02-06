import { Role } from "@prisma/client";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { sessionOptions } from "../../lib/session";
import { getUserById } from "../../lib/user";
import os from "os";

export type UserSession = {
  isLoggedIn: boolean;
  admin: boolean;
  id: string;
  username: string;
};

export default withIronSessionApiRoute(userRoute, sessionOptions);

async function userRoute(
  req: NextApiRequest,
  res: NextApiResponse<UserSession>
) {
  res.setHeader("Host-Name", os.hostname());
  if (req.session.user) {
    const user = await getUserById(req.session.user.id);
    if (user !== null) {
      res.json({
        ...req.session.user,
        admin: user?.role === Role.ADMIN,
      });
      return;
    }
  }
  res.json({
    isLoggedIn: false,
    admin: false,
    id: "",
    username: "",
  });
}
