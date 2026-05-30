/**
 * Internal dependencies
 */
import {
	applyParagraphLinkValue,
	getParagraphLinkValue,
} from '../inline-controls';

describe( 'Paragraph inline controls link helpers', () => {
	it( 'returns existing single link url', () => {
		expect(
			getParagraphLinkValue(
				'<a href="https://example.com">Example text</a>'
			)
		).toBe( 'https://example.com' );
	} );

	it( 'returns empty string when multiple links are present', () => {
		expect(
			getParagraphLinkValue(
				'<a href="https://example.com">One</a> and <a href="https://example.org">Two</a>'
			)
		).toBe( '' );
	} );

	it( 'applies a new link to plain text content', () => {
		expect(
			applyParagraphLinkValue( 'Example text', 'https://example.com' )
		).toBe( '<a href="https://example.com">Example text</a>' );
	} );

	it( 'updates an existing single link url', () => {
		expect(
			applyParagraphLinkValue(
				'<a href="https://example.com">Example text</a>',
				'https://wordpress.org'
			)
		).toBe( '<a href="https://wordpress.org">Example text</a>' );
	} );

	it( 'does not modify content when multiple links are present', () => {
		const content =
			'<a href="https://example.com">One</a> and <a href="https://example.org">Two</a>';

		expect(
			applyParagraphLinkValue( content, 'https://wordpress.org' )
		).toBe( content );
	} );
} );
