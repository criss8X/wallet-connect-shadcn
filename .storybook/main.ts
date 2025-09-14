import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
	framework: "@storybook/react-vite",
	stories: ["../src/**/*.stories.@(js|jsx|ts|tsx)"],
	addons: ["@storybook/addon-themes"],
	core: {
		disableTelemetry: true,
		disableWhatsNewNotifications: true,
	},
};

export default config;
