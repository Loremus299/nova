"use client";
import dynamic from "next/dynamic";
import type { Resume } from "./pdf";

const ResumePdf = dynamic(() => import("./pdf"), { ssr: false });

export default function ResumePdfClient({ resume }: { resume: Resume }) {
	return <ResumePdf resume={resume} />;
}
