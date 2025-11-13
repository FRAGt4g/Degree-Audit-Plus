import React from "react";
import ReactDOM from "react-dom/client";
import { HStack } from "../components/common/helperdivs";
import { PreferencesProvider } from "../providers/main-page";
import "../styles/content.css";
import { TestSidebar } from "./components/sidebar";
import PageContent from "./page-content";

const App = () => {
	return (
		<PreferencesProvider>
			<DegreeAuditPage />
		</PreferencesProvider>
	);
};

const DegreeAuditPage = () => {
	return (
		<HStack fill className="w-screen" gap={0}>
			<TestSidebar />
			<PageContent />
		</HStack>
	);
};

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
);
