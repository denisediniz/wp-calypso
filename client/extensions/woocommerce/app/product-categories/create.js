/** @format */

/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { isEmpty, omit, isNumber, isNull } from 'lodash';
import page from 'page';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import { ProtectFormGuard } from 'lib/protect-form';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import {
	clearProductCategoryEdits,
	editProductCategory,
} from 'woocommerce/state/ui/product-categories/actions';
import { createProductCategory } from 'woocommerce/state/sites/product-categories/actions';
import {
	getProductCategoryWithLocalEdits,
	getCurrentlyEditingId,
	getProductCategoryEdits,
} from 'woocommerce/state/ui/product-categories/selectors';
import { getLink } from 'woocommerce/lib/nav-utils';
import ProductCategoryForm from './form';
import ProductCategoryHeader from './header';
import { successNotice, errorNotice } from 'state/notices/actions';
import { getSaveErrorMessage } from './utils';

class ProductCategoryCreate extends React.Component {
	static propTypes = {
		className: PropTypes.string,
		site: PropTypes.shape( {
			ID: PropTypes.number,
			slug: PropTypes.string,
		} ),
		hasEdits: PropTypes.bool,
		category: PropTypes.object,
		editProductCategory: PropTypes.func.isRequired,
		clearProductCategoryEdits: PropTypes.func.isRequired,
	};

	state = {
		busy: false,
	};

	componentDidMount() {
		const { site } = this.props;

		if ( site && site.ID ) {
			this.props.clearProductCategoryEdits( site.ID );
			this.props.editProductCategory( site.ID, null, { parent: 0 } );
		}
	}

	componentWillReceiveProps( newProps ) {
		const { site } = this.props;
		const newSiteId = ( newProps.site && newProps.site.ID ) || null;
		const oldSiteId = ( site && site.ID ) || null;
		if ( oldSiteId !== newSiteId ) {
			this.props.clearProductCategoryEdits( newSiteId );
			this.props.editProductCategory( newSiteId, null, { parent: 0 } );
		}
	}

	componentWillUnmount() {
		const { site } = this.props;

		if ( site ) {
			this.props.clearProductCategoryEdits( site.ID );
		}
	}

	onSave = () => {
		const { site, category, translate } = this.props;
		this.setState( { busy: true } );

		const successAction = () => {
			page.redirect( getLink( '/store/products/categories/:site', site ) );
			return successNotice( translate( 'Category successfully created.' ), {
				displayOnNextPage: true,
				duration: 8000,
			} );
		};

		const failureAction = ( dispatch, getState, passedProps ) => {
			this.setState( { busy: false } );

			const { error } = passedProps;
			const errorSlug = ( error && error.error ) || undefined;

			return errorNotice( getSaveErrorMessage( errorSlug, translate ), {
				duration: 8000,
			} );
		};

		this.props.createProductCategory( site.ID, category, successAction, failureAction );
	};

	render() {
		const { site, category, hasEdits, className } = this.props;
		const { busy } = this.state;

		const saveEnabled =
			hasEdits &&
			category &&
			( category.name && category.name.length ) &&
			! isNull( category.parent );

		return (
			<Main className={ className } wideLayout>
				<ProductCategoryHeader
					site={ site }
					category={ category }
					onSave={ saveEnabled ? this.onSave : false }
					isBusy={ busy }
				/>
				<ProtectFormGuard isChanged={ hasEdits } />
				<ProductCategoryForm
					siteId={ site && site.ID }
					category={ category || { parent: 0 } }
					editProductCategory={ this.props.editProductCategory }
				/>
			</Main>
		);
	}
}

function mapStateToProps( state ) {
	const site = getSelectedSiteWithFallback( state );
	const categoryId = getCurrentlyEditingId( state );
	const category =
		! isNumber( categoryId ) && getProductCategoryWithLocalEdits( state, categoryId );
	const hasEdits = ! isEmpty( omit( getProductCategoryEdits( state, categoryId ), 'id' ) );

	return {
		site,
		category,
		hasEdits,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			editProductCategory,
			clearProductCategoryEdits,
			createProductCategory,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( localize( ProductCategoryCreate ) );
