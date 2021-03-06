import NetInfo from '@react-native-community/netinfo';
import {getUserAuthenticationToken} from '../utils/AuthenticationUtils';
import {insertEventRegistrationDetails,fetchEventRegistrationDetails,updateEventRegistrationDetails} from '../utils/DBUtils';
import configData from "../config/config.json";
import StatusCodes from "../utils/StatusCodes.json";
import Response from '../models/response';
import ExceptionDetails from '../models/exceptionDetails';
import * as loggingActions from '../store/logging-actions';

export const UPDATE_EVENTS_FROM_SERVER='UPDATE_EVENTS_FROM_SERVER';
export const UPDATE_EVENT_REGISTRATION_DETAILS='UPDATE_EVENT_REGISTRATION_DETAILS';
export const UPDATE_RUN_IN_EVENT_REGISTRATION='UPDATE_RUN_IN_EVENT_REGISTRATION';
export const UPDATE_EVENT_RESULT_DETAILS='UPDATE_EVENT_RESULT_DETAILS';
export const UPDATE_EVENT_RESULT_DETAILS_FOR_EVENT='UPDATE_EVENT_RESULT_DETAILS_FOR_EVENT';
export const CLEAN_RESULT_DETAILS_FOR_EVENT_STATE='CLEAN_RESULT_DETAILS_FOR_EVENT_STATE';
export const CLEAN_EVENT_STATE='CLEAN_EVENT_STATE';

import * as userActions from '../store/user-actions';

//Method to Register User For Event and Update details to server
export const registerUserForEvent = (eventDetails) => {
  return async dispatch => {
    var header = await dispatch(getUserAuthenticationToken());
    var userId = header.USER_ID;

    var networkStatus = await NetInfo.fetch().then(state => {
      if (!state.isConnected) {
        return new Response(StatusCodes.NO_INTERNET, null);
      }
    });
    if (networkStatus) {
      return networkStatus;
    }

    var URL = configData.SERVER_URL + "event-registration/registerForEvent/" + eventDetails.eventId + "?userId=" + userId;
    return fetch(URL, {
        method: 'POST',
        headers: header
      }).then(response => response.json())
      .then((response) => {
        if (response.status >= StatusCodes.BAD_REQUEST) {
          if (response.message && response.message.includes("UNAUTHORIZED")) {
            dispatch(userActions.cleanUserDataStateAndDB());
          }
          return new Response(response.status, null);
        } else {
          //Async Dispatch Update Event Registration Details in Local DB
          insertEventRegistrationDetails(eventDetails.eventId, eventDetails.eventName, eventDetails.eventDescription, eventDetails.eventStartDate, eventDetails.eventEndDate, eventDetails.eventMetricType, eventDetails.eventMetricValue, 0);

          var eventRegistrationDetailsList = [];
          eventDetails.runId = 0;
          eventRegistrationDetailsList = eventRegistrationDetailsList.concat(eventDetails);
          //Async Dispatch Update Event Registration State
          dispatch({
            type: UPDATE_EVENT_REGISTRATION_DETAILS,
            eventRegistrationDetails: eventRegistrationDetailsList
          });
          return new Response(StatusCodes.OK, eventDetails);
        }
      }).catch(err => {
        dispatch(loggingActions.sendErrorLogsToServer(new ExceptionDetails(err.message, err.stack)));
        return new Response(StatusCodes.INTERNAL_SERVER_ERROR, null);
      });
  }
};

//Method to Load Available Events from Server
export const loadEventsFromServer = (pageNumber) => {
  return async dispatch => {
    var header = await dispatch(getUserAuthenticationToken());
    var userId = header.USER_ID;

    var networkStatus = await NetInfo.fetch().then(state => {
      if (!state.isConnected) {
        return new Response(StatusCodes.NO_INTERNET, null);
      }
    });
    if (networkStatus) {
      return networkStatus;
    }

    var URL = configData.SERVER_URL + "event-details/getEvents/" + userId + "?page=" + pageNumber;
    return fetch(URL, {
        method: 'GET',
        headers: header
      }).then(response => response.json())
      .then((response) => {
        if (response.status >= StatusCodes.BAD_REQUEST) {
          if (response.message && response.message.includes("UNAUTHORIZED")) {
            dispatch(userActions.cleanUserDataStateAndDB());
          }
          return new Response(response.status, null);
        } else if (response.eventDetails.length > 0) {
          dispatch({
            type: UPDATE_EVENTS_FROM_SERVER,
            eventDetails: response.eventDetails
          });
        }
        return new Response(StatusCodes.OK, response);
      }).catch(err => {
        dispatch(loggingActions.sendErrorLogsToServer(new ExceptionDetails(err.message, err.stack)));
        return new Response(StatusCodes.INTERNAL_SERVER_ERROR, null);
      });
  }
};

