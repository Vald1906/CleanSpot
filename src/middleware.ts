import { withAuth } from "next-auth/middleware";

export default withAuth({});

export const config = {
    matcher: [
        "/event/:path*",
        "/map/:path*",
        "/profil/:path*",
        "/association/:path*",
        "/association/setup",
        "/dashboard/:path*",
    ],
};
