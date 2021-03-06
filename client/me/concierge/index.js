/** @format */

/**
 * External dependencies
 */

import page from 'page';

/**
 * Internal dependencies
 */
import config from 'config';
import controller from './controller';
import { makeLayout, render as clientRender } from 'controller';
import { siteSelection, sites } from 'my-sites/controller';

const redirectToBooking = context => {
	page.redirect( `/me/concierge/${ context.params.siteSlug }/book` );
};

export default () => {
	if ( config.isEnabled( 'concierge-chats' ) ) {
		page(
			'/me/concierge',
			controller.siteSelector,
			siteSelection,
			sites,
			makeLayout,
			clientRender
		);

		// redirect to booking page after site selection
		page( '/me/concierge/:siteSlug', redirectToBooking );

		page( '/me/concierge/:siteSlug/book', controller.book, makeLayout, clientRender );

		page(
			'/me/concierge/:siteSlug/:appointmentId/cancel',
			controller.cancel,
			makeLayout,
			clientRender
		);

		page(
			'/me/concierge/:siteSlug/:appointmentId/reschedule',
			controller.reschedule,
			makeLayout,
			clientRender
		);
	}
};
