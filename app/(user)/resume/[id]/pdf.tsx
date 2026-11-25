"use client";

import {
	Document,
	Link,
	Page,
	StyleSheet,
	Text,
	View,
} from "@react-pdf/renderer";
import dynamic from "next/dynamic";
import { Fragment, type ReactNode } from "react";
import { z } from "zod";
import resumeSchema from "@/schemas";

export type Resume = z.infer<typeof resumeSchema>;

const PDFViewer = dynamic(
	() => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
	{
		ssr: false,
		loading: () => (
			<div className="flex h-screen items-center justify-center text-sm">
				Preparing PDF...
			</div>
		),
	},
);

const styles = StyleSheet.create({
	page: {
		paddingTop: 25,
		paddingBottom: 25,
		paddingHorizontal: 32,
		fontFamily: "Helvetica",
		fontSize: 7.5,
		lineHeight: 1.25,
		color: "#334155",
		backgroundColor: "#ffffff",
	},

	accent: {
		width: 30,
		height: 3,
		backgroundColor: "#0f766e",
		marginBottom: 9,
	},

	header: {
		marginBottom: 10,
	},

	name: {
		fontSize: 12,
		fontWeight: "bold",
		color: "#172b3a",
	},

	contact: {
		flexDirection: "row",
		flexWrap: "wrap",
		alignItems: "center",
		marginTop: 4,
	},

	contactText: {
		fontSize: 7.2,
		color: "#64748b",
	},

	separator: {
		fontSize: 7,
		color: "#94a3b8",
		marginHorizontal: 4,
	},

	link: {
		fontSize: 7.2,
		color: "#0f766e",
		textDecoration: "none",
	},

	profile: {
		marginBottom: 9,
	},

	role: {
		fontSize: 10,
		fontWeight: "bold",
		color: "#0f766e",
		marginBottom: 3,
	},

	summary: {
		fontSize: 7.5,
		color: "#475569",
		lineHeight: 1.3,
	},

	section: {
		marginBottom: 7,
	},

	sectionHeader: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 5,
	},

	sectionTitle: {
		fontSize: 8,
		fontWeight: "bold",
		color: "#0f766e",
		letterSpacing: 0.9,
		textTransform: "uppercase",
	},

	rule: {
		flexGrow: 1,
		height: 0.6,
		backgroundColor: "#cbd5e1",
		marginLeft: 7,
	},

	entry: {
		marginBottom: 5,
	},

	entryHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
	},

	entryTitle: {
		flexGrow: 1,
		fontSize: 7.8,
		fontWeight: "bold",
		color: "#1e293b",
	},

	duration: {
		fontSize: 7,
		color: "#64748b",
		marginLeft: 8,
		textAlign: "right",
	},

	secondary: {
		fontSize: 7.2,
		color: "#475569",
		marginTop: 1,
	},

	description: {
		fontSize: 7.2,
		color: "#475569",
		marginTop: 2,
	},

	tech: {
		fontSize: 6.8,
		color: "#64748b",
		marginTop: 2,
	},

	bulletRow: {
		flexDirection: "row",
		paddingLeft: 4,
		marginTop: 1.5,
	},

	bullet: {
		width: 8,
		fontSize: 7,
		color: "#0f766e",
	},

	bulletText: {
		flex: 1,
		fontSize: 7.2,
		color: "#475569",
		lineHeight: 1.25,
	},

	skillRow: {
		flexDirection: "row",
		marginBottom: 3,
	},

	skillLabel: {
		width: 85,
		fontSize: 7.2,
		fontWeight: "bold",
		color: "#334155",
	},

	skillValues: {
		flex: 1,
		fontSize: 7.2,
		color: "#475569",
	},
});

function Section({ title, children }: { title: string; children: ReactNode }) {
	return (
		<View style={styles.section}>
			<View style={styles.sectionHeader}>
				<Text style={styles.sectionTitle}>{title}</Text>
				<View style={styles.rule} />
			</View>
			{children}
		</View>
	);
}

function Bullets({ items }: { items?: { highlight: string }[] }) {
	if (!items?.length) return null;

	return (
		<View>
			{items.map((item, index) => (
				<View key={index} style={styles.bulletRow}>
					<Text style={styles.bullet}>•</Text>
					<Text style={styles.bulletText}>{item.highlight}</Text>
				</View>
			))}
		</View>
	);
}

