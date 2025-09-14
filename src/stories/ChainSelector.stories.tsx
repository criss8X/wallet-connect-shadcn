import type { Meta, StoryObj } from "@storybook/react-vite";

import { ChainSelector } from "@/components/ChainSelector";

const meta = {
	component: ChainSelector,
} satisfies Meta<typeof ChainSelector>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {},
};
