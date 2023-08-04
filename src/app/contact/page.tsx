import { Metadata } from "next";
import { NextResponse } from "next/server";

export default function ContactsPage() {
    return NextResponse.redirect("/user");
}