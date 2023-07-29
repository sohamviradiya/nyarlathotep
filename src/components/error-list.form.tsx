"use client";
import { useState } from "react";

export default function ErrorList({ errors }: { errors: string[]}) {
    return (
        <>
            <ul style={{ color: "red" }}>
                {errors.map((error, index) => <li key={index}>{error}</li>)}
            </ul>
        </>
    );
};
