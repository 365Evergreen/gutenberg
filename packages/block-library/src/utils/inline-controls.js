/**
 * WordPress dependencies
 */
import { DropdownMenu, ToolbarGroup } from '@wordpress/components';
import { BlockControls } from '@wordpress/block-editor';

export default function InlineControls( {
	label,
	group = 'other',
	className,
	children,
} ) {
	return (
		<BlockControls group={ group }>
			<ToolbarGroup>
				<DropdownMenu
					icon=""
					label={ label }
					text={ label }
					popoverProps={ {
						className,
					} }
				>
					{ () => children }
				</DropdownMenu>
			</ToolbarGroup>
		</BlockControls>
	);
}
