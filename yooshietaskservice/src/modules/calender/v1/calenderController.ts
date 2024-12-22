"use strict";

import { MESSAGES } from "@config/constant";
import { calendarDaoV1 } from "..";

export class CalenderController {
  /**
   * @function addCalenderEVents
   */
  async addCalenderEVents(params: CalenderRequest.AddEvents) {
    try {
      await calendarDaoV1.storeEvents(params);
      return MESSAGES.SUCCESS.ADD_CALENDER;
    } catch (error) {
      console.log("Error in calender", error);
      throw error;
    }
  }
}

export const calenderController = new CalenderController();