//Method to Load Event Registration Details first from local DB, and then from server in case needed and hydrate local DB
export const loadEventRegistrationDetails = () => {
  return async dispatch => {
    //Fetch Event Registration Details from Local DB
    fetchEventRegistrationDetails().then(response => {
        if (response.rows._array.length > 0) {
          var updatedEventRegistrationDetails = response.rows._array.map((eventRegistrationDetails) => {
            var updatedEventRegistration = {
              eventId: eventRegistrationDetails.EVENT_ID,
              eventName: eventRegistrationDetails.EVENT_NAME,
              eventDescription: eventRegistrationDetails.EVENT_DESCRIPTION,
              eventStartDate: eventRegistrationDetails.EVENT_START_DATE,
              eventEndDate: eventRegistrationDetails.EVENT_END_DATE,
              eventMetricType: eventRegistrationDetails.EVENT_METRIC_TYPE,
              eventMetricValue: eventRegistrationDetails.EVENT_METRIC_VALUE,
              runId: eventRegistrationDetails.RUN_ID
            };
            return updatedEventRegistration;
          });
          
          //Async Dispatch Event Registration State Update
          dispatch({
            type: UPDATE_EVENT_REGISTRATION_DETAILS,
            eventRegistrationDetails: updatedEventRegistrationDetails
          });
        }
        //In case there is no data in local store, go to server
        else {
          //Async Dispatch Load Event Registration from Server Action
          dispatch(loadEventRegistrationDetailsFromServer(0)).then((response) => {
            if (response.status >= StatusCodes.BAD_REQUEST) {
              //Do nothing
            } else if (response.data && response.data.length > 0) {
              response.data.map((eventDetails) => {
                //Hydrate Local DB
                insertEventRegistrationDetails(eventDetails.eventId, eventDetails.eventName, eventDetails.eventDescription, eventDetails.eventStartDate, eventDetails.eventEndDate, eventDetails.eventMetricType, eventDetails.eventMetricValue, eventDetails.runId);
              });
            }
          });
        }
      })
      .catch(err => {
         dispatch(loggingActions.sendErrorLogsToServer(new ExceptionDetails(err.message, err.stack)));
      });
  }
};

//Method to Load Event Registration Details from server based on pageNumber provided
export const loadEventRegistrationDetailsFromServer = (pageNumber) => {
  return async dispatch => {
    var header = await dispatch(getUserAuthenticationToken());
    var userId = header.USER_ID;

    var networkStatus = await NetInfo.fetch().then(state => {
      if (!state.isConnected) {
        return new Response(StatusCodes.NO_INTERNET, null);
      }
    });
    if (networkStatus) {
      return networkStatus;
    }

    var URL = configData.SERVER_URL + "event-registration/getRegisteredEventsForUser/" + userId + "?page=" + pageNumber;
    return fetch(URL, {
        method: 'GET',
        headers: header
      }).then(response => response.json())
      .then((response) => {
        if (response.status >= StatusCodes.BAD_REQUEST) {
          return new Response(response.status, null);
        } else if (response.eventRegistrationDetails.length > 0) {
          var updatedEventRegistrationDetails = response.eventRegistrationDetails.map((eventRegistrationDetails) => {
            var updatedEventRegisration = {
              eventId: eventRegistrationDetails.eventDetails.eventId,
              eventName: eventRegistrationDetails.eventDetails.eventName,
              eventDescription: eventRegistrationDetails.eventDetails.eventDescription,
              eventStartDate: eventRegistrationDetails.eventDetails.eventStartDate,
              eventEndDate: eventRegistrationDetails.eventDetails.eventEndDate,
              eventMetricType: eventRegistrationDetails.eventDetails.eventMetricType,
              eventMetricValue: eventRegistrationDetails.eventDetails.eventMetricValue,
              runId: eventRegistrationDetails.runId
            };
            return updatedEventRegisration;
          });

          //Async Dispatch Event Registration Update State
          dispatch({
            type: UPDATE_EVENT_REGISTRATION_DETAILS,
            eventRegistrationDetails: updatedEventRegistrationDetails
          })
        }
        return new Response(StatusCodes.OK, updatedEventRegistrationDetails);
      }).catch(err => {
        dispatch(loggingActions.sendErrorLogsToServer(new ExceptionDetails(err.message, err.stack)));
        return new Response(StatusCodes.INTERNAL_SERVER_ERROR, null);
      });
  }
};