function ResumeDocument({ resume }: { resume: Resume }) {
	return (
		<Document
			title={`${resume.user.name} - ${resume.role}`}
			author={resume.user.name}
		>
			<Page size="A4" orientation="portrait" style={styles.page}>
				{/* Header */}
				<View style={styles.accent} />

				<View style={styles.header}>
					<Text style={styles.name}>{resume.user.name}</Text>

					<View style={styles.contact}>
						<Text style={styles.contactText}>{resume.user.email}</Text>
						<Text style={styles.separator}>·</Text>
						<Text style={styles.contactText}>{resume.user.phone}</Text>

						{resume.user.location && (
							<>
								<Text style={styles.separator}>·</Text>
								<Text style={styles.contactText}>{resume.user.location}</Text>
							</>
						)}
					</View>

					<View style={styles.contact}>
						{resume.user.urls.map((item, index) => (
							<Fragment key={`${item.name}-${item.url}`}>
								{index > 0 && <Text style={styles.separator}>·</Text>}
								<Link src={item.url} style={styles.link}>
									{item.url.replace(/^https?:\/\//, "")}
								</Link>
							</Fragment>
						))}
					</View>
				</View>

				{/* Summary */}
				<View style={styles.profile}>
					<Text style={styles.role}>{resume.role}</Text>
					<Text style={styles.summary}>{resume.summary}</Text>
				</View>

				{/* Skills */}
				{!!Object.keys(resume.skills).length && (
					<Section title="Skills">
						{Object.entries(resume.skills).map(([category, values]) => (
							<View key={category} style={styles.skillRow}>
								<Text style={styles.skillLabel}>{category}</Text>
								<Text style={styles.skillValues}>{values.join(", ")}</Text>
							</View>
						))}
					</Section>
				)}

				{/* Experience */}
				{!!resume.experience.length && (
					<Section title="Experience">
						{resume.experience.map((item, index) => (
							<View key={index} style={styles.entry}>
								<View style={styles.entryHeader}>
									<Text style={styles.entryTitle}>{item.company}</Text>
									<Text style={styles.duration}>{item.duration}</Text>
								</View>

								<Text style={styles.secondary}>{item.role}</Text>
								<Bullets items={item.highlights} />
							</View>
						))}
					</Section>
				)}

				{/* Projects */}
				{!!resume.projects.length && (
					<Section title="Projects">
						{resume.projects.map((item, index) => (
							<View key={index} style={styles.entry}>
								<View style={styles.entryHeader}>
									<Text style={styles.entryTitle}>{item.name}</Text>

									<View style={{ flexDirection: "row" }}>
										{Object.entries(item.urls).map(([name, url], i) => (
											<Fragment key={`${name}-${url}`}>
												{i > 0 && <Text style={styles.separator}>·</Text>}
												<Link src={url} style={styles.link}>
													{name}
												</Link>
											</Fragment>
										))}
									</View>
								</View>

								<Text style={styles.description}>{item.description}</Text>

								{!!item.tech.length && (
									<Text style={styles.tech}>Tech: {item.tech.join(" · ")}</Text>
								)}

								<Bullets items={item.highlights} />
							</View>
						))}
					</Section>
				)}

				{/* Education */}
				{!!resume.education.length && (
					<Section title="Education">
						{resume.education.map((item, index) => (
							<View key={index} style={styles.entry}>
								<View style={styles.entryHeader}>
									<Text style={styles.entryTitle}>{item.qualification}</Text>
									<Text style={styles.duration}>{item.duration}</Text>
								</View>

								<Text style={styles.secondary}>
									{item.institution} · {item.grade}
								</Text>

								<Bullets items={item.highlights} />
							</View>
						))}
					</Section>
				)}
			</Page>
		</Document>
	);
}

export default function ResumePdf({ resume }: { resume: Resume }) {
	return (
		<div className="w-full h-screen">
			<PDFViewer width="100%" height="100%" showToolbar>
				<ResumeDocument resume={resume} />
			</PDFViewer>
		</div>
	);
}
