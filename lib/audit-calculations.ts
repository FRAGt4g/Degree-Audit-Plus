import type { PlanableProgress, RequirementSection } from "./general-types";

export type CurrentAuditProgress = {
	total: PlanableProgress;
	sections: {
		title: string;
		progress: PlanableProgress;
	}[];
};

export function calculateWeightedDegreeCompletion(
	sections: RequirementSection[],
): CurrentAuditProgress {
	const results: CurrentAuditProgress = {
		total: { current: 0, planned: 0, total: 0 },
		sections: [],
	};
	console.log("sections", sections);
	sections.forEach((section) => {
		const sectionProgress = {
			title: section.title,
			progress: { current: 0, planned: 0, total: 0 },
		};

		section.rules.forEach((rule) => {
			sectionProgress.progress.current += rule.appliedHours;
			sectionProgress.progress.total += rule.requiredHours;
		});

		results.sections.push(sectionProgress);
	});
	results.total.current = results.sections.reduce(
		(acc, section) => acc + section.progress.current,
		0,
	);
	results.total.total = results.sections.reduce(
		(acc, section) => acc + section.progress.total,
		0,
	);
	results.total.planned = results.sections.reduce(
		(acc, section) => acc + section.progress.planned,
		0,
	);
	console.log("results", results);
	return results;
}

export function calculateWeightedDegreePlanableCompletion(
	sections: RequirementSection[],
): CurrentAuditProgress {
	const results: CurrentAuditProgress = {
		total: { current: 0, planned: 0, total: 0 },
		sections: [],
	};
	console.log("sections", sections);
	sections.forEach((section) => {
		const sectionProgress = {
			title: section.title,
			progress: { current: 0, planned: 0, total: 0 },
		};
		sectionProgress.progress.total = section.rules.reduce(
			(acc, rule) => acc + rule.requiredHours,
			0,
		);

		section.rules.forEach((rule) => {
			rule.courses.forEach((course) => {
				if (course.status !== "Planned") {
					sectionProgress.progress.current += course.hours;
				} else {
					sectionProgress.progress.planned += course.hours;
				}
			});
		});

		results.sections.push(sectionProgress);
	});
	results.total.current = results.sections.reduce(
		(acc, section) => acc + section.progress.current,
		0,
	);
	results.total.total = results.sections.reduce(
		(acc, section) => acc + section.progress.total,
		0,
	);
	results.total.planned = results.sections.reduce(
		(acc, section) => acc + section.progress.planned,
		0,
	);
	console.log("results", results);
	return results;
}
