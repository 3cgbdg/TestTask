import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IEvent } from "../types/events";

interface IinitialState {
    events: IEvent[] | null,
}

const initialState: IinitialState = {
    events: null,
}

const eventsSlice = createSlice({
    name: "events",
    initialState,
    reducers: {
        setEvents: (state, action: PayloadAction<IEvent[]>) => {
            state.events = action.payload;
        },
        addEvent: (state, action: PayloadAction<IEvent>) => {
            if (state.events) {
                state.events = [action.payload, ...state.events];
            } else {
                state.events = [action.payload];
            }
        },
        updateEvent: (state, action: PayloadAction<IEvent>) => {
            if (state.events) {
                state.events = state.events.map(event =>
                    event.id === action.payload.id ? action.payload : event
                );
            }
        },
        removeEvent: (state, action: PayloadAction<string>) => {
            if (state.events) {
                state.events = state.events.filter(event => event.id !== action.payload);
            }
        },
    }
})

export const { setEvents, addEvent, updateEvent, removeEvent } = eventsSlice.actions;
export default eventsSlice.reducer;
