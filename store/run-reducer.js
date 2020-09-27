import {ADD_RUN,LOAD_RUNS,UPDATE_SUMMARY,LOAD_RUN_SUMMARY} from './run-actions';
import RunDetails from '../models/rundetails';
import RunSummary from '../models/runsummary';

const initialState={
	runs:[],
    runSummary: null
};

export default (state=initialState, action)=>{
	switch(action.type) {
		case ADD_RUN:
        console.log('Add Run');
        console.log(action.run);
        const newRun=new RunDetails(action.run.runId, action.run.runTotalTime,action.run.runDistance,action.run.runPace,action.run.runCaloriesBurnt,action.run.runCredits, action.run.runDate, action.run.runDay, action.run.runPath, action.run.runTrackSnapUrl);
        
        return{...state, 
            runs: state.runs.concat(newRun)
        };

        case LOAD_RUNS:
        console.log('Load Runs');
        console.log(action.runs);
        return {...state, 
            runs: action.runs[0].map((run)=>
                {  
                    var pathArr=run.RUN_PATH.split(";");

                    var path=pathArr.map(loc=>{
                        var locationArr=loc.split(",");
                        var location={
                            latitude: parseFloat(locationArr[0]),
                            longitude: parseFloat(locationArr[1])
                        };
                        return location;
                    });

                    //console.log('Final Path Array after conversion is ');
                    //console.log(path);
                    return new RunDetails(run.RUN_ID, run.RUN_TOTAL_TIME,run.RUN_DISTANCE,run.RUN_PACE,run.RUN_CALORIES_BURNT,run.RUN_CREDITS,run.RUN_DATE, run.RUN_DAY, path, run.RUN_TRACK_SNAP_URL);})
        };

        case UPDATE_SUMMARY:
        //console.log("Updating Summary");
        //console.log(action.runSummary);
        const updatedSummary=action.runSummary;
        //const updatedSummary=new RunSummary(action.runSummary.id.toString(),action.runSummary.TOTAL_DISTANCE.toString(), action.runSummary.TOTAL_RUNS.toString(),action.runSummary.AVERAGE_PACE.toString(),action.runSummary.AVERAGE_DISTANCE.toString())
        return {...state,
             runSummary: new RunSummary(updatedSummary.id.toString(), updatedSummary.TOTAL_DISTANCE.toString(), updatedSummary.TOTAL_RUNS.toString(),updatedSummary.AVERAGE_PACE.toString(),updatedSummary.AVERAGE_DISTANCE.toString())
        };

        case LOAD_RUN_SUMMARY:
        const loadedSummary=action.runSummary;
        return {...state,
             runSummary: new RunSummary(loadedSummary.id.toString(), loadedSummary.TOTAL_DISTANCE.toString(),loadedSummary.TOTAL_RUNS.toString(),loadedSummary.AVERAGE_PACE.toString(),loadedSummary.AVERAGE_DISTANCE.toString())
        };

		default:
		return state;
	}
	return state;
};