/**
 * WordPress dependencies
 */
import { __, _x } from '@wordpress/i18n';
import {
	Notice,
	SelectControl,
	ToolbarButton,
} from '@wordpress/components';
import {
	__experimentalFontAppearanceControl as FontAppearanceControl,
	URLInputButton,
	useSettings,
	BlockControls,
} from '@wordpress/block-editor';
import { useMemo } from '@wordpress/element';
import { create, applyFormat, removeFormat, toHTMLString } from '@wordpress/rich-text';
import { formatLTR } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import InlineControls from '../utils/inline-controls';

const LINK_FORMAT = 'core/link';

function getLinkRanges( value ) {
	const ranges = [];
	let rangeStart = null;

	for ( let index = 0; index < value.text.length; index++ ) {
		const hasLink = value.formats?.[ index ]?.some(
			( format ) => format.type === LINK_FORMAT
		);

		if ( hasLink && rangeStart === null ) {
			rangeStart = index;
		} else if ( ! hasLink && rangeStart !== null ) {
			ranges.push( [ rangeStart, index ] );
			rangeStart = null;
		}
	}

	if ( rangeStart !== null ) {
		ranges.push( [ rangeStart, value.text.length ] );
	}

	return ranges;
}

export function getParagraphLinkValue( content ) {
	const richTextValue = create( { html: content || '' } );
	const ranges = getLinkRanges( richTextValue );

	if ( ranges.length !== 1 ) {
		return '';
	}

	const [ start ] = ranges[ 0 ];
	const linkFormat = richTextValue.formats?.[ start ]?.find(
		( format ) => format.type === LINK_FORMAT
	);

	return linkFormat?.attributes?.url || '';
}

export function applyParagraphLinkValue( content, url ) {
	const richTextValue = create( { html: content || '' } );
	const ranges = getLinkRanges( richTextValue );

	if ( ! richTextValue.text.length || ranges.length > 1 ) {
		return content;
	}

	let nextValue = richTextValue;

	if ( ranges.length === 1 ) {
		const [ start, end ] = ranges[ 0 ];
		nextValue = removeFormat( nextValue, LINK_FORMAT, start, end );

		if ( url ) {
			nextValue = applyFormat(
				nextValue,
				{ type: LINK_FORMAT, attributes: { url } },
				start,
				end
			);
		}
	} else if ( url ) {
		nextValue = applyFormat(
			nextValue,
			{ type: LINK_FORMAT, attributes: { url } },
			0,
			nextValue.text.length
		);
	}

	return toHTMLString( { value: nextValue } );
}

export function ParagraphRTLControl( { direction, setDirection, isRTL } ) {
	if ( ! isRTL ) {
		return null;
	}

	return (
		<ToolbarButton
			icon={ formatLTR }
			title={ _x( 'Left to right', 'editor button' ) }
			isActive={ direction === 'ltr' }
			onClick={ () => {
				setDirection( direction === 'ltr' ? undefined : 'ltr' );
			} }
		/>
	);
}

function getFontSizeSlug( value ) {
	if (
		typeof value === 'string' &&
		value.startsWith( 'var:preset|font-size|' )
	) {
		return value.replace( 'var:preset|font-size|', '' );
	}

	return undefined;
}

function setTypographyStyle( attributes, setAttributes, value ) {
	setAttributes( {
		style: {
			...attributes.style,
			typography: {
				...attributes.style?.typography,
				...value,
			},
		},
	} );
}

export function ParagraphInlineControls( {
	attributes,
	setAttributes,
	isRTL,
} ) {
	const [ fontSizes, hasFontWeightControl ] = useSettings(
		'typography.fontSizes',
		'typography.fontWeight'
	);
	const typography = attributes.style?.typography || {};
	const currentFontSizeSlug = getFontSizeSlug( typography.fontSize );
	const hasMultipleLinks =
		getLinkRanges( create( { html: attributes.content || '' } ) ).length > 1;
	const fontSizeOptions = useMemo(
		() => [
			{ label: __( 'Default' ), value: '' },
			...( fontSizes || [] ).map( ( fontSize ) => ( {
				label: fontSize.name,
				value: fontSize.slug,
			} ) ),
			{ label: __( 'Custom' ), value: '__custom__' },
		],
		[ fontSizes ]
	);
	const fontSizeControlValue = currentFontSizeSlug || '__custom__';
	return (
		<>
			<BlockControls group="block">
				<ParagraphRTLControl
					direction={ attributes.direction }
					setDirection={ ( newDirection ) =>
						setAttributes( { direction: newDirection } )
					}
					isRTL={ isRTL }
				/>
			</BlockControls>
			<InlineControls
				label={ __( 'Typography' ) }
				className="is-alternate"
				group="other"
			>
				<SelectControl
					label={ __( 'Size' ) }
					value={ fontSizeControlValue }
					options={ fontSizeOptions }
					onChange={ ( value ) => {
						if ( value === '' ) {
							setTypographyStyle( attributes, setAttributes, {
								fontSize: undefined,
							} );
							return;
						}

						if ( value !== '__custom__' ) {
							setTypographyStyle( attributes, setAttributes, {
								fontSize: `var:preset|font-size|${ value }`,
							} );
						}
					} }
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				/>
				{ fontSizeControlValue === '__custom__' && (
					<SelectControl
						label={ __( 'Custom size' ) }
						value={ typography.fontSize || '' }
						options={ [
							{ label: __( 'Unset' ), value: '' },
							{ label: '12px', value: '12px' },
							{ label: '14px', value: '14px' },
							{ label: '16px', value: '16px' },
							{ label: '18px', value: '18px' },
							{ label: '20px', value: '20px' },
							{ label: '24px', value: '24px' },
							{ label: '32px', value: '32px' },
						] }
						onChange={ ( value ) =>
							setTypographyStyle( attributes, setAttributes, {
								fontSize: value || undefined,
							} )
						}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
				) }
				{ hasFontWeightControl && (
					<FontAppearanceControl
						label={ __( 'Weight' ) }
						hasFontStyles={ false }
						hasFontWeights
						value={ {
							fontWeight: typography.fontWeight,
						} }
						onChange={ ( { fontWeight } ) =>
							setTypographyStyle( attributes, setAttributes, {
								fontWeight,
							} )
						}
						__next40pxDefaultSize
					/>
				) }
			</InlineControls>
			<InlineControls
				label={ __( 'Link' ) }
				className="block-editor-url-popover__link-editor"
				group="inline"
			>
				{ ! hasMultipleLinks ? (
					<URLInputButton
						url={ getParagraphLinkValue( attributes.content ) }
						onChange={ ( url ) =>
							setAttributes( {
								content: applyParagraphLinkValue(
									attributes.content,
									url
								),
							} )
						}
					/>
				) : (
					<Notice status="info" isDismissible={ false }>
						{ __(
							'Inline link control is available when the paragraph has a single link.'
						) }
					</Notice>
				) }
			</InlineControls>
		</>
	);
}
