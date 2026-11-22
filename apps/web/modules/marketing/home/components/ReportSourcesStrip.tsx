"use client";

import {
	BracesIcon,
	InfinityIcon,
	PauseIcon,
	PlayIcon,
	ShoppingBagIcon,
	Table2Icon,
} from "lucide-react";
import { useState } from "react";
import styles from "./ReportSourcesStrip.module.css";

const sources = [
	{ name: "Shopify", mark: ShoppingBagIcon, style: styles.shopify },
	{ name: "Meta Ads", mark: InfinityIcon, style: styles.meta },
	{ name: "Google Ads", mark: null, style: styles.google },
	{ name: "CSV", mark: Table2Icon, style: styles.csv },
	{ name: "JSON", mark: BracesIcon, style: styles.json },
] as const;

export function ReportSourcesStrip() {
	const [paused, setPaused] = useState(false);
	const ControlIcon = paused ? PlayIcon : PauseIcon;
	const motionLabel = paused ? "Resume page motion" : "Pause page motion";

	return (
		<section
			aria-label="Report sources and file formats"
			className={styles.strip}
			data-landing-motion={paused ? "paused" : "running"}
			data-test="report-sources"
		>
			<div className={styles.inner}>
				<p className={styles.label}>Report inputs</p>
				<div className={styles.window}>
					<div
						className={styles.track}
						data-test="report-sources-track"
					>
						{["original", "repeat"].map((copy) => (
							<ul
								key={copy}
								aria-hidden={copy === "repeat" || undefined}
								className={styles.group}
							>
								{sources.map(({ name, mark: Mark, style }) => (
									<li key={name} className={style}>
										{Mark && <Mark aria-hidden="true" />}
										{name}
									</li>
								))}
							</ul>
						))}
					</div>
				</div>
				<button
					type="button"
					className={styles.control}
					aria-label={motionLabel}
					title={motionLabel}
					onClick={() => setPaused(!paused)}
				>
					<ControlIcon aria-hidden="true" size={15} strokeWidth={2} />
					<span>{paused ? "Resume motion" : "Pause motion"}</span>
				</button>
			</div>
		</section>
	);
}
