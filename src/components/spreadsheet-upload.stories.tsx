import type { Meta, StoryObj } from "@storybook/react-vite";

import { SpreadsheetUpload } from "./spreadsheet-upload";

const meta = {
	component: SpreadsheetUpload,
} satisfies Meta<typeof SpreadsheetUpload>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {},
};
