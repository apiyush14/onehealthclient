import {
    UPDATE_RUN_DETAILS,
    UPDATE_RUN_SUMMARY,
    LOAD_RUN_SUMMARY,
    UPDATE_RUN_SYNC_STATE
} from './run-actions';
import RunDetails from '../models/rundetails';
import RunSummary from '../models/runsummary';

const initialState = {
    runs: [],
    runSummary: null
};

export default (state = initialState, action) => {
    switch (action.type) {

        case UPDATE_RUN_DETAILS:
            //console.log('===============Inside Update Run Details====================');

            var updatedRuns = action.runs.map((run) => {
                //console.log(run);
                if (state.runs.findIndex(stateRun => stateRun.runId === run.runId) < 0) {
                    //console.log('Going to update Run');
                    console.log(run.runId);
                    var pathArr = run.runPath.split(";");
                    var path = pathArr.map(loc => {
                        var locationArr = loc.split(",");
                        var location = {
                            latitude: parseFloat(locationArr[0]),
                            longitude: parseFloat(locationArr[1])
                        };
                        return location;
                    });
                    return new RunDetails(run.runId, run.runTotalTime, run.runDistance, run.runPace, run.runCaloriesBurnt, run.runCredits, run.runStartDateTime, run.runDate, run.runDay, path, run.runTrackSnapUrl,run.eventId,run.isSyncDone);
                }
            }).filter(updatedRun => updatedRun !== undefined);
            state.runs = state.runs.concat(updatedRuns);
            state.runs.sort(function(a, b) {
                return new Date(b.runStartDateTime) - new Date(a.runStartDateTime);
            });
            //console.log(state.runs);
            return state;

        case UPDATE_RUN_SUMMARY:
            const updatedSummary = action.runSummary;
            return { ...state,
                runSummary: new RunSummary("1", updatedSummary.totalDistance.toString(), updatedSummary.totalRuns.toString(),updatedSummary.totalCredits.toString(), updatedSummary.averagePace.toString(), updatedSummary.averageDistance.toString(), updatedSummary.averageCaloriesBurnt.toString())
            };

        case UPDATE_RUN_SYNC_STATE:
            let i;
            const pendingRunsForSync = action.pendingRunsForSync;
            for (i = 0; i < pendingRunsForSync.length; i++) {
                let runToBeUpdatedIndex = state.runs.findIndex(run => run.runId === pendingRunsForSync[i].runId);
                state.runs[runToBeUpdatedIndex].isSyncDone = "1";
            }
            return state;

        case 'USER_LOG_OUT':
            console.log('==================User Log Out Called in Run Reducer============');
            return initialState;

        default:
            return state;
    }
    return state;
};