//Method to Load Event Result Details from server
export const loadEventResultDetailsFromServer = (pageNumber) => {
  return async dispatch => {
    var header = await dispatch(getUserAuthenticationToken());
    var userId = header.USER_ID;

    var networkStatus = await NetInfo.fetch().then(state => {
      if (!state.isConnected) {
        return new Response(StatusCodes.NO_INTERNET, null);
      }
    });
    if (networkStatus) {
      return networkStatus;
    }

    var URL = configData.SERVER_URL + "event-results/" + userId + "?page=" + pageNumber;
    return fetch(URL, {
        method: 'GET',
        headers: header
      }).then(response => response.json())
      .then((response) => {
        if (response.status >= StatusCodes.BAD_REQUEST) {
          return new Response(response.status, null);
        } else if (response.eventResultDetails && response.eventResultDetails.length > 0) {
          var updatedEventResultDetails = response.eventResultDetails.map((eventResultDetails) => {
            var updatedEventResult = {
              eventId: eventResultDetails.eventId,
              runId: eventResultDetails.runId,
              userRank: eventResultDetails.userRank,
              eventName: eventResultDetails.eventDetails.eventName
            };
            return updatedEventResult;
          });

          //Async Dispatch Event Result Update State
          dispatch({
            type: UPDATE_EVENT_RESULT_DETAILS,
            eventResultDetails: updatedEventResultDetails
          })
        }
        return new Response(StatusCodes.OK, response);
      }).catch(err => {
        dispatch(loggingActions.sendErrorLogsToServer(new ExceptionDetails(err.message, err.stack)));
        return new Response(StatusCodes.INTERNAL_SERVER_ERROR, null);
      });
  }
};

//Method to Load Event Result Details from server
export const loadEventResultDetailsFromServerBasedOnEventId = (eventId, pageNumber) => {
  return async dispatch => {
    var header = await dispatch(getUserAuthenticationToken());
    var userId = header.USER_ID;

    var networkStatus = await NetInfo.fetch().then(state => {
      if (!state.isConnected) {
        return new Response(StatusCodes.NO_INTERNET, null);
      }
    });
    if (networkStatus) {
      return networkStatus;
    }

    var URL = configData.SERVER_URL + "event-results/eventId/" + eventId + "?page=" + pageNumber;
    return fetch(URL, {
        method: 'GET',
        headers: header
      }).then(response => response.json())
      .then((response) => {
        if (response.status >= StatusCodes.BAD_REQUEST) {
          return new Response(response.status, null);
        } else if (response.eventResultDetailsWithUserDetails && response.eventResultDetailsWithUserDetails.length > 0) {
          var updatedEventResultDetails = response.eventResultDetailsWithUserDetails.map((eventResultDetails) => {
            var updatedEventResult = {
              eventId: eventResultDetails.eventId,
              userId: eventResultDetails.userId,
              userFirstName: eventResultDetails.userFirstName,
              userLastName: eventResultDetails.userLastName,
              userRank: eventResultDetails.userRank,
              runTotalTime: eventResultDetails.runTotalTime
            };
            return updatedEventResult;
          });

          //Async Dispatch Event Result Update State
          dispatch({
            type: UPDATE_EVENT_RESULT_DETAILS_FOR_EVENT,
            eventResultDetailsWithUserDetails: updatedEventResultDetails
          })
        }
        return new Response(StatusCodes.OK, response);
      }).catch(err => {
        dispatch(loggingActions.sendErrorLogsToServer(new ExceptionDetails(err.message, err.stack)));
        return new Response(StatusCodes.INTERNAL_SERVER_ERROR, null);
      });
  }
};

//Method to Update Run Id in Event Registration
export const updateRunDetailsInEventRegistration = (eventId, runId) => {
  return async dispatch => {
    var updatedEventRegistrationDetails = {
      eventId: eventId,
      runId: runId
    };
    //Async Dispatch Update Event Registration Details in Local DB
    updateEventRegistrationDetails(eventId, runId);

    //Async Dispatch Update Event Registration State
    dispatch({
      type: UPDATE_RUN_IN_EVENT_REGISTRATION,
      updatedEventRegistrationDetails: updatedEventRegistrationDetails
    });
  }
};

//Utility Method to cleanup Event Result Details State
export const cleanEventResultState= (navigation, dispatch) => {
  return async dispatch => {
    dispatch({type: CLEAN_RESULT_DETAILS_FOR_EVENT_STATE});
  };
};