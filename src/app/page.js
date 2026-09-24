"use client";

import { useEffect } from "react";

const Page = () => {
useEffect(() => {
window.location.href = "/login";
}, []);

return ( <div className="min-h-screen bg-slate-100 flex items-center justify-center"> <p className="text-slate-600">Redirecting to login...</p> </div>
);
};

export default Page;
