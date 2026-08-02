// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith("/login");

    // Jei bando eiti į login, bet jau prisijungęs - nukreipiame į dashboard
    if (isAuthPage && isAuth) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Naudojame NextResponse.next() vietoj null, kad Next.js teisingai apdorotų srautą
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const isAuthPage = req.nextUrl.pathname.startsWith("/login");
        if (isAuthPage) return true; // Į login puslapį leidžiame visus
        
        // Visi kiti puslapiai reikalauja tokeno
        return !!token; 
      },
    },
  }
);

// Nurodome, kuriuos adresus saugoti
export const config = {
  matcher: ["/dashboard/:path*", "/kasa/:path*", "/login"],
};