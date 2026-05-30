/**
 * WordPress dependencies
 */
import { __, _x } from '@wordpress/i18n';
import { Notice, SelectControl, ToolbarButton } from '@wordpress/components';
import {
	__experimentalFontAppearanceControl as FontAppearanceControl,
	URLInputButton,
	useSettings,
	BlockControls,
} from '@wordpress/block-editor';
import { useMemo } from '@wordpress/element';
import { formatLTR } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import InlineControls from '../utils/inline-controls';

function getLinkElements( content ) {
	const container = document.createElement( 'div' );
	container.innerHTML = content || '';
	return [ container, [ ...container.querySelectorAll( 'a[href]' ) ] ];
}

export function getParagraphLinkValue( content ) {
	const [ , links ] = getLinkElements( content );

	if ( links.length !== 1 ) {
		return '';
	}

	return links[ 0 ].getAttribute( 'href' ) || '';
}

export function applyParagraphLinkValue( content, url ) {
	const [ container, links ] = getLinkElements( content );

	if ( links.length > 1 ) {
		return container.innerHTML;
	}

	if ( links.length === 1 ) {
		const [ linkElement ] = links;
		if ( url ) {
			linkElement.setAttribute( 'href', url );
		} else {
			linkElement.replaceWith(
				...Array.from( linkElement.childNodes ).map( ( node ) =>
					node.cloneNode( true )
				)
			);
		}
		return container.innerHTML;
	}

	if ( ! url || ! container.textContent ) {
		return content;
	}

	const linkElement = document.createElement( 'a' );
	linkElement.setAttribute( 'href', url );
	while ( container.firstChild ) {
		linkElement.append( container.firstChild );
	}
	container.append( linkElement );
	return container.innerHTML;
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
	const [ , links ] = getLinkElements( attributes.content );
	const hasMultipleLinks = links.length > 1;
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
