import {UPDATE_USER_DETAILS, CLEAN_USER_STATE} from './user-actions';
import UserDetails from '../models/userDetails';

const initialState = {
	userDetails: {}
};

export default (state = initialState, action) => {
	switch (action.type) {
		case UPDATE_USER_DETAILS:
			return new UserDetails(action.userDetails.userFirstName, action.userDetails.userLastName, action.userDetails.userHeight, action.userDetails.userWeight);

		case CLEAN_USER_STATE:
			return new UserDetails(null, null, null, null);

		default:
			return state;
	}
	return state;
};