import Button from "@/entrypoints/components/common/button";
import { HStack, VStack } from "@/entrypoints/components/common/helperdivs";
import { usePreferences } from "@/entrypoints/providers/main-page";
import { ListIcon } from "@phosphor-icons/react";
import { useRef } from "react";

const widthAnimationTime = 0.3;
const opacityAnimationTime = 0.1;

export const TestSidebar = () => {
	const {
		sidebarSize,
		ephemeralSetSidebarSize,
		setAndSaveSidebarSize,
		sidebarIsOpen,
		toggleSidebar,
		isDraggingSidebar,
		setIsDraggingSidebar,
	} = usePreferences();
	const nextAnimationFrameRequestRef = useRef<number | null>(null);

	function mouseMove(e: MouseEvent) {
		e.preventDefault(); // Prevent text selection
		// Cancel any pending animation frame
		if (nextAnimationFrameRequestRef.current !== null) {
			cancelAnimationFrame(nextAnimationFrameRequestRef.current);
		}

		// Use requestAnimationFrame for smooth updates
		nextAnimationFrameRequestRef.current = requestAnimationFrame(() => {
			ephemeralSetSidebarSize(e.clientX);
		});
	}

	async function mouseUp(e: MouseEvent) {
		// Cancel any pending animation frame
		if (nextAnimationFrameRequestRef.current !== null) {
			cancelAnimationFrame(nextAnimationFrameRequestRef.current);
			nextAnimationFrameRequestRef.current = null;
		}

		document.body.style.cursor = "default";
		document.body.style.userSelect = ""; // Restore text selection
		document.removeEventListener("mousemove", mouseMove);
		document.removeEventListener("mouseup", mouseUp);
		setIsDraggingSidebar(false);
		await setAndSaveSidebarSize(e.clientX);
	}

	return (
		<HStack
			className="h-full fixed left-0 top-0"
			style={{
				width: sidebarIsOpen ? sidebarSize : 0,
				opacity: sidebarIsOpen ? 1 : 0,
				transition: isDraggingSidebar
					? "none"
					: `width ${widthAnimationTime}s ease-in-out, opacity ${opacityAnimationTime}s ease-in-out`,
			}}
		>
			<VStack className="w-full py-6">
				<Button
					className="p-2 rounded-full"
					fill="none"
					onClick={async () => await toggleSidebar()}
				>
					<ListIcon className="w-6 h-6" />
				</Button>
			</VStack>
			<div
				className="w-[4px] h-full bg-gray-200 hover:cursor-col-resize hover:bg-gray-300"
				onMouseDown={(e) => {
					e.preventDefault(); // Prevent text selection
					setIsDraggingSidebar(true);
					console.log("starting mouse move");
					document.body.style.cursor = "col-resize";
					document.body.style.userSelect = "none"; // Disable text selection

					document.addEventListener("mousemove", mouseMove);
					document.addEventListener("mouseup", mouseUp);
				}}
			/>
		</HStack>
	);
};

const Sidebar = () => {
	const {
		sidebarIsOpen,
		toggleSidebar,
		sidebarSize,
		ephemeralSetSidebarSize,
		setAndSaveSidebarSize,
		saveSidebarSize,
	} = usePreferences();

	function mouseMove(e: MouseEvent) {
		e.preventDefault(); // Prevent text selection
		// const newSize = sidebarSize + (e.clientX - startX.current);
		console.log("new size", e.clientX);
		ephemeralSetSidebarSize(e.clientX);
	}

	async function mouseUp(e: MouseEvent) {
		console.log("stopping mouse up");
		document.body.style.cursor = "default";
		document.body.style.userSelect = ""; // Restore text selection
		document.removeEventListener("mousemove", mouseMove);
		document.removeEventListener("mouseup", mouseUp);
		await setAndSaveSidebarSize(e.clientX);
	}

	return (
		<HStack
			className="h-full fixed left-0 top-0"
			style={{
				width: sidebarIsOpen ? sidebarSize : 0,
				opacity: sidebarIsOpen ? 1 : 0,
				transition: `width ${widthAnimationTime}s ease-in-out, opacity ${opacityAnimationTime}s ease-in-out`,
			}}
			aria-hidden={!sidebarIsOpen}
		>
			<VStack className="w-full py-6">
				<Button
					className="p-2 rounded-full"
					fill="none"
					onClick={async () => await toggleSidebar()}
				>
					<ListIcon className="w-6 h-6" />
				</Button>
			</VStack>
			<div
				className="w-[4px] h-full bg-gray-200 hover:cursor-col-resize hover:bg-gray-300"
				onMouseDown={(e) => {
					e.preventDefault(); // Prevent text selection
					console.log("starting mouse move");
					document.body.style.cursor = "col-resize";
					document.body.style.userSelect = "none"; // Disable text selection

					document.addEventListener("mousemove", mouseMove);
					document.addEventListener("mouseup", mouseUp);
				}}
			/>
		</HStack>
	);
};

export default Sidebar;
