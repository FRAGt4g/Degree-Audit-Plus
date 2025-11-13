import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Progress } from "../../../lib/general-types";

export type Bar = {
	title: string;
	color: `rgb(${number}, ${number}, ${number})`;
	percentage: Progress;
};

interface GraphProps {
	innerContent?: React.ReactNode;
	children?: React.ReactNode;
	bars: Bar[];
	tooltipContent?: (bar: Bar) => React.ReactNode;
	size?: number;
	strokeWidth?: number;
	gap?: number;
	startRadius?: number;
	animationDuration?: number;
}

const InnerDonutGraph = ({
	bar,
	radius,
	color,
	animatedProgress,
	strokeWidth,
	...other
}: {
	bar: Bar;
	index: number;
	radius: number;
	color: `rgb(${number}, ${number}, ${number})`;
	animatedProgress: number;
	strokeWidth: number;
	onMouseEnter: () => void;
	onMouseLeave: () => void;
}) => {
	// Calculate stroke-dasharray for circular progress
	const svgRef = useRef<SVGSVGElement>(null);
	const circumference = 2 * Math.PI * radius;
	const progressLength =
		(animatedProgress / bar.percentage.total) * circumference;
	const dashArray = `${progressLength} ${circumference}`;
	const colorValues = color
		.substring(4, color.length - 1)
		.split(",")
		.map((s) => Number(s.trim()));
	const darkeningFactor = 0.7;
	const bgOpacity = 0.1;
	const backgroundColor = `rgba(${colorValues[0] * darkeningFactor}, ${
		colorValues[1] * darkeningFactor
	}, ${colorValues[2] * darkeningFactor}, ${bgOpacity})`;

	return (
		<svg
			ref={svgRef}
			style={{
				position: "absolute",
				top: "50%",
				left: "50%",
				transform: "translate(-50%, -50%)",
				width: "100%",
				height: "100%",
				pointerEvents: "none", // Essential to allow mouse events to pass through to the background circle
			}}
			viewBox="0 0 200 200"
			preserveAspectRatio="xMidYMid meet"
		>
			{/* Background circle (track) */}
			<circle
				cx="100"
				cy="100"
				r={radius}
				fill="none"
				stroke={backgroundColor}
				strokeWidth={strokeWidth}
				style={{
					pointerEvents: "stroke",
					cursor: "pointer",
				}}
				onMouseEnter={other.onMouseEnter}
				onMouseLeave={other.onMouseLeave}
			/>

			{/* Progress circle */}
			<circle
				cx="100"
				cy="100"
				r={radius}
				fill="none"
				stroke={color}
				strokeWidth={strokeWidth}
				strokeLinecap="round"
				strokeDasharray={dashArray}
				transform="rotate(-90 100 100)"
				style={{
					pointerEvents: "none", // Essential to allow mouse events to pass through to the background circle
				}}
			/>
		</svg>
	);
};

const MultiDonutGraph = ({
	bars,
	innerContent,
	children,
	tooltipContent,
	size = 362, // Defaulted to 362 because this was the figma design size
	strokeWidth = 10,
	gap = 1,
	startRadius = 95,
	animationDuration = 750,
}: GraphProps) => {
	// State to track the bar that is currently being hovered over. Used in the tooltip functionality.
	const [hoveredBar, setHoveredBar] = useState<Bar | null>(bars[0] || null);
	const tooltipRef = useRef<HTMLDivElement>(null);

	// State to track animated progress for each bar
	const [animatedProgress, setAnimatedProgress] = useState<number[]>(
		bars.map(() => 0)
	);

	useEffect(() => {
		// Animate each bar from 0 to its target value
		const startTime = Date.now();

		function animate() {
			const elapsed = Date.now() - startTime;
			const progress = Math.min(elapsed / animationDuration, 1);

			// Easing function for smooth animation (ease-out)
			const easedProgress = 1 - Math.pow(1 - progress, 3);

			setAnimatedProgress(
				bars.map((bar) => bar.percentage.current * easedProgress)
			);

			// If the animation is not complete, request the next frame
			if (progress < 1) {
				requestAnimationFrame(animate);
			}
		}

		requestAnimationFrame(animate);
	}, [bars]);

	return (
		<div
			style={{
				height: size,
				aspectRatio: "1",
				position: "relative",
			}}
		>
			{/* To allow for animation of the tooltip box when it disappears */}
			<AnimatePresence>
				{hoveredBar && (
					<>
						<motion.div
							initial={{ opacity: 0, right: 10 }}
							animate={{ opacity: 1, right: 0 }}
							exit={{ opacity: 0, right: -10 }}
							transition={{ duration: 0.2 }}
							ref={tooltipRef}
							style={{
								position: "absolute",
								top: 0,
								right: 0,
								zIndex: 1000,
								transform: "translate(100%, 0%)",
							}}
						>
							{tooltipContent?.(hoveredBar)}
						</motion.div>

						<motion.div
							initial={{ opacity: 0, right: 10 }}
							animate={{ opacity: 1, right: 0 }}
							exit={{ opacity: 0, right: -10 }}
							transition={{ duration: 0.2 }}
							className="absolute top-0 right-0 w-full h-full pointer-events-none"
							style={{
								zIndex: 800,
							}}
						>
							{/* Dashed line from tooltip box to highlighted circle */}
							<svg
								className="pointer-events-none absolute top-0 right-0"
								width="100%"
								height="100%"
								style={{
									overflow: "visible",
									pointerEvents: "none",
									zIndex: 800,
								}}
							>
								{(() => {
									// Find the hovered bar index and its geometry
									const index = bars.findIndex((bar) => bar === hoveredBar);

									const displacement =
										size / 2 - (strokeWidth + gap) * 2 * index;
									const tooltipBoxHeight =
										tooltipRef.current?.clientHeight || 100;

									// The center of the circle
									const cx = size / 2;
									const cy = size / 2;

									return (
										<line
											x1={cx + size / 2} // The left edge of the tooltip box
											y1={cy - size / 2 + tooltipBoxHeight / 2} // The middle of the tooltip box
											x2={cx + displacement / Math.sqrt(2)} // About the outside edge of the circle intersecting y=x (straight diagonal line to the right)
											y2={cy - displacement / Math.sqrt(2)} // About the outside edge of the circle intersecting y=x (straight diagonal line to the right)
											stroke={hoveredBar?.color || "#000"}
											strokeWidth={4}
											strokeLinecap="round"
											strokeDasharray="5,5"
											style={{
												zIndex: 50,
												pointerEvents: "none",
											}}
										/>
									);
								})()}
							</svg>
						</motion.div>
					</>
				)}
			</AnimatePresence>

			{/* The actual concentric radial graphs */}
			{bars.map((bar, index) => {
				return (
					<InnerDonutGraph
						key={bar.title}
						bar={bar}
						index={index}
						radius={startRadius - index * (strokeWidth + gap)}
						color={bar.color}
						animatedProgress={animatedProgress[index]}
						onMouseEnter={() => setHoveredBar(bar)}
						onMouseLeave={() => setHoveredBar(null)}
						strokeWidth={strokeWidth}
					/>
				);
			})}

			{/* The arbitrary inner content to be shown inside the donut graph */}
			{(innerContent || children) && (
				<div
					style={{
						position: "absolute",
						top: "50%",
						left: "50%",
						transform: "translate(-50%, -50%)",
					}}
				>
					{innerContent || children}
				</div>
			)}
		</div>
	);
};

export default MultiDonutGraph;
