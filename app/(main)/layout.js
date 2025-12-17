import React from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const MainLayout = ({ children }) => {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return <div className="container mx-auto my-32">{children}</div>;
};

export default MainLayout;
