/** @format */
/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { compact, get } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import Wizard from 'components/wizard';
import {
	JETPACK_ONBOARDING_COMPONENTS as COMPONENTS,
	JETPACK_ONBOARDING_STEPS as STEPS,
} from './constants';
import { getUnconnectedSiteIdBySlug } from 'state/selectors';

class JetpackOnboardingMain extends React.PureComponent {
	static propTypes = {
		stepName: PropTypes.string,
	};

	static defaultProps = {
		stepName: STEPS.SITE_TITLE,
	};

	// TODO: Add lifecycle methods to redirect if no siteId

	render() {
		const { jpUser, siteId, siteSlug, stepName, steps, token } = this.props;

		return (
			<Main className="jetpack-onboarding">
				<Wizard
					basePath="/jetpack/onboarding"
					baseSuffix={ siteSlug }
					components={ COMPONENTS }
					hideNavigation={ stepName === STEPS.SUMMARY }
					jpUser={ jpUser }
					siteId={ siteId }
					steps={ steps }
					stepName={ stepName }
					token={ token }
				/>
			</Main>
		);
	}
}

export default connect( ( state, { siteSlug } ) => {
	const siteId = getUnconnectedSiteIdBySlug( state, siteSlug );
	// Note: here we can select which steps to display, based on user's input
	const steps = compact( [
		STEPS.SITE_TITLE,
		STEPS.SITE_TYPE,
		STEPS.HOMEPAGE,
		STEPS.CONTACT_FORM,
		STEPS.BUSINESS_ADDRESS,
		STEPS.WOOCOMMERCE,
		STEPS.SUMMARY,
	] );

	return {
		jpUser: get( state.jetpackOnboarding.credentials, [ siteId, 'userEmail' ], null ),
		siteId,
		siteSlug,
		steps,
		token: get( state.jetpackOnboarding.credentials, [ siteId, 'token' ], null ),
	};
} )( JetpackOnboardingMain );
