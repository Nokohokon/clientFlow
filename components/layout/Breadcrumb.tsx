'use client'
import { usePathname } from "next/navigation"
import Link from "next/link"

export default function Breadcrumb() {
    return (
        <p className=" text-left text-base text-gray-600 ">
            <Link href={"/"} className="hover:text-gray-800">Home</Link> &gt; <Link href={"/dashboard"} className="hover:text-gray-800">Dashboard</Link>
        </p>
    )
}